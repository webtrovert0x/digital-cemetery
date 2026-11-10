"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import type { Address } from "viem";
import { getOrCreateWagmiConfig } from "@/config/wagmi";
import { normalizeContractAddress } from "@/lib/contract";

interface CemeteryContextValue {
  hasReownId: boolean;
  contractAddress: Address | undefined;
  openConnectModal: () => void;
  missingReownNotice: boolean;
  dismissMissingReownNotice: () => void;
}

const CemeteryContext = createContext<CemeteryContextValue>({
  hasReownId: false,
  contractAddress: undefined,
  openConnectModal: () => {},
  missingReownNotice: false,
  dismissMissingReownNotice: () => {},
});

export function useCemeteryContext() {
  return useContext(CemeteryContext);
}

function AppKitModalBridge({
  onRegisterOpen,
}: {
  onRegisterOpen: (fn: () => void) => void;
}) {
  const { open } = useAppKit();

  useEffect(() => {
    onRegisterOpen(() => {
      void open();
    });
  }, [open, onRegisterOpen]);

  return null;
}

export function Web3Provider({
  children,
  reownId,
  rawContractAddress,
}: {
  children: React.ReactNode;
  reownId: string;
  rawContractAddress: string;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [missingReownNotice, setMissingReownNotice] = useState(false);
  const [appKitOpenFn, setAppKitOpenFn] = useState<(() => void) | null>(null);

  const { wagmiConfig, appKitReady } = useMemo(
    () => getOrCreateWagmiConfig(reownId),
    [reownId]
  );

  const contractAddress = useMemo(
    () => normalizeContractAddress(rawContractAddress),
    [rawContractAddress]
  );

  const contextValue = useMemo<CemeteryContextValue>(
    () => ({
      hasReownId: appKitReady,
      contractAddress,
      openConnectModal: () => {
        if (appKitReady && appKitOpenFn) {
          appKitOpenFn();
        } else {
          setMissingReownNotice(true);
        }
      },
      missingReownNotice,
      dismissMissingReownNotice: () => setMissingReownNotice(false),
    }),
    [appKitReady, contractAddress, appKitOpenFn, missingReownNotice]
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <CemeteryContext.Provider value={contextValue}>
          {appKitReady && (
            <AppKitModalBridge onRegisterOpen={(fn) => setAppKitOpenFn(() => fn)} />
          )}
          {children}
        </CemeteryContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

