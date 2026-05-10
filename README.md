# EthSwap 🔄

> A decentralized token exchange built on Ethereum. Buy and sell DAPP tokens with ETH instantly through a smart contract — no intermediaries, no order books.

![Solidity](https://img.shields.io/badge/Solidity-0.5.x-363636?logo=solidity)
![React](https://img.shields.io/badge/React-16.x-61DAFB?logo=react)
![Truffle](https://img.shields.io/badge/Truffle-5.11.5-5E464D)
![Web3.js](https://img.shields.io/badge/Web3.js-1.x-F16822)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📌 Overview

EthSwap is a decentralized exchange (DEX) DApp that allows users to:

- **Buy** DAPP tokens by sending ETH (rate: 1 ETH = 100 DAPP)
- **Sell** DAPP tokens back for ETH
- View live ETH and DAPP balances that update after every transaction
- Connect via MetaMask with full on-chain transaction signing

All swap logic lives in a Solidity smart contract — no backend, no database, no central authority.

---

## 🖥️ Screenshot

```
┌─────────────────────────────────────┐
│           EthSwap                   │
│  Decentralized Token Exchange       │
│                                     │
│  ETH Balance    DAPP Balance        │
│  98.00 ETH      100.0000 DAPP       │
│                                     │
│  [ ↓ Buy DAPP ]  [ ↑ Sell DAPP ]   │
│                                     │
│  You Pay:  [1.0]  ETH               │
│  You Get:  [100]  DAPP              │
│                                     │
│  Exchange Rate: 1 ETH = 100 DAPP   │
│  [ Buy DAPP Tokens ]                │
└─────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity ^0.5.0 |
| Dev Framework | Truffle v5.11.5 |
| Local Blockchain | Ganache |
| Frontend | React.js |
| Blockchain Library | Web3.js |
| Wallet | MetaMask |
| Testing | Mocha + Chai |

---

## 📁 Project Structure

```
eth_swap/
├── src/
│   ├── contracts/
│   │   ├── Token.sol           # ERC-20 DAPP Token (1 million supply)
│   │   ├── EthSwap.sol         # Exchange logic (buy/sell)
│   │   └── Migrations.sol      # Truffle migrations
│   ├── abis/                   # Compiled contract ABIs (auto-generated)
│   └── components/
│       ├── App.js              # Root — Web3 init, state, blockchain data
│       ├── Main.js             # Swap UI (buy/sell interface)
│       └── NavBar.js           # Navigation with account + Identicon
├── migrations/
│   ├── 1_initial_migration.js
│   └── 2_deploy_contracts.js   # Deploys Token + EthSwap, seeds liquidity
├── test/
│   └── EthSwap.test.js         # Full smart contract test suite
├── truffle-config.js
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v14+
- [Truffle](https://trufflesuite.com/) — `npm install -g truffle`
- [Ganache](https://trufflesuite.com/ganache/) — Desktop app
- [MetaMask](https://metamask.io/) — Browser extension

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/eth_swap.git
cd eth_swap
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start Ganache

Open the Ganache desktop app and create a new workspace with:
- **Port:** `7545`
- **Network ID:** `5777`

### 4. Deploy smart contracts

```bash
truffle migrate --reset
```

### 5. Run the test suite

```bash
truffle test
```

All 10 tests should pass ✅

### 6. Start the frontend

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Connect MetaMask

- Add a custom network: RPC URL `http://127.0.0.1:7545`, Chain ID `1337`
- Import a Ganache account using its private key (click the 🔑 icon in Ganache)

---

## 📝 Smart Contracts

### Token.sol

Custom ERC-20 token with a fixed supply of **1,000,000 DAPP** tokens (18 decimals).

```solidity
name:        "DApp Token"
symbol:      "DAPP"
totalSupply: 1,000,000 × 10^18
```

### EthSwap.sol

The core exchange contract. Holds ETH and DAPP reserves and exposes two functions:

```solidity
function buyTokens() public payable
// Send ETH → receive DAPP at rate 1 ETH = 100 DAPP

function sellTokens(uint _amount) public
// Approve + send DAPP → receive ETH at rate 100 DAPP = 1 ETH
```

#### Sell Flow (two transactions required)

```
1. token.approve(ethSwapAddress, amount)   ← MetaMask popup #1
2. ethSwap.sellTokens(amount)              ← MetaMask popup #2
```

---

## ✅ Test Coverage

```
Contract: EthSwap
  EthSwap deployment
    ✓ contract has name
  Token deployment
    ✓ contract has name
    ✓ contract has token supply
  buyToken()
    ✓ allows users to purchase tokens at fixed price
    ✓ updates ETH and token balances correctly
    ✓ emits TokensPurchased event with correct args
  sellToken()
    ✓ allows users to sell tokens at fixed price
    ✓ restores EthSwap token reserve
    ✓ emits TokensSold event with correct args
    ✓ rejects selling more tokens than balance

10 passing
```

---

## 🔑 Key Concepts

- **ERC-20 Standard** — Custom token with full transfer/approve/transferFrom implementation
- **Liquidity Pool** — EthSwap contract holds both ETH and token reserves
- **approve → transferFrom pattern** — Required for the sell flow (ERC-20 security model)
- **Web3 + React** — Contract instances built from ABI + address, state managed with React class components
- **Event Emission** — Every trade emits an on-chain event for full auditability

---

## ⚠️ Known Limitations

- Fixed exchange rate (not dynamic like Uniswap AMM)
- No slippage protection
- Single token pair only (ETH ↔ DAPP)
- Designed for local development / learning purposes

---

## 📄 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

## 🙏 Acknowledgements

Built as a learning project exploring DeFi fundamentals including smart contract development, ERC-20 tokens, and decentralized exchange mechanics.
