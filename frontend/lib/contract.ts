import { isAddress, type Address } from "viem";

export const MAX_PROJECT_NAME_LENGTH = 60;
export const MAX_INSCRIPTION_LENGTH = 180;

export interface Grave {
  id: bigint;
  owner: Address;
  projectName: string;
  inscription: string;
  burialTimestamp: bigint;
  isDugUp: boolean;
}

export function normalizeContractAddress(value?: string | null): Address | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !isAddress(trimmed)) {
    return undefined;
  }
  return trimmed;
}

export function shortenAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBurialDate(timestamp: bigint): string {
  if (timestamp === BigInt(0)) return "Pending";
  const date = new Date(Number(timestamp) * 1000);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Counts Unicode code points to match Solidity's `_utf8Length` helper.
 */
export function countCodePoints(text: string): number {
  return Array.from(text).length;
}

export function parseContractError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Transaction failed";

  if (/User rejected|User denied|rejected the request/i.test(message)) {
    return "Transaction signature was cancelled in your wallet.";
  }
  if (/EmptyProjectName/i.test(message)) {
    return "Please enter a non-empty project name.";
  }
  if (/EmptyInscription/i.test(message)) {
    return "Please enter a non-empty epitaph inscription.";
  }
  if (/ProjectNameTooLong/i.test(message)) {
    return `Project name cannot exceed ${MAX_PROJECT_NAME_LENGTH} characters.`;
  }
  if (/InscriptionTooLong/i.test(message)) {
    return `Inscription cannot exceed ${MAX_INSCRIPTION_LENGTH} characters.`;
  }
  if (/NotGraveOwner/i.test(message)) {
    return "Only the original grave owner can dig up this project.";
  }
  if (/GraveAlreadyDugUp/i.test(message)) {
    return "This grave has already been dug up.";
  }
  if (/GraveNotFound/i.test(message)) {
    return "That grave ID does not exist on-chain.";
  }
  if (/insufficient funds/i.test(message)) {
    return "Insufficient BOT balance to cover network gas fees.";
  }

  return message.length > 180 ? `${message.slice(0, 177)}...` : message;
}

