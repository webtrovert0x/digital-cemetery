# BOT Digital Cemetery — Technical Whitepaper

**Version:** 1.0  
**Network:** BOT Chain Testnet (Chain ID `968`)  
**Smart Contract:** `BOTDigitalCemetery.sol` (Solidity `0.8.20`)  
**Repository:** `https://github.com/webtrovert0x/digital-cemetery`

---

## 1. Abstract

Every builder leaves behind a trail of unfinished repositories, expired domains, abandoned Figma files, and ambitious New Year's resolutions. Most of those ideas quietly vanish when a laptop is wiped or a hosting bill goes unpaid.

**BOT Digital Cemetery** turns those abandoned projects into permanent, humorous, on-chain memorials on **BOT Chain Testnet**. Anyone with a Web3 wallet can carve a digital tombstone containing a project name and final epitaph, browse the graveyard without connecting a wallet, and—if inspiration ever strikes again—dig up their own buried project while preserving its full historical record on-chain.

The protocol is intentionally minimal: **zero platform fees, zero tokenomics, zero admin backdoors, and no centralized backend database**. Every state transition interacts directly with `BOTDigitalCemetery.sol` for standard BOT network gas fees only.

---

## 2. Core Design Principles

1. **Gas-Fee-Only Economics**  
   Neither `buryProject` nor `digUp` is `payable`. The contract never accepts, holds, or transfers `BOT` tokens, charges platform fees, or enforces subscriptions. Users pay only standard BOT Chain network gas.
2. **True Immutability & No Admin Privileges**  
   `BOTDigitalCemetery` has no `owner`, no `onlyOwner` modifiers, no upgrade proxy, no pause switch, and no ability for any third party to censor, edit, or delete a grave.
3. **Non-Destructive Exhumation ("Dig It Up")**  
   When an original creator digs up a grave, `isDugUp` transitions from `false` to `true`, updating the grave's status and global active/dug-up counters while leaving the original `id`, `owner`, `projectName`, `inscription`, and `burialTimestamp` intact forever.
4. **Zero-Backend Architecture**  
   All statistics, grave listings, ownership records, and newly minted grave IDs are read directly from BOT Chain contract state and transaction event logs.
5. **Bounded On-Chain Reads**  
   Listing functions never return an unbounded array of `Grave` structs in a single RPC call; reads are paginated and hard-capped at `MAX_PAGE_SIZE = 50`.

---

## 3. Network Configuration

BOT Digital Cemetery is built specifically for **BOT Chain Testnet**:

| Parameter | Value |
| --- | --- |
| **Network Name** | BOT Chain Testnet |
| **Chain ID** | `968` |
| **RPC Endpoint** | `https://rpc.bohr.life` |
| **Native Gas Token** | `BOT` (18 decimals) |
| **Block Explorer** | `https://scan.bohr.life/` |
| **Solidity Version** | `0.8.20` (EVM target `paris`, optimizer `200` runs) |

---

## 4. Smart Contract Architecture (`BOTDigitalCemetery.sol`)

### 4.1 Data Structures

Each buried project is represented by the `Grave` struct and `GraveStatus` enum:

```solidity
enum GraveStatus {
    Active,
    DugUp
}

struct Grave {
    uint256 id;
    address owner;
    string projectName;
    string inscription;
    uint256 burialTimestamp;
    bool isDugUp;
}
```

### 4.2 Storage Layout & Gas Efficiency

- `_totalGraves`: Incremented monotonically starting at `1` for each burial. Serves as both the total grave counter and next unique ID.
- `_totalDugUpGraves`: Incremented when a grave is dug up, allowing `getTotalActiveGraves()` (`_totalGraves - _totalDugUpGraves`) and `getTotalDugUpGraves()` to resolve in **O(1)** without iterating over storage.
- `_graves`: `mapping(uint256 => Grave)` storing canonical grave records.
- `_ownerGraveCount` & `_ownerGraveIds`: Per-wallet grave counts and ordered grave ID arrays for owner lookups and paginated owner queries.

### 4.3 Input Validation & UTF-8 Length Enforcement

To keep tombstones readable and prevent oversized storage writes while supporting international characters and emojis accurately:

- **Non-blank validation (`_hasNonWhitespace`)**: Rejects empty strings as well as whitespace-only strings (` `, `\t`, `\n`, `\r`) via custom errors `EmptyProjectName()` and `EmptyInscription()`.
- **Unicode code-point counting (`_utf8Length`)**: Counts UTF-8 characters rather than raw bytes so frontend character limits (`60` for `projectName`, `180` for `inscription`) match on-chain enforcement (`ProjectNameTooLong`, `InscriptionTooLong`).

### 4.4 Core Functions & Events

- `buryProject(string calldata projectName, string calldata inscription) external returns (uint256 graveId)`
  - Validates inputs, assigns `graveId = ++_totalGraves`, records `msg.sender` and `block.timestamp`, updates owner indexes, and emits:
    ```solidity
    event ProjectBuried(
        uint256 indexed graveId,
        address indexed owner,
        string projectName,
        uint256 timestamp
    );
    ```
- `digUp(uint256 graveId) external`
  - Verifies `graveId` exists (`GraveNotFound`), `msg.sender == grave.owner` (`NotGraveOwner`), and `!grave.isDugUp` (`GraveAlreadyDugUp`).
  - Sets `grave.isDugUp = true`, increments `_totalDugUpGraves`, and emits:
    ```solidity
    event ProjectDugUp(
        uint256 indexed graveId,
        address indexed owner,
        uint256 timestamp
    );
    ```
- **Read & Paginated Views**:
  - `getGrave(uint256 graveId)`
  - `getTotalGraves()`, `getTotalActiveGraves()`, `getTotalDugUpGraves()`
  - `getOwnerGraveCount(address user)`, `getGravesByOwner(address user)`
  - `getGraveStatus(uint256 graveId)`
  - `getGravesPaginated(uint256 offset, uint256 limit, bool newestFirst)`
  - `getGravesByOwnerPaginated(address user, uint256 offset, uint256 limit, bool newestFirst)`

---

## 5. Frontend & Wallet Architecture

The frontend (`frontend/`) is built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Wagmi v2**, **Viem**, **TanStack React Query**, and **Reown AppKit**.

### 5.1 Wallet & Network Integration

- **Reown AppKit + Wagmi Adapter**: Configured for BOT Chain Testnet (`968`) using a custom Viem chain definition (`frontend/config/chain.ts`).
- **Server-Side `REOWN_ID` Loading**: `REOWN_ID` is stored in the root `.env` file without `VITE_` or `NEXT_PUBLIC_` prefixes and read on the server by `frontend/lib/serverEnv.ts` inside `RootLayout` (`force-dynamic`). `DEPLOYER_PRIVATE_KEY` remains strictly isolated to Hardhat CLI scripts and is never exposed to Next.js client code.
- **Wrong-Network Detection**: Connected wallets on any chain other than `968` are prompted with a one-click **Switch to BOT Testnet** action before signing transactions.

### 5.2 User Workflows & Verification Guarantees

- **Permissionless Exploration**: Visitors can view live on-chain statistics, browse paginated tombstones, search by project name or `#ID`, filter by status (`All`, `Active`, `Dug Up`) or wallet address, and sort newest/oldest without connecting a wallet.
- **Bury Something**: Includes live tombstone preview artwork, character counters (`60` / `180`), and preset epitaph ideas. After submission, the UI tracks wallet signature -> pending transaction -> `useWaitForTransactionReceipt` confirmation before decoding the `ProjectBuried` event log to display the newly assigned `graveId` and a direct **BOTScan** link.
- **Dig It Up**: Only rendered on active graves whose `owner` matches the connected wallet address. Guarded by a confirmation dialog explaining that history remains permanently on-chain.

---

## 6. Security Model & Verification

### 6.1 Threat Considerations

- **Unauthorized Modification**: Only `grave.owner` can call `digUp(graveId)`; no function exists to edit `projectName`, `inscription`, `burialTimestamp`, or delete a record.
- **Ether/BOT Lockup**: Because no function is `payable` and no `receive`/`fallback` exists, accidental value transfers are rejected at the EVM level.
- **RPC / Gas Denial-of-Service**: All multi-record reads use bounded pagination (`MAX_PAGE_SIZE = 50`). When search or status filters are active, the client performs sequential 50-record batch reads rather than a single unbounded call.
- **No Optimistic Lies**: The UI never displays a burial or dig-up as complete until `useWaitForTransactionReceipt` confirms inclusion on BOT Chain Testnet.

### 6.2 Automated Verification

The Hardhat test suite (`test/BOTDigitalCemetery.test.ts`) verifies all 12 core contract behaviors:
1. Successful project burial and storage of all `Grave` fields.
2. Rejection of empty and whitespace-only project names.
3. Rejection of empty and whitespace-only inscriptions.
4. Enforcement of 60-character name and 180-character inscription limits (including multi-byte UTF-8).
5. Unique incrementing grave IDs and per-owner tracking.
6. `ProjectBuried` event emission with indexed arguments.
7. Owner-initiated `digUp` preserving original burial history and updating counters.
8. Rejection of unauthorized `digUp` attempts (`NotGraveOwner`).
9. Rejection of nonexistent grave IDs (`GraveNotFound`).
10. Rejection of repeated `digUp` calls (`GraveAlreadyDugUp`).
11. `getGrave` and `getGraveStatus` revert behavior on invalid IDs.
12. `getGravesPaginated` and `getGravesByOwnerPaginated` newest-first/oldest-first ordering.

---

## 7. Future Directions (Post-MVP Ideas)

Potential future extensions—preserving the core gas-fee-only, zero-bloat philosophy—could include:
- Deployment to BOT Chain Mainnet once validated on Testnet (`968`).
- Optional off-chain indexing via BOTScan / event subgraphs for instant full-text search as grave counts grow into tens of thousands.
- Non-financial "pay respects" (`F`) reaction counters or shareable SVG tombstone cards.
