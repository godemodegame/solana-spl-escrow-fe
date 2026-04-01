export const DEVNET_RPC_URL = 'https://api.devnet.solana.com'
export const DEVNET_WS_URL = 'wss://api.devnet.solana.com'
export const SOLANA_DEVNET_CHAIN = 'solana:devnet'
export const SOLANA_EXPLORER_BASE_URL = 'https://explorer.solana.com'
export const ESCROW_PROGRAM_ADDRESS =
  '4g5EN9Sk7wEcZqfjdjDtvq7T9u5YUrBKTe23fVJoL8yy'

export function getExplorerUrl(pathname: string) {
  return `${SOLANA_EXPLORER_BASE_URL}${pathname}?cluster=devnet`
}
