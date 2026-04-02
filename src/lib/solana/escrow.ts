import {
  AccountRole,
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createTransactionMessage,
  fixCodecSize,
  getAddressCodec,
  getAddressEncoder,
  getBase64Encoder,
  getBytesCodec,
  getProgramDerivedAddress,
  getStructCodec,
  getTransactionEncoder,
  getU8Codec,
  getU64Codec,
  getU64Encoder,
  getUtf8Encoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit'
import bs58 from 'bs58'

import type {
  OfferViewModel,
  SubmittedTransaction,
  WalletTokenAccount,
} from '../../types/escrow'
import { formatTokenAmount, parseTokenAmount } from '../utils/amounts'
import { ESCROW_PROGRAM_ADDRESS, getExplorerUrl } from './constants'
import { rpc } from './rpc'
import { ASSOCIATED_TOKEN_PROGRAM_ADDRESS } from './token'

const makeOfferDiscriminator = new Uint8Array([214, 98, 97, 35, 59, 12, 44, 178])
const takeOfferDiscriminator = new Uint8Array([128, 156, 242, 207, 237, 192, 103, 240])
const offerAccountDiscriminator = new Uint8Array([215, 88, 60, 71, 170, 162, 73, 229])

const addressEncoder = getAddressEncoder()
const base64Encoder = getBase64Encoder()
const utf8Encoder = getUtf8Encoder()
const u64Encoder = getU64Encoder()
const u64Decoder = getU64Codec()
const offerAccountCodec = getStructCodec([
  ['discriminator', fixCodecSize(getBytesCodec(), 8)],
  ['id', getU64Codec()],
  ['maker', getAddressCodec()],
  ['tokenMintA', getAddressCodec()],
  ['tokenMintB', getAddressCodec()],
  ['tokenBWantedAmount', getU64Codec()],
  ['bump', getU8Codec()],
])

type MakeOfferParams = {
  makerAddress: string
  selectedTokenAccount: WalletTokenAccount
  signAndSendTransaction: (transactionBytes: Uint8Array) => Promise<string>
  tokenAAmount: string
  tokenBMintAddress: string
  tokenBWantedAmount: string
}

type TakeOfferParams = {
  offer: OfferViewModel
  signAndSendTransaction: (transactionBytes: Uint8Array) => Promise<string>
  takerAddress: string
}

type RpcProgramAccount = {
  account: {
    data: [string, string]
  }
  pubkey: string
}

function encodeMakeOfferInstructionData(
  id: bigint,
  tokenAOfferedAmount: bigint,
  tokenBWantedAmount: bigint,
) {
  const encodedId = u64Encoder.encode(id)
  const encodedOfferedAmount = u64Encoder.encode(tokenAOfferedAmount)
  const encodedWantedAmount = u64Encoder.encode(tokenBWantedAmount)

  return new Uint8Array([
    ...makeOfferDiscriminator,
    ...encodedId,
    ...encodedOfferedAmount,
    ...encodedWantedAmount,
  ])
}

function encodeTakeOfferInstructionData() {
  return new Uint8Array([...takeOfferDiscriminator])
}

function decodeBase64Bytes(encoded: string) {
  return base64Encoder.encode(encoded)
}

function getTokenAccountAmountFromBytes(data: Uint8Array) {
  return u64Decoder.decode(data.slice(64, 72))
}

export async function deriveOfferAddress(makerAddress: string, id: bigint) {
  const [offerAddress] = await getProgramDerivedAddress({
    programAddress: address(ESCROW_PROGRAM_ADDRESS),
    seeds: [
      utf8Encoder.encode('offer'),
      addressEncoder.encode(address(makerAddress)),
      u64Encoder.encode(id),
    ],
  })

  return offerAddress
}

export async function deriveAssociatedTokenAddress(
  ownerAddress: string,
  mintAddress: string,
  tokenProgramAddress: string,
) {
  const [associatedTokenAddress] = await getProgramDerivedAddress({
    programAddress: address(ASSOCIATED_TOKEN_PROGRAM_ADDRESS),
    seeds: [
      addressEncoder.encode(address(ownerAddress)),
      addressEncoder.encode(address(tokenProgramAddress)),
      addressEncoder.encode(address(mintAddress)),
    ],
  })

  return associatedTokenAddress
}

async function fetchMintDecimals(mintAddress: string) {
  const response = await rpc.getTokenSupply(address(mintAddress)).send()
  return response.value.decimals
}

async function fetchMintOwnerProgram(mintAddress: string) {
  const response = await rpc
    .getAccountInfo(address(mintAddress), { encoding: 'base64' })
    .send()

  if (!response.value) {
    throw new Error('Token B mint account was not found on Devnet.')
  }

  return response.value.owner
}

async function fetchTokenProgramsForMints(mintAddresses: string[]) {
  const uniqueMintAddresses = [...new Set(mintAddresses)]
  const mintAccounts = await rpc
    .getMultipleAccounts(uniqueMintAddresses.map((mintAddress) => address(mintAddress)), {
      encoding: 'base64',
    })
    .send()

  const tokenPrograms = new Map<string, string>()

  uniqueMintAddresses.forEach((mintAddress, index) => {
    const accountInfo = mintAccounts.value[index]
    if (accountInfo) {
      tokenPrograms.set(mintAddress, accountInfo.owner)
    }
  })

  return tokenPrograms
}

async function fetchMintDecimalsMap(mintAddresses: string[]) {
  const uniqueMintAddresses = [...new Set(mintAddresses)]
  const entries = await Promise.all(
    uniqueMintAddresses.map(async (mintAddress) => [
      mintAddress,
      await fetchMintDecimals(mintAddress),
    ] as const),
  )

  return new Map(entries)
}

function mapMakeOfferError(error: unknown) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'The make offer transaction failed.'
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('reject') ||
    normalizedMessage.includes('declined') ||
    normalizedMessage.includes('denied')
  ) {
    return 'Transaction was rejected in the wallet.'
  }

  if (
    normalizedMessage.includes('blockhash') ||
    normalizedMessage.includes('expired') ||
    normalizedMessage.includes('block height exceeded')
  ) {
    return 'Transaction failed because the blockhash became stale. Please try again.'
  }

  if (
    normalizedMessage.includes('insufficient') ||
    normalizedMessage.includes('funds') ||
    normalizedMessage.includes('balance')
  ) {
    return 'Insufficient balance for this offer.'
  }

  return message
}

function mapTakeOfferError(error: unknown) {
  return mapMakeOfferError(error)
}

export async function submitMakeOffer({
  makerAddress,
  selectedTokenAccount,
  signAndSendTransaction,
  tokenAAmount,
  tokenBMintAddress,
  tokenBWantedAmount,
}: MakeOfferParams): Promise<SubmittedTransaction> {
  try {
    const validatedTokenBMint = address(tokenBMintAddress.trim())
    const maker = address(makerAddress)
    const tokenMintA = address(selectedTokenAccount.mint)
    const tokenProgram = address(selectedTokenAccount.programId)
    const id = BigInt(Date.now())

    const [tokenBMintDecimals, tokenBMintOwnerProgram] = await Promise.all([
      fetchMintDecimals(validatedTokenBMint),
      fetchMintOwnerProgram(validatedTokenBMint),
    ])

    if (tokenBMintOwnerProgram !== tokenProgram) {
      throw new Error(
        'Token B must use the same token program as the selected Token A account.',
      )
    }

    const tokenAOfferedAmount = parseTokenAmount(
      tokenAAmount,
      selectedTokenAccount.decimals,
    )
    const tokenBWantedAmountRaw = parseTokenAmount(
      tokenBWantedAmount,
      tokenBMintDecimals,
    )

    if (tokenAOfferedAmount <= 0n || tokenBWantedAmountRaw <= 0n) {
      throw new Error('Both token amounts must be greater than zero.')
    }

    if (tokenAOfferedAmount > selectedTokenAccount.amount) {
      throw new Error('Insufficient balance for the selected Token A account.')
    }

    const offerAddress = await deriveOfferAddress(maker, id)
    const vaultAddress = await deriveAssociatedTokenAddress(
      offerAddress,
      tokenMintA,
      tokenProgram,
    )

    const instruction = {
      accounts: [
        { address: maker, role: AccountRole.WRITABLE_SIGNER },
        { address: tokenMintA, role: AccountRole.READONLY },
        { address: validatedTokenBMint, role: AccountRole.READONLY },
        { address: address(selectedTokenAccount.address), role: AccountRole.WRITABLE },
        { address: offerAddress, role: AccountRole.WRITABLE },
        { address: vaultAddress, role: AccountRole.WRITABLE },
        {
          address: address(ASSOCIATED_TOKEN_PROGRAM_ADDRESS),
          role: AccountRole.READONLY,
        },
        { address: tokenProgram, role: AccountRole.READONLY },
        {
          address: address('11111111111111111111111111111111'),
          role: AccountRole.READONLY,
        },
      ],
      data: encodeMakeOfferInstructionData(
        id,
        tokenAOfferedAmount,
        tokenBWantedAmountRaw,
      ),
      programAddress: address(ESCROW_PROGRAM_ADDRESS),
    }

    const { value: latestBlockhash } = await rpc
      .getLatestBlockhash({ commitment: 'confirmed' })
      .send()

    const transactionMessage = pipe(
      createTransactionMessage({ version: 'legacy' }),
      (message) => setTransactionMessageFeePayer(maker, message),
      (message) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message),
      (message) => appendTransactionMessageInstruction(instruction, message),
    )

    const transaction = compileTransaction(transactionMessage)
    const wireTransaction = getTransactionEncoder().encode(transaction)
    const signature = await signAndSendTransaction(
      new Uint8Array(wireTransaction),
    )

    return {
      explorerUrl: getExplorerUrl(`/tx/${signature}`),
      signature,
    }
  } catch (error) {
    throw new Error(mapMakeOfferError(error))
  }
}

export async function fetchOpenOffers(): Promise<OfferViewModel[]> {
  const discriminator = bs58.encode(offerAccountDiscriminator)
  const response = (await rpc
    .getProgramAccounts(address(ESCROW_PROGRAM_ADDRESS), {
      encoding: 'base64',
      filters: [
        {
          memcmp: {
            bytes: discriminator as never,
            encoding: 'base58',
            offset: 0n,
          },
        },
      ],
    })
    .send()) as unknown as RpcProgramAccount[]

  if (response.length === 0) {
    return []
  }

  const decodedOffers = response.map((programAccount) => {
    const accountBytes = decodeBase64Bytes(programAccount.account.data[0])
    const decodedOffer = offerAccountCodec.decode(accountBytes)

    return {
      address: programAccount.pubkey,
      id: decodedOffer.id,
      maker: String(decodedOffer.maker),
      requestedAmount: decodedOffer.tokenBWantedAmount,
      tokenAMint: String(decodedOffer.tokenMintA),
      tokenBMint: String(decodedOffer.tokenMintB),
    }
  })

  const [tokenProgramsByMint, decimalsByMint] = await Promise.all([
    fetchTokenProgramsForMints(
      decodedOffers.flatMap((offer) => [offer.tokenAMint, offer.tokenBMint]),
    ),
    fetchMintDecimalsMap(
      decodedOffers.flatMap((offer) => [offer.tokenAMint, offer.tokenBMint]),
    ),
  ])

  const vaultAddresses = await Promise.all(
    decodedOffers.map((offer) => {
      const tokenProgram = tokenProgramsByMint.get(offer.tokenAMint)
      if (!tokenProgram) {
        throw new Error(`Token program not found for mint ${offer.tokenAMint}`)
      }

      return deriveAssociatedTokenAddress(
        offer.address,
        offer.tokenAMint,
        tokenProgram,
      )
    }),
  )

  const vaultAccounts = await rpc
    .getMultipleAccounts(vaultAddresses.map((vaultAddress) => address(vaultAddress)), {
      encoding: 'base64',
    })
    .send()

  const hydratedOffers = decodedOffers.map((offer, index) => {
      const vaultAccount = vaultAccounts.value[index]
      const tokenProgram = tokenProgramsByMint.get(offer.tokenAMint)
      const tokenADecimals = decimalsByMint.get(offer.tokenAMint)
      const tokenBDecimals = decimalsByMint.get(offer.tokenBMint)

      if (!vaultAccount || !tokenProgram || tokenADecimals == null || tokenBDecimals == null) {
        return null
      }

      const offeredAmount = getTokenAccountAmountFromBytes(
        new Uint8Array(decodeBase64Bytes(vaultAccount.data[0])),
      )

      if (offeredAmount <= 0n) {
        return null
      }

      return {
        address: offer.address,
        id: offer.id,
        maker: offer.maker,
        offeredAmount,
        offeredAmountUi: formatTokenAmount(offeredAmount, tokenADecimals),
        requestedAmount: offer.requestedAmount,
        requestedAmountUi: formatTokenAmount(offer.requestedAmount, tokenBDecimals),
        tokenAMint: offer.tokenAMint,
        tokenBMint: offer.tokenBMint,
        tokenProgram,
      } satisfies OfferViewModel
    })

  return hydratedOffers.filter((offer) => offer !== null)
}

export async function submitTakeOffer({
  offer,
  signAndSendTransaction,
  takerAddress,
}: TakeOfferParams): Promise<SubmittedTransaction> {
  try {
    const taker = address(takerAddress)
    const maker = address(offer.maker)
    const tokenMintA = address(offer.tokenAMint)
    const tokenMintB = address(offer.tokenBMint)
    const tokenProgram = address(offer.tokenProgram)
    const offerAddress = address(offer.address)

    const [tokenBMintOwnerProgram, takerTokenAccountA, takerTokenAccountB, makerTokenAccountB, vaultAddress] =
      await Promise.all([
        fetchMintOwnerProgram(tokenMintB),
        deriveAssociatedTokenAddress(taker, tokenMintA, tokenProgram),
        deriveAssociatedTokenAddress(taker, tokenMintB, tokenProgram),
        deriveAssociatedTokenAddress(maker, tokenMintB, tokenProgram),
        deriveAssociatedTokenAddress(offerAddress, tokenMintA, tokenProgram),
      ])

    if (tokenBMintOwnerProgram !== tokenProgram) {
      throw new Error('Offer mints use incompatible token programs.')
    }

    const instruction = {
      accounts: [
        { address: taker, role: AccountRole.WRITABLE_SIGNER },
        { address: maker, role: AccountRole.WRITABLE },
        { address: tokenMintA, role: AccountRole.READONLY },
        { address: tokenMintB, role: AccountRole.READONLY },
        { address: takerTokenAccountA, role: AccountRole.WRITABLE },
        { address: takerTokenAccountB, role: AccountRole.WRITABLE },
        { address: makerTokenAccountB, role: AccountRole.WRITABLE },
        { address: offerAddress, role: AccountRole.WRITABLE },
        { address: vaultAddress, role: AccountRole.WRITABLE },
        {
          address: address(ASSOCIATED_TOKEN_PROGRAM_ADDRESS),
          role: AccountRole.READONLY,
        },
        { address: tokenProgram, role: AccountRole.READONLY },
        {
          address: address('11111111111111111111111111111111'),
          role: AccountRole.READONLY,
        },
      ],
      data: encodeTakeOfferInstructionData(),
      programAddress: address(ESCROW_PROGRAM_ADDRESS),
    }

    const { value: latestBlockhash } = await rpc
      .getLatestBlockhash({ commitment: 'confirmed' })
      .send()

    const transactionMessage = pipe(
      createTransactionMessage({ version: 'legacy' }),
      (message) => setTransactionMessageFeePayer(taker, message),
      (message) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message),
      (message) => appendTransactionMessageInstruction(instruction, message),
    )

    const transaction = compileTransaction(transactionMessage)
    const wireTransaction = getTransactionEncoder().encode(transaction)
    const signature = await signAndSendTransaction(new Uint8Array(wireTransaction))

    return {
      explorerUrl: getExplorerUrl(`/tx/${signature}`),
      signature,
    }
  } catch (error) {
    throw new Error(mapTakeOfferError(error))
  }
}
