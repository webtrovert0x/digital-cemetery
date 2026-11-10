import fs from "fs";
import path from "path";
import dotenv from "dotenv";

/**
 * Reads root `.env` on the server so runtime edits to REOWN_ID or
 * NEXT_PUBLIC_CONTRACT_ADDRESS are picked up cleanly without using VITE_REOWN_ID.
 */
export function getServerConfig(): {
  reownId: string;
  contractAddress: string;
} {
  let fileEnv: Record<string, string> = {};
  const rootEnvPath = path.resolve(process.cwd(), "../.env");

  if (fs.existsSync(rootEnvPath)) {
    try {
      const raw = fs.readFileSync(rootEnvPath, "utf8");
      fileEnv = dotenv.parse(raw);
    } catch {
      // Fall back to process.env if root .env cannot be read
    }
  }

  const reownId = (process.env.REOWN_ID ?? fileEnv.REOWN_ID ?? "").trim();
  const contractAddress = (
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
    fileEnv.NEXT_PUBLIC_CONTRACT_ADDRESS ??
    ""
  ).trim();

  return { reownId, contractAddress };
}

