import { isAddress } from '@solana/kit'
import { useEffect, useState } from 'react'

import { Button } from '../../components/ui/button'
import { submitMakeOffer } from '../../lib/solana/escrow'
import type { MakeOfferFormState, SubmittedTransaction } from '../../types/escrow'
import { useWallet } from '../wallet/WalletContext'
import { useWalletTokenAccounts } from './useWalletTokenAccounts'

type MakeOfferFormProps = {
  onOfferCreated?: () => void
}

const initialFormState: MakeOfferFormState = {
  selectedTokenAccountAddress: '',
  tokenAAmount: '',
  tokenBMint: '',
  tokenBAmount: '',
}

export function MakeOfferForm({ onOfferCreated }: MakeOfferFormProps) {
  const { account, connectedWallet, signAndSendTransaction } = useWallet()
  const { error: tokenAccountsError, isLoading, tokenAccounts } =
    useWalletTokenAccounts(account?.address ?? null)

  const [formState, setFormState] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedTransaction, setSubmittedTransaction] =
    useState<SubmittedTransaction | null>(null)

  useEffect(() => {
    if (!formState.selectedTokenAccountAddress && tokenAccounts.length > 0) {
      setFormState((currentState) => ({
        ...currentState,
        selectedTokenAccountAddress: tokenAccounts[0].address,
      }))
    }
  }, [formState.selectedTokenAccountAddress, tokenAccounts])

  const selectedTokenAccount =
    tokenAccounts.find(
      (tokenAccount) => tokenAccount.address === formState.selectedTokenAccountAddress,
    ) ?? null

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!account) {
      setError('Connect a wallet before creating an offer.')
      return
    }

    if (!selectedTokenAccount) {
      setError('Choose a Token A account from your wallet.')
      return
    }

    if (!isAddress(formState.tokenBMint.trim())) {
      setError('Token B mint must be a valid Solana address.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSubmittedTransaction(null)

    try {
      const transaction = await submitMakeOffer({
        makerAddress: account.address,
        selectedTokenAccount,
        signAndSendTransaction,
        tokenAAmount: formState.tokenAAmount,
        tokenBMintAddress: formState.tokenBMint,
        tokenBWantedAmount: formState.tokenBAmount,
      })

      setSubmittedTransaction(transaction)
      onOfferCreated?.()
      setFormState((currentState) => ({
        ...currentState,
        tokenAAmount: '',
        tokenBAmount: '',
      }))
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Make offer transaction failed.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <article className="retro-window overflow-hidden">
      <div className="retro-titlebar flex items-start justify-between gap-4 px-3 py-2 sm:px-4">
        <div className="text-xs font-bold uppercase tracking-[0.16em]">
          Make Offer
        </div>
        <div className="text-[11px] font-bold uppercase text-blue-50/90">
          {connectedWallet ? 'Wallet ready' : 'Wallet required'}
        </div>
      </div>

      <div className="p-3 sm:p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Lock Token A and ask for Token B
          </h2>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-800">
            Token A account
          </span>
          <select
            className="retro-inset w-full px-3 py-3 text-sm text-slate-950 outline-none"
            disabled={!account || isLoading || tokenAccounts.length === 0}
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                selectedTokenAccountAddress: event.target.value,
              }))
            }
            value={formState.selectedTokenAccountAddress}
          >
            {tokenAccounts.length === 0 ? (
              <option value="">No token accounts with balance found</option>
            ) : null}

            {tokenAccounts.map((tokenAccount) => (
              <option key={tokenAccount.address} value={tokenAccount.address}>
                {tokenAccount.mint} • balance {tokenAccount.uiAmount}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-800">
            Token A amount to offer
          </span>
          <input
            className="retro-inset w-full px-3 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-500"
            inputMode="decimal"
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                tokenAAmount: event.target.value,
              }))
            }
            placeholder="0.0"
            value={formState.tokenAAmount}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-800">
            Token B mint address
          </span>
          <input
            className="retro-inset w-full px-3 py-3 font-mono text-sm text-slate-950 outline-none placeholder:font-sans placeholder:text-slate-500"
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                tokenBMint: event.target.value,
              }))
            }
            placeholder="Enter SPL mint address"
            value={formState.tokenBMint}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-800">
            Token B amount requested
          </span>
          <input
            className="retro-inset w-full px-3 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-500"
            inputMode="decimal"
            onChange={(event) =>
              setFormState((currentState) => ({
                ...currentState,
                tokenBAmount: event.target.value,
              }))
            }
            placeholder="0.0"
            value={formState.tokenBAmount}
          />
        </label>

        {selectedTokenAccount ? (
          <div className="retro-inset px-4 py-3 text-sm leading-6 text-slate-700">
            Selected Token A mint: {selectedTokenAccount.mint}
            <br />
            Available balance: {selectedTokenAccount.uiAmount}
            <br />
            Token program: {selectedTokenAccount.programId}
          </div>
        ) : null}

        {tokenAccountsError ? (
          <div className="retro-inset border-[color:#b08a3a] bg-[#efe2b7] px-4 py-3 text-sm text-[#674b07]">
            {tokenAccountsError}
          </div>
        ) : null}

        {error ? (
          <div className="retro-inset border-[color:#b75b5b] bg-[#f0d1d1] px-4 py-3 text-sm text-[#6d2020]">
            {error}
          </div>
        ) : null}

        {submittedTransaction ? (
          <div className="retro-inset border-[color:#578663] bg-[#d7e8d8] px-4 py-3 text-sm text-[#1d4d2a]">
            Transaction sent:{' '}
            <a
              className="font-medium underline"
              href={submittedTransaction.explorerUrl}
              rel="noreferrer"
              target="_blank"
            >
              {submittedTransaction.signature}
            </a>
          </div>
        ) : null}

        <Button
          className="w-full justify-center py-3"
          disabled={!account || isLoading || isSubmitting || !selectedTokenAccount}
          type="submit"
        >
          {isSubmitting ? 'Sending make_offer...' : 'Create Offer'}
        </Button>
      </form>
      </div>
    </article>
  )
}
