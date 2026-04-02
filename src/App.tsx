import { MakeOfferForm } from './features/make-offer/MakeOfferForm'
import { WalletButton } from './features/wallet/WalletButton'
import { useWallet } from './features/wallet/WalletContext'
import { WalletModal } from './features/wallet/WalletModal'
import {
  ESCROW_PROGRAM_ADDRESS,
  getExplorerUrl,
} from './lib/solana/constants'

function App() {
  const { account, connectedWallet, error, isModalOpen, wallets, closeModal } =
    useWallet()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_36%),linear-gradient(180deg,_#0a1017_0%,_#111827_48%,_#f3f4f6_48%,_#f8fafc_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-slate-950/65 px-5 py-3 text-sm text-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="font-semibold tracking-[0.24em] text-teal-300 uppercase">
            SPL Escrow
          </div>
          <WalletButton />
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-14">
          <div className="space-y-6 text-left text-white">
            <p className="text-sm font-medium tracking-[0.3em] text-teal-300 uppercase">
              Superteam Ukraine bounty
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl leading-none font-semibold tracking-tight text-balance sm:text-6xl">
                Wallet-ready frontend foundation for a Solana SPL-token escrow.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                The app now detects injected Solana wallets through Wallet
                Standard and uses a custom connection modal. Next we can wire
                escrow instructions, token accounts, and live Devnet
                transactions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100">
                Vite
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100">
                React 19
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100">
                TypeScript
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100">
                Tailwind CSS
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100">
                Wallet Standard
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100">
                @solana/kit
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-400">Detected wallets</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {wallets.length}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-400">Connection state</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {connectedWallet && account ? 'Connected' : 'Waiting'}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-400">Network</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Solana Devnet
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
              <p className="text-sm font-medium tracking-[0.24em] text-slate-500 uppercase">
                Wallet layer
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>Custom modal with detected injected wallets</li>
                <li>Connect and disconnect flow without third-party wallet UI</li>
                <li>Preferred wallet persistence between reloads</li>
                <li>Transaction signing foundation and live make-offer flow</li>
              </ul>
            </article>

            <article className="rounded-[2rem] border border-teal-200 bg-teal-50 p-6 shadow-[0_24px_80px_rgba(13,148,136,0.14)]">
              <p className="text-sm font-medium tracking-[0.24em] text-teal-700 uppercase">
                Program
              </p>
              <p className="mt-4 break-all font-mono text-sm leading-6 text-teal-950">
                4g5EN9Sk7wEcZqfjdjDtvq7T9u5YUrBKTe23fVJoL8yy
              </p>
              <a
                className="mt-5 inline-flex items-center rounded-full bg-teal-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-900"
                href={getExplorerUrl(`/address/${ESCROW_PROGRAM_ADDRESS}`)}
                target="_blank"
                rel="noreferrer"
              >
                View Program On Explorer
              </a>
            </article>

            <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
              <p className="text-sm font-medium tracking-[0.24em] text-slate-500 uppercase">
                Session
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <div>
                  <span className="font-medium text-slate-950">Wallet:</span>{' '}
                  {connectedWallet?.name ?? 'Not connected'}
                </div>
                <div>
                  <span className="font-medium text-slate-950">Account:</span>{' '}
                  {account?.address ?? 'No account selected'}
                </div>
                <div>
                  <span className="font-medium text-slate-950">Last error:</span>{' '}
                  {error?.message ?? 'None'}
                </div>
              </div>
            </article>

            <MakeOfferForm />
          </div>
        </section>
      </section>

      <WalletModal onClose={closeModal} open={isModalOpen} />
    </main>
  )
}

export default App
