const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  // Load ABI from artifact
  const contractJson = JSON.parse(
    fs.readFileSync("./artifacts/contracts/EvidenceRegistry.sol/EvidenceRegistry.json", "utf8")
  );

  // Contract address from deployment
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  // Connect to local Hardhat node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Default Hardhat account #0 private key
  const signer = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  // Create contract instance
  const evidenceRegistry = new ethers.Contract(contractAddress, contractJson.abi, signer);

  console.log("Connected to contract at:", contractAddress);

  // 1️⃣ Add evidence
  const tx = await evidenceRegistry.addEvidence(
    "test.pdf",
    "QmHashExample12345",
    "PoliceStation-1",
    "Officer John Doe"

  );
  await tx.wait();
  console.log("✅ Evidence added");

  // 2️⃣ Read latest evidence count
  const count = await evidenceRegistry.evidenceCount();
  console.log("📊 Total evidences:", count.toString());

  // 3️⃣ Fetch evidence by ID (latest one)
  const evidence = await evidenceRegistry.getEvidence(count);
  console.log("📄 Evidence:", evidence);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
