"use client";

import { useCallback, useEffect, useState } from "react";
import { usePublicClient, useReadContracts } from "wagmi";
import { isAddress, type Address } from "viem";
import { BOT_CHAIN_ID } from "@/config/chain";
import { BOT_DIGITAL_CEMETERY_ABI } from "@/lib/abi";
import type { Grave } from "@/lib/contract";

export type StatusFilter = "all" | "active" | "dugUp";
export type SortOrder = "newest" | "oldest";

const BATCH_SIZE = BigInt(50);

export interface CemeteryStats {
  total: bigint;
  active: bigint;
  dugUp: bigint;
}

export function useCemeteryStats(contractAddress?: Address) {
  const result = useReadContracts({
    contracts: contractAddress
      ? [
          {
            address: contractAddress,
            abi: BOT_DIGITAL_CEMETERY_ABI,
            functionName: "getTotalGraves",
            chainId: BOT_CHAIN_ID,
          },
          {
            address: contractAddress,
            abi: BOT_DIGITAL_CEMETERY_ABI,
            functionName: "getTotalActiveGraves",
            chainId: BOT_CHAIN_ID,
          },
          {
            address: contractAddress,
            abi: BOT_DIGITAL_CEMETERY_ABI,
            functionName: "getTotalDugUpGraves",
            chainId: BOT_CHAIN_ID,
          },
        ]
      : [],
    query: {
      enabled: Boolean(contractAddress),
      refetchInterval: 20_000,
    },
  });

  const stats: CemeteryStats = {
    total: (result.data?.[0]?.result as bigint | undefined) ?? BigInt(0),
    active: (result.data?.[1]?.result as bigint | undefined) ?? BigInt(0),
    dugUp: (result.data?.[2]?.result as bigint | undefined) ?? BigInt(0),
  };

  return {
    stats,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
  };
}

interface UseCemeteryListParams {
  contractAddress?: Address;
  page: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: StatusFilter;
  walletFilter: string;
  sortOrder: SortOrder;
  refreshNonce: number;
}

export function useCemeteryList({
  contractAddress,
  page,
  pageSize,
  searchQuery,
  statusFilter,
  walletFilter,
  sortOrder,
  refreshNonce,
}: UseCemeteryListParams) {
  const publicClient = usePublicClient({ chainId: BOT_CHAIN_ID });
  const [graves, setGraves] = useState<Grave[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedSearch = searchQuery.trim().toLowerCase();
  const trimmedWallet = walletFilter.trim();
  const hasWalletText = trimmedWallet.length > 0;
  const validWallet = hasWalletText && isAddress(trimmedWallet)
    ? (trimmedWallet as Address)
    : undefined;
  const newestFirst = sortOrder === "newest";

  const fetchGraves = useCallback(async () => {
    if (!contractAddress || !publicClient) {
      setGraves([]);
      setTotalMatches(0);
      setError(null);
      return;
    }

    if (hasWalletText && !validWallet) {
      setGraves([]);
      setTotalMatches(0);
      setError("Enter a valid 0x wallet address to filter by owner.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const needsClientFilter = Boolean(trimmedSearch) || statusFilter !== "all";

      if (!needsClientFilter) {
        const offset = BigInt((page - 1) * pageSize);
        const limit = BigInt(pageSize);

        const [rows, total] = validWallet
          ? await publicClient.readContract({
              address: contractAddress,
              abi: BOT_DIGITAL_CEMETERY_ABI,
              functionName: "getGravesByOwnerPaginated",
              args: [validWallet, offset, limit, newestFirst],
            })
          : await publicClient.readContract({
              address: contractAddress,
              abi: BOT_DIGITAL_CEMETERY_ABI,
              functionName: "getGravesPaginated",
              args: [offset, limit, newestFirst],
            });

        setGraves(rows.map((g) => ({ ...g })));
        setTotalMatches(Number(total));
        return;
      }

      // Bounded page-by-page scan (50 graves per RPC call) when searching or filtering by status
      const collected: Grave[] = [];
      let offset = BigInt(0);
      let totalOnChain = BigInt(0);

      do {
        const [batch, total] = validWallet
          ? await publicClient.readContract({
              address: contractAddress,
              abi: BOT_DIGITAL_CEMETERY_ABI,
              functionName: "getGravesByOwnerPaginated",
              args: [validWallet, offset, BATCH_SIZE, newestFirst],
            })
          : await publicClient.readContract({
              address: contractAddress,
              abi: BOT_DIGITAL_CEMETERY_ABI,
              functionName: "getGravesPaginated",
              args: [offset, BATCH_SIZE, newestFirst],
            });

        totalOnChain = total;
        for (const item of batch) {
          collected.push({ ...item });
        }
        offset += BATCH_SIZE;
      } while (offset < totalOnChain);

      const filtered = collected.filter((grave) => {
        if (statusFilter === "active" && grave.isDugUp) return false;
        if (statusFilter === "dugUp" && !grave.isDugUp) return false;
        if (trimmedSearch) {
          const nameMatch = grave.projectName.toLowerCase().includes(trimmedSearch);
          const idMatch = `#${grave.id.toString()}` === trimmedSearch || grave.id.toString() === trimmedSearch;
          if (!nameMatch && !idMatch) return false;
        }
        return true;
      });

      const start = (page - 1) * pageSize;
      setTotalMatches(filtered.length);
      setGraves(filtered.slice(start, start + pageSize));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load graves from BOT Chain.";
      setError(msg);
      setGraves([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    contractAddress,
    publicClient,
    hasWalletText,
    validWallet,
    trimmedSearch,
    statusFilter,
    page,
    pageSize,
    newestFirst,
  ]);

  useEffect(() => {
    void fetchGraves();
  }, [fetchGraves, refreshNonce]);

  return {
    graves,
    totalMatches,
    isLoading,
    error,
    refetch: fetchGraves,
  };
}

