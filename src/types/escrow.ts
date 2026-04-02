export type WalletTokenAccount = {
  address: string
  amount: bigint
  decimals: number
  mint: string
  programId: string
  uiAmount: string
}

export type MakeOfferFormState = {
  selectedTokenAccountAddress: string
  tokenAAmount: string
  tokenBMint: string
  tokenBAmount: string
}

export type SubmittedTransaction = {
  explorerUrl: string
  signature: string
}
