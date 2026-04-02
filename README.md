# Solana SPL Escrow Frontend

React frontend for an SPL-token escrow program on Solana Devnet.

This project is being built for the Superteam Ukraine bounty and uses:

- Vite
- React
- TypeScript
- Tailwind CSS
- `@solana/kit`
- Wallet Standard browser wallet integration

## Program

- Network: Solana Devnet
- Program address: `4g5EN9Sk7wEcZqfjdjDtvq7T9u5YUrBKTe23fVJoL8yy`

## Features

- Custom wallet connection modal without third-party wallet UI
- Automatic detection of injected Solana wallets
- Connect and disconnect flow
- Token account discovery for the connected wallet
- `make_offer` transaction flow
- Scoped open-offers list for offers created through this frontend
- `take_offer` transaction flow
- Explorer links for successful Devnet transactions

## Tech Notes

- Solana client: `@solana/kit`
- Wallet layer: `@wallet-standard/app`, `@wallet-standard/features`, `@solana/wallet-standard-features`
- No `@solana/web3.js`
- No third-party wallet modal

## Local Setup

Requirements:

- Node.js 20+
- npm 10+
- a browser wallet that supports Wallet Standard on Solana Devnet

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Run quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## How To Test On Devnet

1. Open the app in the browser.
2. Connect a supported Solana wallet.
3. Switch the wallet to Devnet.
4. Make sure the wallet has some Devnet SOL and SPL tokens.
5. Create an offer in the `Make Offer` form.
6. Confirm the transaction in the wallet.
7. Use the generated Explorer link to inspect the transaction.
8. Refresh or use the offers list to find the created offer.
9. Take the offer from another wallet or account that has the required Token B balance.

## Scripts

- `npm run dev` starts the Vite development server
- `npm run typecheck` runs TypeScript checks
- `npm run lint` runs ESLint
- `npm run build` builds the production bundle
- `npm run preview` serves the production build locally

## Repository Files

- [TASK.md](./TASK.md) — bounty task text
- [PLAN.md](./PLAN.md) — implementation plan

## Submission Checklist

Before submitting, update this README with:

- your live deployment link
- the wallets you tested
- at least one successful Devnet transaction link
- any final setup notes needed by reviewers

Suggested section format:

```md
## Tested Wallets

- Phantom
- Backpack

## Live Deployment

- https://your-app-url.example

## Example Devnet Transactions

- make_offer: https://explorer.solana.com/tx/<signature>?cluster=devnet
- take_offer: https://explorer.solana.com/tx/<signature>?cluster=devnet
```

## Current Status

The codebase currently passes:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

Manual Devnet transaction testing and final submission metadata still need to be completed.
