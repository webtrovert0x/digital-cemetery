"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Shovel, Sparkles } from "lucide-react";
import { getExplorerAddressUrl } from "@/config/chain";
import { formatBurialDate, shortenAddress, type Grave } from "@/lib/contract";
import { TombstoneArt } from "@/components/TombstoneArt";

interface TombstoneCardProps {
  grave: Grave;
  connectedAddress?: string;
  onRequestDigUp: (grave: Grave) => void;
}

export function TombstoneCard({
  grave,
  connectedAddress,
  onRequestDigUp,
}: TombstoneCardProps) {
  const [copied, setCopied] = useState(false);

  const isOwner =
    Boolean(connectedAddress) &&
    connectedAddress!.toLowerCase() === grave.owner.toLowerCase();

  const handleCopyOwner = async () => {
    try {
      await navigator.clipboard.writeText(grave.owner);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${
        grave.isDugUp
          ? "border-purple-500/40 bg-gradient-to-b from-[#171224]/95 to-[#0f0c18]/95 shadow-[0_10px_30px_rgba(168,85,247,0.1)] hover:border-purple-400/65"
          : "border-cemetery-border bg-gradient-to-b from-cemetery-slate/90 to-cemetery-charcoal/95 shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:border-sky-400/50"
      }`}
    >
      {/* Top Status & ID Bar */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-md border border-cemetery-border/80 bg-black/30 px-2.5 py-1 font-mono text-xs text-cemetery-mist">
            Grave #{grave.id.toString()}
          </span>

          {grave.isDugUp ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-purple-200">
              <Sparkles className="h-3 w-3 text-purple-300" />
              Dug Up
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#4ade80]" />
              Active Grave
            </span>
          )}
        </div>

        {/* Tombstone Illustration */}
        <div className="mb-4 rounded-xl border border-white/5 bg-black/25 px-3 py-2">
          <TombstoneArt isDugUp={grave.isDugUp} graveId={grave.id.toString()} />
        </div>

        {/* Project Name & Inscription */}
        <h3 className="font-display text-lg font-bold leading-snug text-white break-words">
          {grave.projectName}
        </h3>

        <blockquote className="mt-2.5 rounded-xl border border-white/5 bg-black/25 p-3 text-sm italic leading-relaxed text-slate-300 break-words">
          “{grave.inscription}”
        </blockquote>
      </div>

      {/* Metadata Footer & Owner Dig-Up Action */}
      <div className="mt-5 space-y-3 border-t border-white/10 pt-3.5 text-xs text-cemetery-mist">
        <div className="flex items-center justify-between gap-2">
          <span className="text-cemetery-mist/75">Buried by</span>
          <div className="flex items-center gap-1.5 font-mono">
            <a
              href={getExplorerAddressUrl(grave.owner)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sky-300 transition hover:text-sky-200"
              title={grave.owner}
            >
              {shortenAddress(grave.owner)}
              {isOwner && (
                <span className="rounded bg-sky-500/20 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-sky-200">
                  You
                </span>
              )}
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={handleCopyOwner}
              title="Copy owner address"
              className="rounded p-1 text-cemetery-mist transition hover:bg-white/10 hover:text-white"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-cemetery-mist/75">Burial date</span>
          <span className="text-slate-300">{formatBurialDate(grave.burialTimestamp)}</span>
        </div>

        {isOwner && !grave.isDugUp && (
          <button
            type="button"
            onClick={() => onRequestDigUp(grave)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/45 bg-purple-600/20 px-3.5 py-2.5 text-xs font-semibold text-purple-100 transition hover:border-purple-300 hover:bg-purple-600/35"
          >
            <Shovel className="h-3.5 w-3.5 text-purple-300" />
            Dig It Up
          </button>
        )}
      </div>
    </article>
  );
}

