// scripts/deploy.cjs
const hre = require("hardhat");

async function main() {
  const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
  const evidence = await EvidenceRegistry.deploy();

  await evidence.waitForDeployment();

  console.log("✅ Contract deployed to:", await evidence.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
