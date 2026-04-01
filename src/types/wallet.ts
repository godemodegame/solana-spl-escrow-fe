import type { Wallet, WalletAccount } from '@wallet-standard/base'

export type WalletWithAccount = {
  wallet: Wallet
  account: WalletAccount
}

export type WalletConnectionError = {
  message: string
  source?: 'connect' | 'disconnect' | 'wallet-event'
}
