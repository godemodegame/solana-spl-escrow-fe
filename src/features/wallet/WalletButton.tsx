import { Button } from '../../components/ui/button'
import { useWallet } from './WalletContext'
import { abbreviateAddress } from './wallet-standard'

export function WalletButton() {
  const {
    account,
    connectedWallet,
    disconnect,
    isConnecting,
    isDisconnecting,
    openModal,
  } = useWallet()

  if (!connectedWallet || !account) {
    return (
      <Button className="min-w-36" onClick={openModal}>
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    )
  }

  return (
    <div className="retro-panel flex max-w-full items-center gap-3 px-3 py-2 text-slate-900">
      <img
        alt={`${connectedWallet.name} icon`}
        className="retro-inset h-9 w-9 object-cover p-1"
        src={connectedWallet.icon}
      />
      <div className="min-w-0 flex-1 text-left">
        <div className="text-sm font-medium">{connectedWallet.name}</div>
        <div className="truncate text-xs text-slate-600">
          {abbreviateAddress(account.address)}
        </div>
      </div>
      <Button className="shrink-0" onClick={() => void disconnect()} variant="secondary">
        {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
      </Button>
    </div>
  )
}
