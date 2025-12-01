import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.resolve(); // ESM doesn't have __dirname

// Load compiled contract JSON
const artifactPath = path.join(
  __dirname,
  "artifacts/contracts/EvidenceRegistry.sol/EvidenceRegistry.json"
);
const EvidenceRegistry = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

// Connect to local Hardhat node
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Wallet from .env PRIVATE_KEY
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract instance
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  EvidenceRegistry.abi,
  wallet
);

// ✅ Add Evidence
export async function addEvidence(fileName, fileHash, uploadedBy) {
  const tx = await contract.addEvidence(fileName, fileHash, uploadedBy);
  await tx.wait();
  return tx.hash; // returns transaction hash
}

// ✅ Get Evidence by ID
export async function getEvidence(id) {
  const evidence = await contract.evidences(id);
  return {
    fileName: evidence.fileName,
    fileHash: evidence.fileHash,
    uploadedBy: evidence.uploadedBy,
    timestamp: evidence.timestamp.toString() // convert BigNumber to string
  };
}

// ✅ Get total evidence count
// ✅ Get total evidence count
export async function getEvidenceCount() {
  const count = await contract.evidenceCount();
  return count.toString(); // convert BigInt to string
}


