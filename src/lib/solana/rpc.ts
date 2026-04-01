import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit'

import { DEVNET_RPC_URL, DEVNET_WS_URL } from './constants'

export const rpc = createSolanaRpc(DEVNET_RPC_URL)
export const rpcSubscriptions = createSolanaRpcSubscriptions(DEVNET_WS_URL)
