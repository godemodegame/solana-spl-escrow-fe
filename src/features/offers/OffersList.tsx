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
    <article className="retro-window overflow-hidden">
      <div className="retro-titlebar flex items-start justify-between gap-4 px-3 py-2 sm:px-4">
        <div className="text-xs font-bold uppercase tracking-[0.16em]">
          Open Offers
        </div>
        <Button disabled={isLoading} onClick={() => void loadOffers()} variant="secondary">
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="p-3 sm:p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Take an offer from Devnet
          </h2>
        </div>
      </div>

      {error ? (
        <div className="retro-inset mt-5 border-[color:#b75b5b] bg-[#f0d1d1] px-4 py-3 text-sm text-[#6d2020]">
          {error}
        </div>
      ) : null}

      {submittedTransaction ? (
        <div className="retro-inset mt-5 border-[color:#578663] bg-[#d7e8d8] px-4 py-3 text-sm text-[#1d4d2a]">
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
          <div className="retro-inset px-5 py-8 text-sm text-slate-600">
            No open offers found right now.
          </div>
        ) : null}

        {offers.map((offer) => (
          <article
            key={offer.address}
            className="retro-panel p-4 sm:p-5"
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
                className="retro-inset block max-w-full px-3 py-2 text-xs font-bold text-slate-700"
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
      </div>
    </article>
  )
}
