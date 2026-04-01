import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils/cn'
import { useWallet } from './WalletContext'
import { getWalletBadge } from './wallet-standard'

type WalletModalProps = {
  open: boolean
  onClose: () => void
}

export function WalletModal({ open, onClose }: WalletModalProps) {
  const { connect, error, isConnecting, wallets } = useWallet()

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
    >
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white shadow-[0_30px_120px_rgba(15,23,42,0.6)]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium tracking-[0.28em] text-teal-300 uppercase">
              Connect wallet
            </p>
            <h2
              className="mt-3 text-2xl font-semibold tracking-tight"
              id="wallet-modal-title"
            >
              Choose an injected Solana wallet
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              This modal uses Wallet Standard detection, so only wallets exposed
              in your browser will be shown here.
            </p>
          </div>

          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          {wallets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-400">
              No supported wallets detected. Install Phantom, Backpack, Solflare,
              or another Wallet Standard compatible Solana wallet and refresh the
              page.
            </div>
          ) : null}

          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              className={cn(
                'flex w-full items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-left transition',
                'hover:border-teal-300/40 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60',
              )}
              disabled={isConnecting}
              onClick={() => void connect(wallet)}
              type="button"
            >
              <div className="flex items-center gap-4">
                <img
                  alt={`${wallet.name} icon`}
                  className="h-11 w-11 rounded-2xl bg-white/10 object-cover p-1"
                  src={wallet.icon}
                />
                <div>
                  <div className="font-medium text-white">{wallet.name}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {wallet.chains.join(', ')}
                  </div>
                </div>
              </div>

              <div className="rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-200">
                {getWalletBadge(wallet)}
              </div>
            </button>
          ))}
        </div>

        {error ? (
          <div className="mt-5 rounded-3xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error.message}
          </div>
        ) : null}
      </div>
    </div>
  )
}
