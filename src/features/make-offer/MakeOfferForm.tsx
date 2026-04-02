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
    <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-[0.24em] text-slate-500 uppercase">
            Make Offer
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            Lock Token A and ask for Token B
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This form builds a real `make_offer` Devnet transaction with
            `@solana/kit` and sends it through the connected wallet.
          </p>
        </div>

        <div className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
          {connectedWallet ? 'Wallet ready' : 'Wallet required'}
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800">
            Token A account
          </span>
          <select
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-500"
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
          <span className="text-sm font-medium text-slate-800">
            Token A amount to offer
          </span>
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500"
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
          <span className="text-sm font-medium text-slate-800">
            Token B mint address
          </span>
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-950 outline-none transition placeholder:font-sans placeholder:text-slate-400 focus:border-teal-500"
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
          <span className="text-sm font-medium text-slate-800">
            Token B amount requested
          </span>
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500"
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
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            Selected Token A mint: {selectedTokenAccount.mint}
            <br />
            Available balance: {selectedTokenAccount.uiAmount}
            <br />
            Token program: {selectedTokenAccount.programId}
          </div>
        ) : null}

        {tokenAccountsError ? (
          <div className="rounded-3xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {tokenAccountsError}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        ) : null}

        {submittedTransaction ? (
          <div className="rounded-3xl border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-950">
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
    </article>
  )
}
