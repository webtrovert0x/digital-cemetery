import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  if (!deployer) {
    throw new Error(
      "No deployer account configured. Set DEPLOYER_PRIVATE_KEY in your .env file before deploying."
    );
  }

  const providerNetwork = await ethers.provider.getNetwork();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Deploying BOTDigitalCemetery...");
  console.log(`Network: ${network.name} (chainId: ${providerNetwork.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} BOT`);

  if (network.name === "botTestnet" && providerNetwork.chainId !== 968n) {
    throw new Error(
      `Expected BOT Chain Testnet (chainId 968), got ${providerNetwork.chainId}`
    );
  }

  if (balance === 0n) {
    throw new Error(
      "Deployer balance is 0 BOT. Fund this wallet on BOT Chain Testnet before deploying."
    );
  }

  const Cemetery = await ethers.getContractFactory("BOTDigitalCemetery");
  const cemetery = await Cemetery.deploy();
  await cemetery.waitForDeployment();

  const contractAddress = await cemetery.getAddress();
  const deployTx = cemetery.deploymentTransaction();

  console.log(`\nBOTDigitalCemetery deployed to: ${contractAddress}`);
  if (deployTx) {
    console.log(`Transaction hash: ${deployTx.hash}`);
  }

  if (providerNetwork.chainId === 968n) {
    console.log(`Explorer (Contract): https://scan.bohr.life/address/${contractAddress}`);
    if (deployTx) {
      console.log(`Explorer (Tx):       https://scan.bohr.life/tx/${deployTx.hash}`);
    }
  }

  console.log("\nNext step: add this line to your .env file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

