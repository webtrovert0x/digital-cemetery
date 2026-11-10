"use client";

import { useEffect, useState } from "react";
import {
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Shovel,
  X,
} from "lucide-react";
import type { Address } from "viem";
import { BOT_CHAIN_ID, getExplorerTxUrl } from "@/config/chain";
import { BOT_DIGITAL_CEMETERY_ABI } from "@/lib/abi";
import { parseContractError, type Grave } from "@/lib/contract";

interface DigUpModalProps {
  grave: Grave | null;
  contractAddress?: Address;
  onClose: () => void;
  onSuccess: () => void;
}

export function DigUpModal({
  grave,
  contractAddress,
  onClose,
  onSuccess,
}: DigUpModalProps) {
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const {
    data: txHash,
    writeContractAsync,
    isPending: isSigning,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: BOT_CHAIN_ID,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [didTriggerRefresh, setDidTriggerRefresh] = useState(false);

  useEffect(() => {
    setErrorMessage(null);
    setDidTriggerRefresh(false);
    resetWrite();
  }, [grave?.id, resetWrite]);

  useEffect(() => {
    if (isConfirmed && !didTriggerRefresh) {
      setDidTriggerRefresh(true);
      onSuccess();
    }
  }, [isConfirmed, didTriggerRefresh, onSuccess]);

  useEffect(() => {
    if (isReceiptError && receiptError) {
      setErrorMessage(parseContractError(receiptError));
    }
  }, [isReceiptError, receiptError]);

  if (!grave) return null;

  const isWrongNetwork = chainId !== BOT_CHAIN_ID;
  const isBusy = isSigning || isConfirming || isSwitching;

  const handleConfirmDigUp = async () => {
    if (!contractAddress) return;
    setErrorMessage(null);

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: BOT_DIGITAL_CEMETERY_ABI,
        functionName: "digUp",
        args: [grave.id],
        chainId: BOT_CHAIN_ID,
      });
    } catch (err) {
      setErrorMessage(parseContractError(err));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dig-up-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-cemetery-charcoal p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/15">
              <Shovel className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <h3 id="dig-up-modal-title" className="font-display text-lg font-bold text-white">
                Dig Up Grave #{grave.id.toString()}?
              </h3>
              <p className="text-xs text-cemetery-mist">
                Gas fee only • History remains permanently on-chain
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-lg p-1.5 text-cemetery-mist transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-cemetery-border bg-black/35 p-4">
          <p className="font-display text-base font-semibold text-white">
            {grave.projectName}
          </p>
          <p className="mt-1.5 text-xs italic text-slate-300">
            “{grave.inscription}”
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-cemetery-mist">
          Resurrecting this project marks the tombstone as{" "}
          <span className="font-semibold text-purple-200">Dug Up</span>. Its original
          burial timestamp, owner, and epitaph will never be deleted.
        </p>

        {isWrongNetwork && !isConfirmed && (
          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-200">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Switch to BOT Chain Testnet (968) to proceed.
            </span>
            <button
              type="button"
              onClick={() => switchChain({ chainId: BOT_CHAIN_ID })}
              disabled={isSwitching}
              className="shrink-0 rounded-lg bg-amber-500/25 px-2.5 py-1.5 font-semibold text-amber-100 hover:bg-amber-500/40"
            >
              {isSwitching ? "Switching..." : "Switch"}
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
            {errorMessage}
          </div>
        )}

        {txHash && !isConfirmed && (
          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-sky-400/35 bg-sky-500/10 p-3 text-xs text-sky-200">
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isConfirming
                ? "Waiting for BOT Chain confirmation..."
                : "Transaction submitted..."}
            </span>
            <a
              href={getExplorerTxUrl(txHash)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-sky-300 underline hover:text-white"
            >
              BOTScan
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {isConfirmed && txHash && (
          <div className="mt-4 rounded-xl border border-emerald-400/45 bg-emerald-500/10 p-3.5 text-xs text-emerald-100">
            <div className="flex items-center gap-2 font-semibold text-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Grave #{grave.id.toString()} has been dug up!
            </div>
            <a
              href={getExplorerTxUrl(txHash)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sky-300 underline hover:text-sky-200"
            >
              View confirmed transaction on BOTScan
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          {isConfirmed ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-emerald-400/50 bg-emerald-600/25 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-600/40"
            >
              Back to Cemetery
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isBusy}
                className="rounded-xl border border-cemetery-border bg-cemetery-slate px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDigUp}
                disabled={isBusy || isWrongNetwork || !contractAddress}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-400/50 bg-purple-600/75 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Confirm in Wallet...
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Shovel className="h-3.5 w-3.5" />
                    Confirm Dig Up
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

