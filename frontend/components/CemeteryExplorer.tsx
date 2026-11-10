"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Ghost,
  Loader2,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";
import {
  useCemeteryList,
  type SortOrder,
  type StatusFilter,
} from "@/hooks/useCemetery";
import type { Grave } from "@/lib/contract";
import { useCemeteryContext } from "@/components/Web3Provider";
import { TombstoneCard } from "@/components/TombstoneCard";
import { DigUpModal } from "@/components/DigUpModal";

const PAGE_SIZE = 9;

interface CemeteryExplorerProps {
  refreshNonce: number;
  onRefreshAll: () => void;
}

export function CemeteryExplorer({
  refreshNonce,
  onRefreshAll,
}: CemeteryExplorerProps) {
  const { address } = useAccount();
  const { contractAddress } = useCemeteryContext();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [walletFilter, setWalletFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [digUpTarget, setDigUpTarget] = useState<Grave | null>(null);

  const { graves, totalMatches, isLoading, error } = useCemeteryList({
    contractAddress,
    page,
    pageSize: PAGE_SIZE,
    searchQuery,
    statusFilter,
    walletFilter,
    sortOrder,
    refreshNonce,
  });

  const totalPages = Math.max(1, Math.ceil(totalMatches / PAGE_SIZE));
  const isFilteringMyGraves =
    Boolean(address) &&
    walletFilter.trim().toLowerCase() === address!.toLowerCase();

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setWalletFilter("");
    setSortOrder("newest");
    setPage(1);
  };

  return (
    <section id="cemetery" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Explore the Graveyard
          </h2>
          <p className="mt-1 text-sm text-cemetery-mist">
            Browse every tombstone etched on BOT Chain Testnet — no wallet required to
            read.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefreshAll}
          disabled={isLoading || !contractAddress}
          className="inline-flex items-center gap-2 rounded-xl border border-cemetery-border bg-cemetery-slate/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-sky-400/50 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Chain Data
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="mb-8 rounded-2xl border border-cemetery-border/80 bg-cemetery-charcoal/85 p-4 backdrop-blur">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Search by project name */}
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cemetery-mist" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by project name or #ID..."
              className="w-full rounded-xl border border-cemetery-border bg-black/40 py-2.5 pl-10 pr-8 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-cemetery-mist hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter by wallet address */}
          <div className="relative md:col-span-4">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cemetery-mist" />
            <input
              type="text"
              value={walletFilter}
              onChange={(e) => {
                setWalletFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by 0x wallet address..."
              className="w-full rounded-xl border border-cemetery-border bg-black/40 py-2.5 pl-10 pr-8 font-mono text-xs text-white placeholder:font-sans placeholder:text-sm placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
            />
            {walletFilter && (
              <button
                type="button"
                onClick={() => {
                  setWalletFilter("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-cemetery-mist hover:text-white"
                aria-label="Clear wallet filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort order */}
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={() => {
                setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
                setPage(1);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-cemetery-border bg-cemetery-slate/90 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-purple-400/50 hover:text-white"
            >
              <ArrowDownUp className="h-3.5 w-3.5 text-purple-300" />
              {sortOrder === "newest" ? "Sort: Newest First" : "Sort: Oldest First"}
            </button>
          </div>
        </div>

        {/* Status Filter Chips & Quick "My Graves" */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "all", label: "All Graves" },
                { key: "active", label: "Active Only" },
                { key: "dugUp", label: "Dug-Up Only" },
              ] as const
            ).map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setStatusFilter(option.key);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === option.key
                    ? "border border-purple-400/60 bg-purple-600/30 text-white"
                    : "border border-cemetery-border bg-black/30 text-cemetery-mist hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}

            {address && (
              <button
                type="button"
                onClick={() => {
                  setWalletFilter(isFilteringMyGraves ? "" : address);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  isFilteringMyGraves
                    ? "border border-sky-400/60 bg-sky-500/20 text-sky-100"
                    : "border border-cemetery-border bg-black/30 text-cemetery-mist hover:text-white"
                }`}
              >
                My Graves
              </button>
            )}
          </div>

          <span className="text-xs text-cemetery-mist">
            {contractAddress
              ? `${totalMatches} grave${totalMatches === 1 ? "" : "s"} found`
              : "Awaiting contract address"}
          </span>
        </div>
      </div>

      {/* Cemetery Grid / States */}
      {!contractAddress ? (
        <div className="rounded-2xl border border-dashed border-cemetery-border bg-cemetery-charcoal/70 p-10 text-center">
          <Ghost className="mx-auto h-10 w-10 text-purple-300/80" />
          <h3 className="mt-3 font-display text-xl font-bold text-white">
            Cemetery Contract Not Configured Yet
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-cemetery-mist">
            Deploy <code className="font-mono text-sky-300">BOTDigitalCemetery.sol</code> to
            BOT Chain Testnet (Chain ID 968) and set{" "}
            <code className="font-mono text-sky-300">NEXT_PUBLIC_CONTRACT_ADDRESS</code> in
            your root <code className="font-mono text-sky-300">.env</code> file.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/35 bg-rose-500/10 p-6 text-center text-sm text-rose-200">
          {error}
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-cemetery-border/60 bg-cemetery-charcoal/60 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-purple-300" />
          <p className="mt-3 text-sm text-cemetery-mist">
            Summoning tombstones from BOT Chain Testnet...
          </p>
        </div>
      ) : graves.length === 0 ? (
        <div className="rounded-2xl border border-cemetery-border/70 bg-cemetery-charcoal/70 p-12 text-center">
          <Ghost className="mx-auto h-10 w-10 text-cemetery-mist/70" />
          <h3 className="mt-3 font-display text-xl font-bold text-white">
            No tombstones match your search
          </h3>
          <p className="mt-2 text-sm text-cemetery-mist">
            {searchQuery || statusFilter !== "all" || walletFilter
              ? "Try clearing your filters or search term."
              : "The grounds are quiet. Be the first to bury an abandoned project above!"}
          </p>
          {(searchQuery || statusFilter !== "all" || walletFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 rounded-xl border border-purple-400/50 bg-purple-600/20 px-4 py-2 text-xs font-semibold text-purple-100 hover:bg-purple-600/35"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {graves.map((grave) => (
              <TombstoneCard
                key={grave.id.toString()}
                grave={grave}
                connectedAddress={address}
                onRequestDigUp={setDigUpTarget}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-xl border border-cemetery-border bg-cemetery-slate px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="font-mono text-xs text-cemetery-mist">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-cemetery-border bg-cemetery-slate px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      <DigUpModal
        grave={digUpTarget}
        contractAddress={contractAddress}
        onClose={() => setDigUpTarget(null)}
        onSuccess={onRefreshAll}
      />
    </section>
  );
}

