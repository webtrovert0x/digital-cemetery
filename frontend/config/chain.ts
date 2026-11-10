import { defineChain } from "viem";

export const BOT_CHAIN_ID = 968;
export const BOT_CHAIN_RPC = "https://rpc.bohr.life";
export const BOT_CHAIN_EXPLORER = "https://scan.bohr.life";

export const botChainTestnet = defineChain({
  id: BOT_CHAIN_ID,
  name: "BOT Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "BOT",
    symbol: "BOT",
  },
  rpcUrls: {
    default: {
      http: [BOT_CHAIN_RPC],
    },
  },
  blockExplorers: {
    default: {
      name: "BOTScan",
      url: BOT_CHAIN_EXPLORER,
    },
  },
  testnet: true,
});

export function getExplorerTxUrl(txHash: string): string {
  return `${BOT_CHAIN_EXPLORER}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${BOT_CHAIN_EXPLORER}/address/${address}`;
}

