import { createConfig, http, type Config } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { defineChain } from "@reown/appkit/networks";
import {
  BOT_CHAIN_EXPLORER,
  BOT_CHAIN_ID,
  BOT_CHAIN_RPC,
  botChainTestnet,
} from "./chain";

export const appKitBotChainTestnet = defineChain({
  id: BOT_CHAIN_ID,
  caipNetworkId: `eip155:${BOT_CHAIN_ID}`,
  chainNamespace: "eip155",
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

let cachedWagmiConfig: Config | null = null;
let initializedProjectId: string | null = null;

export function getOrCreateWagmiConfig(reownId: string): {
  wagmiConfig: Config;
  appKitReady: boolean;
} {
  const trimmedId = reownId.trim();

  if (trimmedId) {
    if (!cachedWagmiConfig || initializedProjectId !== trimmedId) {
      const wagmiAdapter = new WagmiAdapter({
        networks: [appKitBotChainTestnet],
        projectId: trimmedId,
        ssr: true,
        transports: {
          [BOT_CHAIN_ID]: http(BOT_CHAIN_RPC),
        },
      });

      if (typeof window !== "undefined") {
        const origin = window.location.origin;
        createAppKit({
          adapters: [wagmiAdapter],
          networks: [appKitBotChainTestnet],
          defaultNetwork: appKitBotChainTestnet,
          projectId: trimmedId,
          metadata: {
            name: "BOT Digital Cemetery",
            description: "An on-chain resting place for abandoned ideas on BOT Chain Testnet.",
            url: origin,
            icons: [`${origin}/icon.svg`],
          },
          features: {
            analytics: false,
          },
          themeMode: "dark",
          themeVariables: {
            "--w3m-accent": "#a855f7",
            "--w3m-border-radius-master": "2px",
          },
        });
      }

      cachedWagmiConfig = wagmiAdapter.wagmiConfig as unknown as Config;
      initializedProjectId = trimmedId;
    }

    return { wagmiConfig: cachedWagmiConfig!, appKitReady: true };
  }

  if (!cachedWagmiConfig) {
    cachedWagmiConfig = createConfig({
      chains: [botChainTestnet],
      ssr: true,
      transports: {
        [BOT_CHAIN_ID]: http(BOT_CHAIN_RPC),
      },
    });
  }

  return { wagmiConfig: cachedWagmiConfig!, appKitReady: false };
}

