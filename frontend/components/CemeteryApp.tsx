"use client";

import { useCallback, useState } from "react";
import { ExternalLink, Ghost } from "lucide-react";
import { BOT_CHAIN_EXPLORER, BOT_CHAIN_ID, getExplorerAddressUrl } from "@/config/chain";
import { useCemeteryStats } from "@/hooks/useCemetery";
import { useCemeteryContext } from "@/components/Web3Provider";
import { AtmosphericBackdrop } from "@/components/AtmosphericBackdrop";
import { Header } from "@/components/Header";
import { HeroStats } from "@/components/HeroStats";
import { BuryForm } from "@/components/BuryForm";
import { CemeteryExplorer } from "@/components/CemeteryExplorer";

export function CemeteryApp() {
  const { contractAddress } = useCemeteryContext();
  const [refreshNonce, setRefreshNonce] = useState(0);

  const { stats, isLoading: isStatsLoading, refetch: refetchStats } =
    useCemeteryStats(contractAddress);

  const handleRefreshAll = useCallback(() => {
    void refetchStats();
    setRefreshNonce((n) => n + 1);
  }, [refetchStats]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <AtmosphericBackdrop />
      <Header />

      <main className="flex-1">
        <HeroStats
          stats={stats}
          isLoading={isStatsLoading}
          hasContract={Boolean(contractAddress)}
        />
        <BuryForm onBuriedSuccess={handleRefreshAll} />
        <CemeteryExplorer
          refreshNonce={refreshNonce}
          onRefreshAll={handleRefreshAll}
        />
      </main>

      <footer className="mt-16 border-t border-cemetery-border/60 bg-cemetery-void/90 py-8 text-xs text-cemetery-mist">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Ghost className="h-4 w-4 text-purple-300" />
            <span>
              BOT Digital Cemetery • Built for BOT Chain Testnet (Chain ID {BOT_CHAIN_ID})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {contractAddress && (
              <a
                href={getExplorerAddressUrl(contractAddress)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sky-300 transition hover:text-sky-200"
              >
                Contract on BOTScan
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <a
              href={BOT_CHAIN_EXPLORER}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition hover:text-white"
            >
              BOTScan Explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

