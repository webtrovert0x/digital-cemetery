import type { Metadata } from "next";
import { getServerConfig } from "@/lib/serverEnv";
import { Web3Provider } from "@/components/Web3Provider";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BOT Digital Cemetery | On-Chain Graveyard for Abandoned Projects",
  description:
    "Some projects deserve a proper burial. An on-chain resting place for abandoned ideas on BOT Chain Testnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { reownId, contractAddress } = getServerConfig();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Web3Provider reownId={reownId} rawContractAddress={contractAddress}>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}

