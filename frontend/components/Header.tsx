"use client";

import { useAccount, useChainId, useDisconnect, useSwitchChain } from "wagmi";
import { AlertTriangle, ExternalLink, LogOut, Skull, Wallet, X } from "lucide-react";
import { BOT_CHAIN_EXPLORER, BOT_CHAIN_ID } from "@/config/chain";
import { shortenAddress } from "@/lib/contract";
import { useCemeteryContext } from "@/components/Web3Provider";

export function Header() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const {
    openConnectModal,
    missingReownNotice,
    dismissMissingReownNotice,
  } = useCemeteryContext();

  const isWrongNetwork = isConnected && chainId !== BOT_CHAIN_ID;

  return (
    <header className="sticky top-0 z-40 border-b border-cemetery-border/60 bg-cemetery-void/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <a href="#top" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/40 bg-cemetery-slate shadow-[0_0_20px_rgba(168,85,247,0.2)] transition group-hover:border-sky-400/60">
            <Skull className="h-5 w-5 text-purple-300 transition group-hover:text-sky-300" />
          </div>
          <div>
            <span className="font-display text-sm font-bold tracking-wider text-white sm:text-base">
              BOT CEMETERY
            </span>
            <span className="hidden items-center gap-1.5 text-[11px] text-cemetery-mist sm:flex">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              BOT Chain Testnet • ID {BOT_CHAIN_ID}
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-cemetery-mist md:flex">
          <a href="#cemetery" className="transition hover:text-white">
            Graveyard
          </a>
          <a href="#bury" className="transition hover:text-white">
            Bury a Project
          </a>
          <a
            href={BOT_CHAIN_EXPLORER}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 transition hover:text-sky-300"
          >
            BOTScan
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {isWrongNetwork && (
            <button
              type="button"
              onClick={() => switchChain({ chainId: BOT_CHAIN_ID })}
              disabled={isSwitching}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/15 px-3 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-500/25 disabled:opacity-60"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {isSwitching ? "Switching..." : "Switch to BOT Testnet"}
            </button>
          )}

          {isConnected && address ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={openConnectModal}
                className="inline-flex items-center gap-2 rounded-lg border border-cemetery-border bg-cemetery-slate/90 px-3 py-2 font-mono text-xs text-sky-200 transition hover:border-purple-400/60"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {shortenAddress(address)}
              </button>
              <button
                type="button"
                onClick={() => disconnect()}
                title="Disconnect wallet"
                className="rounded-lg border border-cemetery-border bg-cemetery-slate/80 p-2 text-cemetery-mist transition hover:border-rose-400/50 hover:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openConnectModal}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-500/50 bg-purple-600/20 px-3.5 py-2 text-xs font-semibold text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.2)] transition hover:border-purple-400 hover:bg-purple-600/35 sm:text-sm"
            >
              <Wallet className="h-4 w-4 text-purple-300" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {missingReownNotice && (
        <div className="border-t border-amber-500/30 bg-amber-950/60 px-4 py-2.5 text-xs text-amber-100">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <p>
              Wallet connection requires <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-amber-200">REOWN_ID</code> in the root{" "}
              <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-amber-200">.env</code> file. Add your Reown Project ID and restart the server.
            </p>
            <button
              type="button"
              onClick={dismissMissingReownNotice}
              className="rounded p-1 text-amber-200 hover:bg-amber-900/50"
              aria-label="Dismiss notice"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

