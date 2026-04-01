# Solana SPL Escrow Frontend

Initial setup for a React frontend that will interact with an SPL-token escrow program on Solana Devnet.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- `@solana/kit`
- Wallet Standard (`@wallet-standard/app`, `@solana/wallet-standard-features`)

## Getting Started

```bash
npm install
npm run dev
```

## Available Scripts

- `npm run dev` starts the local development server
- `npm run build` builds the production bundle
- `npm run typecheck` runs the TypeScript project build without Vite dev server
- `npm run lint` runs ESLint

## Current Status

This repository currently includes:

- [TASK.md](./TASK.md)
- [PLAN.md](./PLAN.md)
- Solana Devnet RPC foundation via `@solana/kit`
- custom wallet modal with Wallet Standard detection
- wallet connect and disconnect state
- selected wallet persistence between reloads

Next major steps:

- build `make_offer` and `take_offer` flows
- fetch connected wallet token accounts
- list open offers created through the frontend
- add transaction success and error handling UX

## Program

- Network: Solana Devnet
- Program address: `4g5EN9Sk7wEcZqfjdjDtvq7T9u5YUrBKTe23fVJoL8yy`
