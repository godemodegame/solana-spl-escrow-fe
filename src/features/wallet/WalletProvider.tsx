import type { Wallet, WalletAccount } from '@wallet-standard/base'
import { getWallets } from '@wallet-standard/app'
import { getBase64Decoder } from '@solana/kit'
import type { Base64EncodedWireTransaction } from '@solana/kit'
import bs58 from 'bs58'
import { useEffect, useState } from 'react'

import type { WalletConnectionError } from '../../types/wallet'
import { SOLANA_DEVNET_CHAIN } from '../../lib/solana/constants'
import { rpc } from '../../lib/solana/rpc'
import { WalletContext } from './WalletContext'
import {
  getWalletConnectFeature,
  getWalletDisconnectFeature,
  getWalletEventsFeature,
  getWalletSignAndSendFeature,
  getWalletSignTransactionFeature,
  isSupportedWallet,
  pickWalletAccount,
} from './wallet-standard'

const PREFERRED_WALLET_KEY = 'spl-escrow-preferred-wallet'

type WalletProviderProps = {
  children: React.ReactNode
}

function toWalletError(
  error: unknown,
  source: WalletConnectionError['source'],
): WalletConnectionError {
  const fallbackMessage = 'Wallet request failed. Please try again.'

  if (error instanceof Error && error.message) {
    return { message: error.message, source }
  }

  return { message: fallbackMessage, source }
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [connectedWallet, setConnectedWallet] = useState<Wallet | null>(null)
  const [account, setAccount] = useState<WalletAccount | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<WalletConnectionError | null>(null)

  useEffect(() => {
    const registry = getWallets()

    const syncWallets = () => {
      const detectedWallets = registry.get().filter(isSupportedWallet)
      setWallets(detectedWallets)

      setConnectedWallet((currentWallet) => {
        if (!currentWallet) {
          return currentWallet
        }

        const updatedWallet =
          detectedWallets.find((wallet) => wallet.name === currentWallet.name) ?? null

        if (!updatedWallet) {
          setAccount(null)
          return null
        }

        if (updatedWallet.accounts.length > 0) {
          setAccount(pickWalletAccount(updatedWallet.accounts))
        }

        return updatedWallet
      })
    }

    syncWallets()

    const offRegister = registry.on('register', syncWallets)
    const offUnregister = registry.on('unregister', syncWallets)

    return () => {
      offRegister()
      offUnregister()
    }
  }, [])

  useEffect(() => {
    const savedWalletName = window.localStorage.getItem(PREFERRED_WALLET_KEY)
    if (!savedWalletName || connectedWallet || wallets.length === 0) {
      return
    }

    const savedWallet = wallets.find((wallet) => wallet.name === savedWalletName)
    if (!savedWallet) {
      return
    }

    if (savedWallet.accounts.length > 0) {
      setConnectedWallet(savedWallet)
      setAccount(pickWalletAccount(savedWallet.accounts))
    }
  }, [connectedWallet, wallets])

  useEffect(() => {
    if (!connectedWallet) {
      return
    }

    const eventsFeature = getWalletEventsFeature(connectedWallet)
    if (!eventsFeature) {
      return
    }

    return eventsFeature.on('change', ({ accounts }) => {
      if (!accounts) {
        return
      }

      if (accounts.length === 0) {
        setAccount(null)
        setConnectedWallet(null)
        window.localStorage.removeItem(PREFERRED_WALLET_KEY)
        return
      }

      setAccount(pickWalletAccount(accounts))
    })
  }, [connectedWallet])

  async function connect(wallet: Wallet) {
    const connectFeature = getWalletConnectFeature(wallet)
    if (!connectFeature) {
      setError({
        message: `${wallet.name} does not expose a compatible connect feature.`,
        source: 'connect',
      })
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const result = await connectFeature.connect()
      const nextAccount = pickWalletAccount(result.accounts)

      if (!nextAccount) {
        throw new Error('Wallet connected, but no account was returned.')
      }

      setConnectedWallet(wallet)
      setAccount(nextAccount)
      setIsModalOpen(false)
      window.localStorage.setItem(PREFERRED_WALLET_KEY, wallet.name)
    } catch (connectError) {
      setError(toWalletError(connectError, 'connect'))
    } finally {
      setIsConnecting(false)
    }
  }

  async function disconnect() {
    if (!connectedWallet) {
      return
    }

    setIsDisconnecting(true)
    setError(null)

    try {
      const disconnectFeature = getWalletDisconnectFeature(connectedWallet)
      if (disconnectFeature) {
        await disconnectFeature.disconnect()
      }
    } catch (disconnectError) {
      setError(toWalletError(disconnectError, 'disconnect'))
    } finally {
      setConnectedWallet(null)
      setAccount(null)
      setIsDisconnecting(false)
      window.localStorage.removeItem(PREFERRED_WALLET_KEY)
    }
  }

  async function signAndSendTransaction(transactionBytes: Uint8Array) {
    if (!connectedWallet || !account) {
      throw new Error('Connect a wallet before sending a transaction.')
    }

    const signAndSendFeature = getWalletSignAndSendFeature(connectedWallet)
    if (signAndSendFeature) {
      const [result] = await signAndSendFeature.signAndSendTransaction({
        account,
        chain: SOLANA_DEVNET_CHAIN,
        transaction: transactionBytes,
      })

      return bs58.encode(result.signature)
    }

    const signTransactionFeature = getWalletSignTransactionFeature(connectedWallet)
    if (!signTransactionFeature) {
      throw new Error(
        `${connectedWallet.name} does not support transaction signing on Solana.`,
      )
    }

    const [signedTransaction] = await signTransactionFeature.signTransaction({
      account,
      chain: SOLANA_DEVNET_CHAIN,
      transaction: transactionBytes,
    })

    const signature = await rpc
      .sendTransaction(
        getBase64Decoder().decode(
          new Uint8Array(signedTransaction.signedTransaction),
        ) as Base64EncodedWireTransaction,
        {
          encoding: 'base64',
        },
      )
      .send()

    return signature
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        connect,
        connectedWallet,
        disconnect,
        error,
        isConnecting,
        isDisconnecting,
        isModalOpen,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
        signAndSendTransaction,
        wallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
