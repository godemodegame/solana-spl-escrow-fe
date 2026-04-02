import { useEffect, useState } from 'react'

import { Button } from '../../components/ui/button'
import { fetchOpenOffers, submitTakeOffer } from '../../lib/solana/escrow'
import type { OfferViewModel, SubmittedTransaction } from '../../types/escrow'
import { useWallet } from '../wallet/WalletContext'

type OffersListProps = {
  refreshKey?: number
}

export function OffersList({ refreshKey = 0 }: OffersListProps) {
  const { account, signAndSendTransaction } = useWallet()
  const [offers, setOffers] = useState<OfferViewModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeOfferAddress, setActiveOfferAddress] = useState<string | null>(null)
  const [submittedTransaction, setSubmittedTransaction] =
    useState<SubmittedTransaction | null>(null)

  async function loadOffers() {
    setIsLoading(true)
    setError(null)

    try {
      const nextOffers = await fetchOpenOffers()
      setOffers(nextOffers)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load open offers.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOffers()
  }, [refreshKey])

  async function handleTakeOffer(offer: OfferViewModel) {
    if (!account) {
      setError('Connect a wallet before taking an offer.')
      return
    }

    setActiveOfferAddress(offer.address)
    setError(null)
    setSubmittedTransaction(null)

    try {
      const transaction = await submitTakeOffer({
        offer,
        signAndSendTransaction,
        takerAddress: account.address,
      })

      setSubmittedTransaction(transaction)
      await loadOffers()
    } catch (takeError) {
      setError(
        takeError instanceof Error ? takeError.message : 'Take offer transaction failed.',
      )
    } finally {
      setActiveOfferAddress(null)
    }
  }

  return (
    <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-[0.24em] text-slate-500 uppercase">
            Open Offers
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            Take an offer from Devnet
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            These cards are fetched on-chain from the escrow program and filtered
            to offers whose vault still holds Token A.
          </p>
        </div>

        <Button disabled={isLoading} onClick={() => void loadOffers()} variant="secondary">
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error ? (
        <div className="mt-5 rounded-3xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      ) : null}

      {submittedTransaction ? (
        <div className="mt-5 rounded-3xl border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-950">
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

      <div className="mt-6 grid gap-4">
        {!isLoading && offers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-600">
            No open offers found right now.
          </div>
        ) : null}

        {offers.map((offer) => (
          <article
            key={offer.address}
            className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
          >
            <div className="grid gap-3 text-sm leading-6 text-slate-700">
              <div>
                <span className="font-medium text-slate-950">Maker:</span> {offer.maker}
              </div>
              <div>
                <span className="font-medium text-slate-950">Token A mint:</span>{' '}
                {offer.tokenAMint}
              </div>
              <div>
                <span className="font-medium text-slate-950">Token B mint:</span>{' '}
                {offer.tokenBMint}
              </div>
              <div>
                <span className="font-medium text-slate-950">Offered amount:</span>{' '}
                {offer.offeredAmountUi}
              </div>
              <div>
                <span className="font-medium text-slate-950">Requested amount:</span>{' '}
                {offer.requestedAmountUi}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <a
                className="text-sm font-medium text-teal-700 underline"
                href={offer.address}
                onClick={(event) => event.preventDefault()}
              >
                {offer.address}
              </a>
              <Button
                disabled={activeOfferAddress === offer.address || !account}
                onClick={() => void handleTakeOffer(offer)}
              >
                {activeOfferAddress === offer.address ? 'Taking offer...' : 'Take'}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </article>
  )
}
