"use client";

import { ArrowDown, Ghost, Shovel } from "lucide-react";
import type { CemeteryStats } from "@/hooks/useCemetery";

interface HeroStatsProps {
  stats: CemeteryStats;
  isLoading: boolean;
  hasContract: boolean;
}

export function HeroStats({ stats, isLoading, hasContract }: HeroStatsProps) {
  const formatStat = (value: bigint) => {
    if (!hasContract) return "—";
    if (isLoading) return "...";
    return value.toString();
  };

  return (
    <section id="top" className="relative pt-14 pb-12 sm:pt-20 sm:pb-16">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-cemetery-slate/70 px-4 py-1.5 text-xs font-medium text-purple-200 backdrop-blur">
          <Ghost className="h-3.5 w-3.5 text-emerald-300" />
          BOT Chain Testnet (Chain ID 968) • Gas Fee Only
        </div>

        <h1 className="font-display text-4xl font-bold tracking-[0.08em] text-white drop-shadow-[0_4px_24px_rgba(168,85,247,0.35)] sm:text-6xl">
          BOT DIGITAL CEMETERY
        </h1>

        <p className="mt-4 font-display text-lg italic text-sky-200/95 sm:text-2xl">
          “Some projects deserve a proper burial.”
        </p>

        <p className="mx-auto mt-3 max-w-2xl text-sm text-cemetery-mist sm:text-base">
          An on-chain resting place for the ideas that never made it.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#bury"
            className="inline-flex items-center gap-2 rounded-xl border border-purple-400/50 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-indigo-500"
          >
            Bury a Project
          </a>
          <a
            href="#cemetery"
            className="inline-flex items-center gap-2 rounded-xl border border-cemetery-border bg-cemetery-slate/80 px-6 py-3 text-sm font-semibold text-sky-100 transition hover:-translate-y-0.5 hover:border-sky-400/50"
          >
            Explore Graves
            <ArrowDown className="h-4 w-4 text-sky-300" />
          </a>
        </div>

        {/* Live On-Chain Statistics */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-cemetery-border/80 bg-cemetery-charcoal/85 p-5 shadow-lg backdrop-blur transition hover:border-sky-400/40">
            <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-cemetery-mist">
              <Ghost className="h-4 w-4 text-sky-300" />
              Total Graves
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              {formatStat(stats.total)}
            </p>
            <p className="mt-1 text-xs text-cemetery-mist/80">Ever etched on BOT Chain</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/25 bg-cemetery-charcoal/85 p-5 shadow-lg backdrop-blur transition hover:border-emerald-400/50">
            <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-emerald-300/90">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
              Active Graves
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-emerald-200 sm:text-4xl">
              {formatStat(stats.active)}
            </p>
            <p className="mt-1 text-xs text-cemetery-mist/80">Resting in peace</p>
          </div>

          <div className="rounded-2xl border border-purple-500/25 bg-cemetery-charcoal/85 p-5 shadow-lg backdrop-blur transition hover:border-purple-400/50">
            <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-purple-300/90">
              <Shovel className="h-4 w-4 text-purple-300" />
              Dug-Up Graves
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-purple-200 sm:text-4xl">
              {formatStat(stats.dugUp)}
            </p>
            <p className="mt-1 text-xs text-cemetery-mist/80">Resurrected by owners</p>
          </div>
        </div>
      </div>
    </section>
  );
}
