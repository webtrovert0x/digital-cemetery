"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { decodeEventLog } from "viem";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Flame,
  Loader2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { BOT_CHAIN_ID, getExplorerTxUrl } from "@/config/chain";
import { BOT_DIGITAL_CEMETERY_ABI } from "@/lib/abi";
import {
  MAX_INSCRIPTION_LENGTH,
  MAX_PROJECT_NAME_LENGTH,
  countCodePoints,
  parseContractError,
  shortenAddress,
} from "@/lib/contract";
import { useCemeteryContext } from "@/components/Web3Provider";
import { TombstoneArt } from "@/components/TombstoneArt";

const EXAMPLE_IDEAS = [
  {
    name: "My 2024 startup idea",
    inscription: "Raised 0 BOT, burned 14 domains, pivoted to sleep.",
  },
  {
    name: "That portfolio I never finished",
    inscription: "Still says 'Coming Soon' since 2022.",
  },
  {
    name: "The gym membership",
    inscription: "Attended twice in January. Spiritually present all year.",
  },
  {
    name: "My abandoned React project",
    inscription: "Killed by an infinite useEffect loop.",
  },
  {
    name: "The book I promised to write",
    inscription: "Chapter 1: The Title Page. End of book.",
  },
];

interface BuryFormProps {
  onBuriedSuccess: () => void;
}

export function BuryForm({ onBuriedSuccess }: BuryFormProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { contractAddress, openConnectModal } = useCemeteryContext();

  const [projectName, setProjectName] = useState("");
  const [inscription, setInscription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [didRefreshForTx, setDidRefreshForTx] = useState<string | null>(null);

  const {
    data: txHash,
    writeContractAsync,
    isPending: isSigning,
    reset: resetWrite,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: BOT_CHAIN_ID,
  });

  const nameCount = countCodePoints(projectName);
  const inscriptionCount = countCodePoints(inscription);

  const isWrongNetwork = isConnected && chainId !== BOT_CHAIN_ID;
  const isNameValid = projectName.trim().length > 0 && nameCount <= MAX_PROJECT_NAME_LENGTH;
  const isInscriptionValid =
    inscription.trim().length > 0 && inscriptionCount <= MAX_INSCRIPTION_LENGTH;
  const canSubmit =
    Boolean(contractAddress) &&
    isConnected &&
    !isWrongNetwork &&
    isNameValid &&
    isInscriptionValid &&
    !isSigning &&
    !isConfirming;

  const buriedGraveId = useMemo(() => {
    if (!receipt) return null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: BOT_DIGITAL_CEMETERY_ABI,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "ProjectBuried") {
          return decoded.args.graveId.toString();
        }
      } catch {
        // Ignore unrelated logs
      }
    }
    return null;
  }, [receipt]);

  useEffect(() => {
    if (isConfirmed && txHash && didRefreshForTx !== txHash) {
      setDidRefreshForTx(txHash);
      onBuriedSuccess();
    }
  }, [isConfirmed, txHash, didRefreshForTx, onBuriedSuccess]);

  useEffect(() => {
    if (isReceiptError && receiptError) {
      setErrorMessage(parseContractError(receiptError));
    }
  }, [isReceiptError, receiptError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!contractAddress) {
      setErrorMessage(
        "Contract address not configured. Deploy BOTDigitalCemetery and set NEXT_PUBLIC_CONTRACT_ADDRESS in .env."
      );
      return;
    }

    if (!isConnected) {
      openConnectModal();
      return;
    }

    if (isWrongNetwork) {
      switchChain({ chainId: BOT_CHAIN_ID });
      return;
    }

    if (!isNameValid) {
      setErrorMessage(
        `Project name must be 1–${MAX_PROJECT_NAME_LENGTH} characters.`
      );
      return;
    }

    if (!isInscriptionValid) {
      setErrorMessage(
        `Final inscription must be 1–${MAX_INSCRIPTION_LENGTH} characters.`
      );
      return;
    }

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: BOT_DIGITAL_CEMETERY_ABI,
        functionName: "buryProject",
        args: [projectName.trim(), inscription.trim()],
        chainId: BOT_CHAIN_ID,
      });
    } catch (err) {
      setErrorMessage(parseContractError(err));
    }
  };

  const handleBuryAnother = () => {
    setProjectName("");
    setInscription("");
    setErrorMessage(null);
    resetWrite();
  };

  const previewName = projectName.trim() || "My abandoned NFT marketplace";
  const previewInscription =
    inscription.trim() || "Born in Figma. Died in production.";

  return (
    <section id="bury" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-cemetery-border/80 bg-cemetery-charcoal/85 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Bury Something Permanently
            </h2>
            <p className="mt-1 text-sm text-cemetery-mist">
              Carve a digital tombstone on BOT Chain Testnet. Network gas fee only — zero
              platform fees.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            Gas Fee Only (0 BOT fee)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Form Column */}
          <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-7">
            <div>
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-cemetery-mist">
                Need inspiration? Try an epitaph:
              </span>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_IDEAS.map((idea) => (
                  <button
                    key={idea.name}
                    type="button"
                    onClick={() => {
                      setProjectName(idea.name);
                      setInscription(idea.inscription);
                      setErrorMessage(null);
                    }}
                    className="rounded-lg border border-cemetery-border bg-cemetery-slate/70 px-2.5 py-1 text-xs text-slate-300 transition hover:border-purple-400/50 hover:text-white"
                  >
                    {idea.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="project-name"
                  className="text-sm font-medium text-slate-200"
                >
                  Project Name
                </label>
                <span
                  className={`font-mono text-xs ${
                    nameCount > MAX_PROJECT_NAME_LENGTH
                      ? "text-rose-400"
                      : "text-cemetery-mist"
                  }`}
                >
                  {nameCount}/{MAX_PROJECT_NAME_LENGTH}
                </span>
              </div>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="My abandoned NFT marketplace"
                maxLength={MAX_PROJECT_NAME_LENGTH + 20}
                className="w-full rounded-xl border border-cemetery-border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="final-inscription"
                  className="text-sm font-medium text-slate-200"
                >
                  Final Inscription
                </label>
                <span
                  className={`font-mono text-xs ${
                    inscriptionCount > MAX_INSCRIPTION_LENGTH
                      ? "text-rose-400"
                      : "text-cemetery-mist"
                  }`}
                >
                  {inscriptionCount}/{MAX_INSCRIPTION_LENGTH}
                </span>
              </div>
              <textarea
                id="final-inscription"
                rows={4}
                value={inscription}
                onChange={(e) => {
                  setInscription(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Born in Figma. Died in production."
                maxLength={MAX_INSCRIPTION_LENGTH + 40}
                className="w-full resize-none rounded-xl border border-cemetery-border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {!contractAddress && (
              <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                Deploy <code className="font-mono">BOTDigitalCemetery.sol</code> to BOT
                Chain Testnet and add <code className="font-mono">NEXT_PUBLIC_CONTRACT_ADDRESS</code>{" "}
                to your root <code className="font-mono">.env</code> to enable on-chain burials.
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-200">
                {errorMessage}
              </div>
            )}

            {/* Pending state */}
            {txHash && !isConfirmed && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-400/40 bg-sky-500/10 p-3.5 text-xs text-sky-100">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
                  {isConfirming
                    ? "Carving tombstone on BOT Chain Testnet..."
                    : "Transaction submitted. Awaiting confirmation..."}
                </span>
                <a
                  href={getExplorerTxUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-sky-300 underline hover:text-white"
                >
                  Track on BOTScan
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* Confirmed state — only shown after transaction receipt confirms */}
            {isConfirmed && txHash && (
              <div className="rounded-xl border border-emerald-400/45 bg-emerald-500/10 p-4 text-xs text-emerald-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Rest in Peace! Your project is etched on-chain.
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  {buriedGraveId && (
                    <span className="rounded-md border border-emerald-400/35 bg-black/30 px-2.5 py-1 font-mono text-emerald-200">
                      New Grave ID: #{buriedGraveId}
                    </span>
                  )}
                  <a
                    href={getExplorerTxUrl(txHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sky-300 underline hover:text-sky-200"
                  >
                    View Transaction on BOTScan
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleBuryAnother}
                  className="mt-3 rounded-lg border border-emerald-400/40 bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-100 transition hover:bg-emerald-600/35"
                >
                  Bury another project
                </button>
              </div>
            )}

            {/* Action Button */}
            {!isConnected ? (
              <button
                type="button"
                onClick={openConnectModal}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/50 bg-purple-600/30 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-purple-600/45"
              >
                <Wallet className="h-4 w-4 text-purple-200" />
                Connect Wallet to Bury Project
              </button>
            ) : isWrongNetwork ? (
              <button
                type="button"
                onClick={() => switchChain({ chainId: BOT_CHAIN_ID })}
                disabled={isSwitching}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/50 bg-amber-500/20 px-5 py-3.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/30 disabled:opacity-60"
              >
                <AlertTriangle className="h-4 w-4" />
                {isSwitching
                  ? "Switching to BOT Chain Testnet..."
                  : "Switch to BOT Chain Testnet (Chain 968)"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/60 bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(168,85,247,0.3)] transition hover:from-purple-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirm in Wallet...
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Waiting for Confirmation...
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4" />
                    Bury Project on BOT Chain
                  </>
                )}
              </button>
            )}
          </form>

          {/* Live Tombstone Preview Column */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div className="rounded-2xl border border-sky-400/25 bg-gradient-to-b from-cemetery-slate/90 to-black/70 p-5 shadow-inner">
              <div className="mb-3 flex items-center justify-between text-xs text-cemetery-mist">
                <span className="font-semibold uppercase tracking-wider text-sky-300">
                  Live Tombstone Preview
                </span>
                <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-200">
                  Active Grave
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 px-3 py-2">
                <TombstoneArt isDugUp={false} graveId="PREVIEW" />
              </div>

              <h3 className="mt-4 font-display text-lg font-bold text-white break-words">
                {previewName}
              </h3>

              <blockquote className="mt-2.5 rounded-xl border border-white/5 bg-black/30 p-3 text-sm italic text-slate-300 break-words">
                “{previewInscription}”
              </blockquote>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-cemetery-mist">
                <span>Owner</span>
                <span className="font-mono text-sky-200">
                  {address ? shortenAddress(address) : "0xYour...Wallet"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

