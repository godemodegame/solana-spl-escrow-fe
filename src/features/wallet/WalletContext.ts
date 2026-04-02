import { createContext, useContext } from 'react'
import type { Wallet, WalletAccount } from '@wallet-standard/base'

import type { WalletConnectionError } from '../../types/wallet'

export type WalletContextValue = {
  account: WalletAccount | null
  connect: (wallet: Wallet) => Promise<void>
  connectedWallet: Wallet | null
  disconnect: () => Promise<void>
  error: WalletConnectionError | null
  isConnecting: boolean
  isDisconnecting: boolean
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
  signAndSendTransaction: (transactionBytes: Uint8Array) => Promise<string>
  wallets: Wallet[]
}

export const WalletContext = createContext<WalletContextValue | null>(null)

export function useWallet() {
  const context = useContext(WalletContext)

  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider.')
  }

  return context
}
