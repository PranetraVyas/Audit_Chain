# Blockchain Integration Setup Guide

Complete guide for setting up blockchain anchoring in AuditChain.

## Overview

AuditChain uses Ethereum-compatible blockchains (Sepolia or Polygon Mumbai testnets) to anchor Merkle roots, providing immutable integrity proofs for ML audit events.

## Architecture

```
ML Event → Hash → Merkle Batch → Merkle Root → Blockchain Anchor
```

Only the **Merkle root** (32 bytes) is stored on-chain. Full event data remains off-chain in the database.

## Step-by-Step Setup

### 1. Smart Contract Deployment

#### 1.1 Install Dependencies
```bash
cd "Audit Chain/blockchain"
npm install
```

#### 1.2 Configure Environment
```bash
cp .env.example .env
# Edit .env with your RPC URL and private key
```

#### 1.3 Deploy Contract
```bash
# For Sepolia
npm run deploy:sepolia

# OR for Polygon Mumbai
npm run deploy:mumbai
```

#### 1.4 Save Contract Address
After deployment, copy the contract address and add it to backend `.env`:
```env
BLOCKCHAIN_CONTRACT_ADDRESS=0xYourContractAddressHere
```

### 2. Backend Configuration

#### 2.1 Install Python Dependencies
```bash
cd "Audit Chain/backend"
pip install -r requirements.txt
```

#### 2.2 Configure Environment Variables
Create `backend/.env`:
```env
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_PRIVATE_KEY=your_private_key_without_0x_prefix
BLOCKCHAIN_CONTRACT_ADDRESS=0xYourContractAddressFromStep1
BLOCKCHAIN_CHAIN_ID=11155111  # 11155111 for Sepolia, 80001 for Mumbai
```

#### 2.3 Test Connection
```bash
# Start backend
python -m uvicorn app.main:app --reload

# Check blockchain status
curl http://localhost:8000/blockchain/status
```

### 3. Frontend Usage

The frontend automatically connects to the backend blockchain API. No additional configuration needed.

Navigate to: `http://localhost:3000/verification/blockchain`

## API Endpoints

### POST `/blockchain/anchor`
Anchor a Merkle root to the blockchain.

**Request:**
```json
{
  "batch_id": "BATCH-042",
  "merkle_root": "0x1a2b3c4d..."
}
```

**Response:**
```json
{
  "anchor_id": 1,
  "transaction_hash": "0x...",
  "block_number": 12345678,
  "status": "success"
}
```

### GET `/blockchain/anchor/{anchor_id}`
Get anchor information from blockchain.

### POST `/blockchain/verify`
Verify an event using blockchain-anchored roots.

**Request:**
```json
{
  "event_id": 1
}
```

**Response:**
```json
{
  "status": "PASS",
  "computed_merkle_root": "0x...",
  "onchain_merkle_root": "0x...",
  "anchor_id": 1,
  "transaction_hash": "0x...",
  "message": "Verification successful"
}
```

## Workflow

1. **Create Events**: Users submit ML lifecycle events via `/insert-event`
2. **Build Batch**: System automatically batches events into Merkle trees
3. **Anchor Root**: Merkle root is anchored to blockchain (happens automatically when batch is created)
4. **Verify**: Auditors can verify events using `/verification/blockchain` page

## Troubleshooting

### "Blockchain connection failed"
- Check `BLOCKCHAIN_RPC_URL` is correct
- Verify RPC endpoint is accessible
- Ensure you have internet connection

### "Contract address not configured"
- Deploy contract first (Step 1.3)
- Add contract address to backend `.env`

### "Transaction failed"
- Ensure account has enough ETH/MATIC for gas
- Check private key is correct
- Verify contract address matches deployed contract

### "Verification failed"
- Ensure event is part of a batch
- Verify batch was successfully anchored
- Check Merkle root computation matches

## Security Best Practices

1. **Never commit `.env` files** with real private keys
2. **Use testnet accounts** only (never mainnet for development)
3. **Keep private keys secure** - use environment variables, not code
4. **Monitor gas costs** - anchoring costs gas fees
5. **Test thoroughly** on testnets before considering production

## Cost Estimation

### Sepolia Testnet
- Free (testnet ETH from faucet)
- ~50,000-80,000 gas per anchor
- ~$0 cost (testnet)

### Polygon Mumbai Testnet
- Free (testnet MATIC from faucet)
- Lower gas costs than Ethereum
- ~$0 cost (testnet)

## Next Steps

1. Deploy contract to testnet
2. Configure backend environment
3. Test anchoring via API
4. Test verification via UI
5. Monitor blockchain explorer for transactions

## Support

For issues:
1. Check blockchain status: `GET /blockchain/status`
2. Verify contract is deployed and address is correct
3. Check transaction on blockchain explorer
4. Review backend logs for detailed error messages


