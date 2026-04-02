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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,24,39,0.45)] px-3 py-6 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallet-modal-title"
    >
      <div className="retro-window w-full max-w-2xl overflow-hidden text-slate-900">
        <div className="retro-titlebar flex items-center justify-between gap-4 px-4 py-2">
          <div className="text-sm font-bold tracking-[0.08em] uppercase">
            Wallet Connection
          </div>
          <Button className="px-3 py-1 text-xs" onClick={onClose} variant="secondary">
            X
          </Button>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-slate-600 uppercase">
              Connect wallet
            </p>
            <h2
              className="mt-2 text-xl font-bold tracking-tight sm:text-2xl"
              id="wallet-modal-title"
            >
              Choose an injected Solana wallet
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              This modal uses Wallet Standard detection, so only wallets exposed
              in your browser will be shown here.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {wallets.length === 0 ? (
            <div className="retro-inset px-4 py-6 text-center text-sm text-slate-700">
              No supported wallets detected. Install Phantom, Backpack, Solflare,
              or another Wallet Standard compatible Solana wallet and refresh the
              page.
            </div>
          ) : null}

          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              className={cn(
                'retro-panel flex w-full items-center justify-between gap-4 px-3 py-3 text-left transition',
                'hover:bg-[#e5ebf2] disabled:cursor-not-allowed disabled:opacity-60',
              )}
              disabled={isConnecting}
              onClick={() => void connect(wallet)}
              type="button"
            >
              <div className="flex items-center gap-4">
                <img
                  alt={`${wallet.name} icon`}
                  className="retro-inset h-11 w-11 object-cover p-1"
                  src={wallet.icon}
                />
                <div>
                  <div className="font-bold text-slate-900">{wallet.name}</div>
                  <div className="mt-1 text-xs text-slate-600">
                    {wallet.chains.join(', ')}
                  </div>
                </div>
              </div>

              <div className="retro-inset px-3 py-1 text-xs font-bold text-slate-800">
                {getWalletBadge(wallet)}
              </div>
            </button>
          ))}
        </div>

        {error ? (
          <div className="retro-inset mt-5 border-[color:#b75b5b] bg-[#f0d1d1] px-4 py-3 text-sm text-[#6d2020]">
            {error.message}
          </div>
        ) : null}
        </div>
      </div>
    </div>
  )
}
