# ABC Assignment Staking System

This project consists of multiple modules working together:

- `backend/` – Go REST API for staking logic
- `event-listener/` – Node.js service to listen to blockchain events and set up a smart contract
- `simple-app/` – Next.js frontend UI
- `blockchain/` – Private Ethereum network using Hyperledger Besu

## Project Structure
```
root/
├── backend/ # Go-based staking API
├── event-listener/ # Node.js listener for on-chain events
├── simple-app/ # Web app using Next.js (For staking)
└── blockchain/ # Besu private network config (node-1, node-2, node-3)
```

## Requirements

- [Go v1.21+](https://go.dev/)
- [Node.js v20+](https://nodejs.org/)
- [Java 17+ (e.g., Java 20 OK)](https://www.java.com/en/download/manual.jsp) – required for Hyperledger Besu
- [Yarn](https://yarnpkg.com/)
- [Hyperledger Besu CLI](https://besu.hyperledger.org/) (optional if running with Docker)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/parametprame/abc.git
cd abc
```
### 2. Start a blockchain
You can follow how to start the blockchain from [this](https://besu.hyperledger.org/private-networks/tutorials/clique)

**If you complete getting the addresses in (``Step 2``) for every node. You can use these addresses to set up in my genesis.json file and configure it into a shell script file in the node folder.**

### 3. Deploy a smart contract

#### 3.1. Install dependencies
```bash
cd smartcontract
yarn add
```

#### 3.2. Add a private key
```bash
touch .env

example PRIVATE_KEY="<YOUR PRIVATE KEY>"
```

#### 3.3. Deploy a smart contract

```
 npx hardhat ignition deploy ignition/modules/Staking.ts --network dev
 npx hardhat ignition deploy ignition/modules/Token.ts --network dev
```
### 4. Run a event listener

#### 4.1. Install dependencies
```bash
cd event-listener
npm i
```

#### 4.2. Create .env file
```bash
touch .env

RPC_URL=http://127.0.0.1:8545
STAKING_ADDRESS=<ADRESS_STAKING_CONTRACT_FROM_STEP 3.3>
TOKEN_ADDRESS=<ADRESS_TOKEN_CONTRACT_FROM_STEP 3.3>
API_ENDPOINT=http://127.0.0.1:8080/webhook/events
PRIVATE_KEY=<YOUR_PRIVATE_KEY_IS_DEPLOYED_THE_SMART_CONTRACT>
```

#### 4.3. Set up the smart contract and run the listening service

```bash
npx ts-node src/setup.ts
npx ts-node src/index.ts
```

### 5. Run a backend service

#### 5.1. Install dependencies and start the service
```bash
cd backend
go mod tidy
go run main.go
```

### 6. Run a frontend

#### 6.1. Install dependencies
```bash
cd simple-app
npm i
```


#### 6.2. Create .env file
```bash
touch .env.local

NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS="4B2250Fbe8f8f0006F8D85c4fC3d415eE6ce485f" // The staking contract address withour 0x prefix
```

#### 6.3. Start the front end
```bash
yarn run dev
```
