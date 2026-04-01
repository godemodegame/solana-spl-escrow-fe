# Solana SPL Escrow Frontend

Initial setup for a React frontend that will interact with an SPL-token escrow program on Solana Devnet.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS

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

This repository currently includes the initial frontend scaffold and project planning files:

- [TASK.md](./TASK.md)
- [PLAN.md](./PLAN.md)

Next major steps:

- add Solana Devnet client integration via `@solana/kit`
- implement a custom wallet connection modal
- build `make_offer` and `take_offer` flows
- list open offers created through the frontend
- add transaction success and error handling UX

## Program

- Network: Solana Devnet
- Program address: `4g5EN9Sk7wEcZqfjdjDtvq7T9u5YUrBKTe23fVJoL8yy`
