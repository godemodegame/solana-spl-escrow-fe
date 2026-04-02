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

export type OfferViewModel = {
  address: string
  id: bigint
  maker: string
  offeredAmount: bigint
  offeredAmountUi: string
  requestedAmount: bigint
  requestedAmountUi: string
  tokenAMint: string
  tokenBMint: string
  tokenProgram: string
}

export type TrackedFrontendOffer = {
  address: string
  createdAt: number
}
