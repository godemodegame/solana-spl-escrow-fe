import type { IdentifierString, Wallet, WalletAccount } from '@wallet-standard/base'
import type {
  StandardConnectFeature,
  StandardDisconnectFeature,
  StandardEventsFeature,
} from '@wallet-standard/features'
import {
  StandardConnect,
  StandardDisconnect,
  StandardEvents,
} from '@wallet-standard/features'
import {
  SolanaSignAndSendTransaction,
  SolanaSignMessage,
  SolanaSignTransaction,
} from '@solana/wallet-standard-features'

import { SOLANA_DEVNET_CHAIN } from '../../lib/solana/constants'

export function getWalletConnectFeature(wallet: Wallet) {
  return wallet.features[StandardConnect] as
    | StandardConnectFeature[typeof StandardConnect]
    | undefined
}

export function getWalletDisconnectFeature(wallet: Wallet) {
  return wallet.features[StandardDisconnect] as
    | StandardDisconnectFeature[typeof StandardDisconnect]
    | undefined
}

export function getWalletEventsFeature(wallet: Wallet) {
  return wallet.features[StandardEvents] as
    | StandardEventsFeature[typeof StandardEvents]
    | undefined
}

export function isSolanaWallet(wallet: Wallet) {
  return wallet.chains.some((chain) => chain.startsWith('solana:'))
}

export function supportsDevnet(wallet: Wallet) {
  return wallet.chains.includes(SOLANA_DEVNET_CHAIN as IdentifierString)
}

export function hasSigningFeature(wallet: Wallet) {
  return Boolean(
    wallet.features[SolanaSignAndSendTransaction] ||
      wallet.features[SolanaSignTransaction] ||
      wallet.features[SolanaSignMessage],
  )
}

export function isSupportedWallet(wallet: Wallet) {
  return Boolean(getWalletConnectFeature(wallet)) && isSolanaWallet(wallet)
}

export function pickWalletAccount(accounts: readonly WalletAccount[]) {
  return accounts[0] ?? null
}

export function abbreviateAddress(address: string, start = 4, end = 4) {
  if (address.length <= start + end) {
    return address
  }

  return `${address.slice(0, start)}...${address.slice(-end)}`
}

export function getWalletBadge(wallet: Wallet) {
  if (supportsDevnet(wallet) && hasSigningFeature(wallet)) {
    return 'Ready'
  }

  if (hasSigningFeature(wallet)) {
    return 'Solana'
  }

  return 'Detected'
}
