# Bitcoin Staking dApp

> 2024-11-28 @DanteBartel

## 🌟 Overview

The Bitcoin Staking dApp is a web application integrating with wallet extension that allows a user to stake, or unstake their Bitcoin. After the transaction is confirmed, the user can claim their cross-chain assets in their wallet. It is hosted by Scalarorg and serves as a staking app for the Scalar Project.

The staking and unstaking logic is implemented in the `bitcoin-vault` library, which can be referenced [here](https://github.com/scalarorg/bitcoin-vault).

## 🌟 Key Features

1. Connecting to wallets (Unisat, Metamask, etc.)

2. Create staking/unstaking transactions for the covenant pool scenario:

   - Stake to the covenant pool
   - Using bitcoin as collateral
   - Receive tokens (pBTC, etc.)
   - Unstake from the covenant pool by returning the tokens and receiving back the bitcoin

3. Create staking/unstaking transactions for the protocol + covenant pool scenario:

   - When staking, the bitcoin is locked by three parties: the user, the protocol, and the covenant pool.

4. Review user's staking history, total staked amount, balance, etc.

## 🌟 Components

The application is structured with the following key components:

### Core Components

- **Layout Components**
  - `AppLayout`: Main layout wrapper providing consistent structure
  - `ModalLayout`: Handles modal display and management
  - `Header`: Navigation and wallet connection
  - `Footer`: Application footer

- **Staking Components**
  - `ListDApps`: Displays available DApps for staking
  - `DAppItem`: Individual DApp entry with actions
  - `Summary`: Shows user's staking summary and balance
  - `BtcAddress`: Bitcoin address input component with validation

### UI Components

Built using a combination of shadcn/ui and custom components:

- `Dialog`: Modal dialog component
- `Toast`: Notification system
- `Form`: Form handling components
- `Command`: Command palette interface

### Directory Structure

```
src/
├── app/
│ ├── components/       # React components
│ │ ├── Modals/         # Modal components
│ │ ├── Staking/        # Staking-related components
│ │ ├── FAQ/            # FAQ components
│ │ └── ui/             # Shared UI components
│ ├── context/          # React context providers
│ ├── stores/           # State management
│ └── layout/           # Layout components
```

## 🌟 How to run

To set up a development environment, first specify the required environment variables in the `.env.local` file in the root directory, using `.env.example` as reference. Then run the following command to start the development server:

```
bun install
bun run dev
```

## 🌟 Wallet Integration

Instructions for wallet integration can be found in this
[document](./docs/WalletIntegration.md).
