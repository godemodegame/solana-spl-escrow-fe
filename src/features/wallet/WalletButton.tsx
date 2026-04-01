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
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white">
      <img
        alt={`${connectedWallet.name} icon`}
        className="h-9 w-9 rounded-full bg-white/10 object-cover p-1"
        src={connectedWallet.icon}
      />
      <div className="text-left">
        <div className="text-sm font-medium">{connectedWallet.name}</div>
        <div className="text-xs text-slate-400">
          {abbreviateAddress(account.address)}
        </div>
      </div>
      <Button onClick={() => void disconnect()} variant="secondary">
        {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
      </Button>
    </div>
  )
}
