import { useState } from 'react'
import { MakeOfferForm } from './features/make-offer/MakeOfferForm'
import { OffersList } from './features/offers/OffersList'
import { WalletButton } from './features/wallet/WalletButton'
import { useWallet } from './features/wallet/WalletContext'
import { WalletModal } from './features/wallet/WalletModal'
import {
  ESCROW_PROGRAM_ADDRESS,
  getExplorerUrl,
} from './lib/solana/constants'

function App() {
  const [offersRefreshKey, setOffersRefreshKey] = useState(0)
  const { account, connectedWallet, error, isModalOpen, wallets, closeModal } =
    useWallet()

  return (
    <main className="min-h-screen px-2 py-2 text-slate-900 sm:px-3 sm:py-3">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-3">
        <header className="retro-window overflow-hidden">
          <div className="retro-titlebar flex flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-4">
            <div className="text-sm font-bold tracking-[0.18em] uppercase">
              SPL Escrow
            </div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-50/90">
              Superteam Ukraine Build
            </div>
          </div>

          <div className="flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Solana escrow workstation
              </h1>
              <a
                className="inline-flex text-xs font-bold uppercase tracking-[0.14em] text-[#0b4a8d] underline"
                href="https://x.com/godemodegame"
                target="_blank"
                rel="noreferrer"
              >
                made by @godemodegame
              </a>
            </div>

            <div className="w-full max-w-full lg:w-auto">
              <WalletButton />
            </div>
          </div>
        </header>

        <section className="grid gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-3">
            <article className="retro-window overflow-hidden">
              <div className="retro-titlebar px-3 py-2 text-xs font-bold uppercase tracking-[0.16em]">
                System Status
              </div>
              <div className="grid gap-2 p-3">
                <div className="retro-inset px-3 py-2 text-sm">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    Connection
                  </div>
                  <div className="mt-1 font-bold">
                    {connectedWallet && account ? 'Connected' : 'Waiting'}
                  </div>
                </div>
                <div className="retro-inset px-3 py-2 text-sm">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    Network
                  </div>
                  <div className="mt-1 font-bold">Solana Devnet</div>
                </div>
              </div>
            </article>

            <article className="retro-window overflow-hidden">
              <div className="retro-titlebar px-3 py-2 text-xs font-bold uppercase tracking-[0.16em]">
                Program
              </div>
              <div className="space-y-3 p-3 text-sm">
                <div className="retro-inset break-all px-3 py-3 font-mono text-xs leading-5 text-slate-800">
                  {ESCROW_PROGRAM_ADDRESS}
                </div>
                <a
                  className="retro-panel inline-flex w-full items-center justify-center px-3 py-2 text-center text-sm font-bold"
                  href={getExplorerUrl(`/address/${ESCROW_PROGRAM_ADDRESS}`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Explorer
                </a>
              </div>
            </article>

            <article className="retro-window overflow-hidden">
              <div className="retro-titlebar px-3 py-2 text-xs font-bold uppercase tracking-[0.16em]">
                Session
              </div>
              <div className="space-y-2 p-3 text-sm">
                <div className="retro-inset px-3 py-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    Wallet
                  </div>
                  <div className="mt-1 break-all font-bold">
                    {connectedWallet?.name ?? 'Not connected'}
                  </div>
                </div>
                <div className="retro-inset px-3 py-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    Account
                  </div>
                  <div className="mt-1 break-all font-mono text-xs">
                    {account?.address ?? 'No account selected'}
                  </div>
                </div>
                <div className="retro-inset px-3 py-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    Status
                  </div>
                  <div className="mt-1 text-xs leading-5">
                    {error?.message ?? 'None'}
                  </div>
                </div>
              </div>
            </article>
          </aside>

          <div className="grid gap-3">
            <MakeOfferForm
              onOfferCreated={() =>
                setOffersRefreshKey((currentValue) => currentValue + 1)
              }
            />
            <OffersList refreshKey={offersRefreshKey} />
          </div>
        </section>
      </section>

      <WalletModal onClose={closeModal} open={isModalOpen} />
    </main>
  )
}

export default App
