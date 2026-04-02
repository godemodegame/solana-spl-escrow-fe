import {
  AccountRole,
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createTransactionMessage,
  getAddressEncoder,
  getProgramDerivedAddress,
  getTransactionEncoder,
  getU64Encoder,
  getUtf8Encoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit'

import type { SubmittedTransaction, WalletTokenAccount } from '../../types/escrow'
import { parseTokenAmount } from '../utils/amounts'
import { ESCROW_PROGRAM_ADDRESS, getExplorerUrl } from './constants'
import { rpc } from './rpc'
import { ASSOCIATED_TOKEN_PROGRAM_ADDRESS } from './token'

const makeOfferDiscriminator = new Uint8Array([214, 98, 97, 35, 59, 12, 44, 178])

const addressEncoder = getAddressEncoder()
const utf8Encoder = getUtf8Encoder()
const u64Encoder = getU64Encoder()

type MakeOfferParams = {
  makerAddress: string
  selectedTokenAccount: WalletTokenAccount
  signAndSendTransaction: (transactionBytes: Uint8Array) => Promise<string>
  tokenAAmount: string
  tokenBMintAddress: string
  tokenBWantedAmount: string
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
