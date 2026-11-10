# BOT Digital Cemetery

An on-chain graveyard for abandoned projects, forgotten ideas, failed goals, and unfinished side projects on **BOT Chain Testnet**.

> “Some projects deserve a proper burial.”  
> An on-chain resting place for the ideas that never made it.

📄 **Technical Whitepaper:** See [WHITEPAPER.md](./WHITEPAPER.md) for architecture, contract specification, and security model.

---

## Network Configuration (BOT Chain Testnet)

- **Chain ID:** `968`
- **RPC URL:** `https://rpc.bohr.life`
- **Native Token:** `BOT`
- **Explorer:** [https://scan.bohr.life/](https://scan.bohr.life/)
- **Gas Fee Only:** Every contract interaction (`buryProject` and `digUp`) is strictly non-payable. Users only pay standard BOT network gas fees—no platform fees, no subscriptions, and no extra BOT transfers.

---

## Project Structure

```text
bot-digital-cemetery/
├── contracts/
│   └── BOTDigitalCemetery.sol     # Solidity 0.8.20 smart contract
├── scripts/
│   └── deploy.ts                  # Deployment script for BOT Chain Testnet
├── test/
│   └── BOTDigitalCemetery.test.ts # Automated Hardhat test suite (12 tests)
├── frontend/
│   ├── app/                       # Next.js App Router pages, layout & fonts
│   ├── components/                # UI, tombstone cards, modals, Reown/Wagmi provider
│   ├── config/                    # BOT Chain Testnet & Reown AppKit configuration
│   ├── hooks/                     # On-chain stats & paginated cemetery hooks
│   └── lib/                       # ABI, contract helpers & server .env loader
├── hardhat.config.ts
├── .env                           # Local environment config (gitignored)
├── .env.example                   # Environment template
└── README.md
```

---

## Smart Contract Overview (`BOTDigitalCemetery.sol`)

- **`buryProject(string projectName, string inscription)`**: Validates non-empty strings (1–60 characters for `projectName`, 1–180 characters for `inscription`), assigns an incrementing grave ID starting at `1`, records `msg.sender` and `block.timestamp`, and emits `ProjectBuried`.
- **`digUp(uint256 graveId)`**: Restricted to the original grave `owner`. Rejects nonexistent IDs and already dug-up graves, sets `isDugUp = true` while preserving the full historical record, and emits `ProjectDugUp`.
- **View & Paginated Functions**:
  - `getGrave(uint256 graveId)`
  - `getTotalGraves()`, `getTotalActiveGraves()`, `getTotalDugUpGraves()`
  - `getGravesByOwner(address user)`, `getOwnerGraveCount(address user)`
  - `getGraveStatus(uint256 graveId)` (`0 = Active`, `1 = DugUp`)
  - `getGravesPaginated(uint256 offset, uint256 limit, bool newestFirst)` (capped at 50 per call)
  - `getGravesByOwnerPaginated(address user, uint256 offset, uint256 limit, bool newestFirst)`

---

## Setup & Installation

1. **Install root (Hardhat) dependencies:**
   ```bash
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   npm --prefix frontend install
   ```

3. **Configure `.env` at the project root:**
   Edit `.env` (already created from `.env.example`):
   ```env
   BOT_TESTNET_RPC_URL=https://rpc.bohr.life
   DEPLOYER_PRIVATE_KEY=your_testnet_deployer_private_key
   REOWN_ID=your_reown_project_id
   NEXT_PUBLIC_CONTRACT_ADDRESS=
   ```
   - `REOWN_ID` is read server-side by Next.js (`frontend/lib/serverEnv.ts`) rather than exposed as a `VITE_REOWN_ID` or `NEXT_PUBLIC_` build variable.
   - Never commit `.env` or share `DEPLOYER_PRIVATE_KEY`.

---

## Running Contract Tests

```bash
npm test
```

Compiles `BOTDigitalCemetery.sol` with Solidity `0.8.20` and runs all 12 automated tests covering burial validation, character limits, incrementing IDs, owner tracking, unauthorized/nonexistent/duplicate dig-up rejections, history preservation, event emissions, and pagination.

---

## Deploying to BOT Chain Testnet (Chain ID 968)

1. Fund the wallet corresponding to `DEPLOYER_PRIVATE_KEY` with testnet `BOT` for gas.
2. Run the deployment script:
   ```bash
   npm run deploy:testnet
   ```
3. Copy the printed contract address into `.env`:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
   ```

---

## Running the Frontend

Development server:
```bash
npm run frontend:dev
```

Production build & start:
```bash
npm run frontend:build
npm --prefix frontend run start
```

Open [http://localhost:3000](http://localhost:3000) to explore the cemetery, connect a wallet via Reown AppKit, switch to BOT Chain Testnet (`968`), bury abandoned projects, and dig up your own graves.

