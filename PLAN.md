# SPL Escrow Frontend Plan

## Goal

Build a minimal but production-ready React frontend for the deployed SPL-token escrow program on Solana Devnet using:

- Vite
- React
- TypeScript
- `@solana/kit`
- Tailwind CSS
- custom wallet modal UI

## Main Deliverable

A web app that lets a user:

- connect a Solana wallet through a custom modal,
- create an escrow offer with `make_offer`,
- view open offers created via this frontend,
- accept an offer with `take_offer`,
- see transaction status, errors, and Devnet Explorer links.

## Implementation Plan

### 1. Project setup

- Create a Vite + React + TypeScript app structure.
- Install and configure Tailwind CSS.
- Add a small shadcn-style local component set or equivalent custom UI primitives.
- Set up app-wide folder structure:
  - `src/app`
  - `src/components`
  - `src/features/wallet`
  - `src/features/offers`
  - `src/features/make-offer`
  - `src/lib/solana`
  - `src/lib/utils`
  - `src/types`

### 2. Solana integration foundation

- Configure Devnet RPC connection via `@solana/kit`.
- Add constants for:
  - network,
  - program address,
  - explorer base URL,
  - known token program addresses if needed.
- Prepare typed helpers for:
  - sending transactions,
  - confirming transactions,
  - formatting signatures and addresses,
  - generating Explorer links.

### 3. IDL and escrow instruction layer

- Add the provided escrow IDL to the project once available from the gist.
- Map instruction accounts and arguments for:
  - `make_offer`
  - `take_offer`
- Create a thin client wrapper around the escrow program so UI code does not build instructions inline.
- Define TypeScript types for offer account data and instruction params.

### 4. Wallet connection

- Detect available wallet providers from the browser environment.
- Build a custom wallet modal without third-party wallet UI packages.
- Display:
  - wallet icon,
  - wallet name,
  - connect action.
- After connection, show:
  - abbreviated public key,
  - connected wallet name,
  - disconnect button.
- Add wallet state management with loading and error handling.

### 5. Token account discovery

- Fetch SPL token accounts for the connected wallet on Devnet.
- Parse token balances and mint addresses.
- Use those accounts as the source for Token A selection.
- Handle empty-wallet and zero-balance states clearly.

### 6. Make Offer flow

- Build a form with:
  - Token A selector from wallet token accounts,
  - offered amount input,
  - Token B mint address input,
  - desired Token B amount input.
- Validate:
  - wallet connected,
  - positive numeric amounts,
  - valid mint address,
  - sufficient Token A balance.
- On submit:
  - derive required accounts and PDAs,
  - construct `make_offer`,
  - sign and send transaction on Devnet,
  - confirm transaction,
  - show success state with Explorer link.
- Refresh the offer list after success.

### 7. Offer indexing and storage strategy

- Store enough metadata locally when creating offers through this frontend so they can be listed reliably.
- Likely approach:
  - save created offer public keys in local storage keyed by wallet/network,
  - fetch and decode those accounts on app load.
- If on-chain account filtering is straightforward from the IDL/account layout, support direct fetch from program accounts as an enhancement.

### 8. Take Offer flow

- Build an offer list UI with cards.
- Each card should show:
  - maker address,
  - Token A mint,
  - Token B mint,
  - offered amount,
  - requested amount,
  - offer account address if useful.
- For each open offer:
  - construct `take_offer`,
  - sign and send transaction,
  - confirm transaction,
  - update UI after success.
- Hide or mark offers that are no longer valid/available.

### 9. UX and state handling

- Add loading states for:
  - wallet connect,
  - token account fetch,
  - offer fetch,
  - make offer submit,
  - take offer submit.
- Add friendly error messages for:
  - user rejection,
  - insufficient balance,
  - stale blockhash,
  - invalid mint address,
  - account not found,
  - generic RPC errors.
- Add success toasts or status panels with transaction signature and Explorer link.

### 10. UI structure

- Layout sections:
  - header with wallet status,
  - make-offer panel,
  - offers list panel.
- Keep the design minimal but polished and easy to scan.
- Ensure responsive behavior for desktop and mobile.

### 11. Testing and verification

- Run TypeScript type-checking.
- Run production build.
- Test manually with at least one supported wallet on Devnet.
- Verify:
  - connect/disconnect,
  - token account loading,
  - successful `make_offer`,
  - successful `take_offer`,
  - Explorer links open correctly.

### 12. Submission readiness

- Write `README.md` with:
  - setup instructions,
  - environment notes,
  - tested wallets,
  - deployment link,
  - at least one Devnet transaction link.
- Deploy to Vercel, Netlify, or similar.
- Prepare final submission checklist for the bounty form.

## Risks and Unknowns

- The exact IDL content is not yet embedded in the repo, so instruction/account mapping depends on fetching or adding that file.
- Offer listing may require a practical indexing approach if the program accounts are not easy to filter directly.
- Wallet integration with `@solana/kit` may need custom adapter glue depending on how injected providers expose signing methods.

## Recommended Build Order

1. Scaffold app and styling.
2. Add Solana client and constants.
3. Add wallet detection and custom modal.
4. Integrate IDL and implement escrow instruction helpers.
5. Implement token account fetching.
6. Build make-offer flow.
7. Build offer list and take-offer flow.
8. Add robust loading/error states.
9. Test on Devnet and deploy.

## Definition of Done

- The app uses `@solana/kit`, not `@solana/web3.js`.
- Wallet connection uses a custom modal.
- `make_offer` works with a real Devnet transaction.
- `take_offer` works with a real Devnet transaction.
- Created offers are visible in the UI.
- Success and failure states are understandable.
- The project builds cleanly and is ready for public deployment.
