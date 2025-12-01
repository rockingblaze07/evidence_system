//evidence.js
import express from "express";
import { ethers } from "ethers";
import { abi } from "../YourContractABI.js";
import 'dotenv/config';

const router = express.Router();

// Provider, wallet, contract
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

// Police: Add evidence
router.post("/add", async (req, res) => {
  try {
    const { fileName, fileHash, officerName, designation } = req.body;

    if (!fileName || !fileHash || !officerName || !designation) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Add evidence to smart contract
    const tx = await contract.addEvidence(fileName, fileHash, officerName, designation);
    await tx.wait(); // Wait for transaction to be mined

    // Get the latest evidenceId
    const evidenceCount = await contract.evidenceCount();
    const evidenceId = Number(evidenceCount);

    // Return evidenceId + hash to frontend
    return res.json({ success: true, evidenceId, fileHash });
  } catch (err) {
    console.error("Error adding evidence:", err);

    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to send metadata to blockchain",
    });
  }
});

// Forensic: Verify evidence
router.post("/verify", async (req, res) => {
  try {
    const { evidenceId, fileHash } = req.body;

    if (!evidenceId || !fileHash) {
      return res.status(400).json({ success: false, error: "Missing evidenceId or fileHash" });
    }

    const ev = await contract.getEvidence(evidenceId);

    const storedHash = ev.fileHash ?? ev[1];
    const timestamp = Number(ev.timestamp ?? ev[4] ?? Date.now());
    const designation = ev.officerName ?? ev[3] ?? "Unknown"; // actual designation
    const officerName = ev.uploadedBy ?? ev[2] ?? "Unknown";  // actual officer name

    const verified = storedHash === fileHash;

    return res.json({ success: true, verified, storedHash, timestamp, officerName, designation });
  } catch (err) {
    console.error("Error verifying evidence:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


export default router;
