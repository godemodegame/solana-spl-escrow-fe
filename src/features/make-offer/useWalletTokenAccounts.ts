import { address } from '@solana/kit'
import { useEffect, useState } from 'react'

import { rpc } from '../../lib/solana/rpc'
import {
  LEGACY_TOKEN_PROGRAM_ADDRESS,
  TOKEN_2022_PROGRAM_ADDRESS,
  TOKEN_PROGRAMS,
} from '../../lib/solana/token'
import { formatTokenAmount } from '../../lib/utils/amounts'
import type { WalletTokenAccount } from '../../types/escrow'

export function useWalletTokenAccounts(ownerAddress: string | null) {
  const [tokenAccounts, setTokenAccounts] = useState<WalletTokenAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ownerAddress) {
      setTokenAccounts([])
      setError(null)
      return
    }

    const validatedOwnerAddress = ownerAddress
    let cancelled = false

    async function fetchTokenAccounts() {
      setIsLoading(true)
      setError(null)

      try {
        const owner = address(validatedOwnerAddress)

        const responses = await Promise.all(
          TOKEN_PROGRAMS.map((programId) =>
            rpc
              .getTokenAccountsByOwner(
                owner,
                { programId: address(programId) },
                { encoding: 'jsonParsed' },
              )
              .send(),
          ),
        )

        if (cancelled) {
          return
        }

        const nextAccounts = responses
          .flatMap((response, index) =>
            response.value.map((accountInfo) => {
              const parsed = accountInfo.account.data.parsed.info
              const amount = BigInt(parsed.tokenAmount.amount)
              const decimals = parsed.tokenAmount.decimals

              return {
                address: accountInfo.pubkey,
                amount,
                decimals,
                mint: parsed.mint,
                programId:
                  index === 0
                    ? LEGACY_TOKEN_PROGRAM_ADDRESS
                    : TOKEN_2022_PROGRAM_ADDRESS,
                uiAmount: formatTokenAmount(amount, decimals),
              } satisfies WalletTokenAccount
            }),
          )
          .filter((accountInfo) => accountInfo.amount > 0n)
          .sort((left, right) =>
            left.amount === right.amount ? 0 : left.amount > right.amount ? -1 : 1,
          )

        setTokenAccounts(nextAccounts)
      } catch (fetchError) {
        if (cancelled) {
          return
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to load token accounts.',
        )
        setTokenAccounts([])
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchTokenAccounts()

    return () => {
      cancelled = true
    }
  }, [ownerAddress])

  return { error, isLoading, tokenAccounts }
}
