# AuditChain Blockchain Contracts

Ethereum-compatible smart contracts for anchoring Merkle roots to the blockchain.

## Setup

### Prerequisites

- Node.js 16+ and npm
- Hardhat
- A testnet account with some ETH/MATIC for gas

### Installation

```bash
cd blockchain
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your environment variables:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_without_0x_prefix
```

**⚠️ SECURITY WARNING:** Never commit `.env` file with real private keys!

## Compilation

```bash
npm run compile
```

## Deployment

### Sepolia Testnet
```bash
npm run deploy:sepolia
```

### Polygon Mumbai Testnet
```bash
npm run deploy:mumbai
```

### Local Network (Hardhat)
```bash
npx hardhat node  # In one terminal
npm run deploy:local  # In another terminal
```

After deployment, copy the contract address to your backend `.env` file:
```env
BLOCKCHAIN_CONTRACT_ADDRESS=0x...
```

## Contract Interface

### `anchorMerkleRoot(bytes32 merkleRoot)`
Anchors a Merkle root to the blockchain. Returns the anchor ID.

### `getAnchor(uint256 anchorId)`
Retrieves anchor information by ID. Returns:
- `merkleRoot`: The anchored Merkle root
- `timestamp`: Block timestamp when anchored
- `submittedBy`: Address that submitted the anchor

### `getAnchorCount()`
Returns the total number of anchors.

## Events

### `RootAnchored`
Emitted when a Merkle root is anchored:
- `anchorId`: Unique identifier
- `merkleRoot`: The anchored root
- `timestamp`: Block timestamp
- `submittedBy`: Submitter address

## Gas Costs

Approximate gas costs (varies by network):
- `anchorMerkleRoot`: ~50,000 - 80,000 gas
- `getAnchor`: Free (view function)
- `getAnchorCount`: Free (view function)

## Network Information

### Sepolia Testnet
- Chain ID: 11155111
- Explorer: https://sepolia.etherscan.io
- Faucet: https://sepoliafaucet.com

### Polygon Mumbai Testnet
- Chain ID: 80001
- Explorer: https://mumbai.polygonscan.com
- Faucet: https://faucet.polygon.technology

## Security Notes

- This contract is designed for **testnet use only**
- For production, add access controls and additional validation
- Never store sensitive data on-chain
- Only Merkle roots (32 bytes) are stored, not full event data


