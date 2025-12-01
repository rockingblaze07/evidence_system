// backend/server.js
import cors from "cors";
import { spawn, execFile } from "child_process";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import "dotenv/config";
import { Wallet, ethers } from "ethers";
import evidenceRoutes from "./routes/evidence.js";
import { abi } from "./YourContractABI.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import cron from "node-cron";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ----------------------
// Middleware
// ----------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------
// User Auth (JSON based, no DB)
// ----------------------
const USERS_FILE = path.join(__dirname, "users.json");

// Load users
const loadUsers = () => {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE));
};

// Save users
const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Signup
app.post("/auth/signup", (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ success: false, error: "All fields required" });
  }

  const users = loadUsers();
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ success: false, error: "User already exists" });
  }

  users.push({ username, password, role });
  saveUsers(users);
  res.json({ success: true, message: "Signup successful" });
});

// Login
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(400).json({ success: false, error: "Invalid credentials" });
  }

  res.json({ success: true, role: user.role });
});

// ----------------------
// Multer setup for uploads
// ----------------------
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
const upload = multer({ dest: uploadsDir });

// ----------------------
// Auto-clean uploads folder every hour
// ----------------------
cron.schedule("0 * * * *", () => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return console.error("Error reading uploads folder:", err);
    files.forEach((file) =>
      fs.unlink(path.join(uploadsDir, file), (err) => err && console.error(err))
    );
    console.log(`🗑️ Cleaned ${files.length} files from uploads folder`);
  });
});

// ----------------------
// Environment Variables
// ----------------------
const PRIVATE_KEY = process.env.PRIVATE_KEY?.trim();
const RPC_URL = process.env.RPC_URL?.trim();
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS?.trim();

if (!PRIVATE_KEY || !RPC_URL || !CONTRACT_ADDRESS) {
  console.error("❌ Missing .env variables!");
  process.exit(1);
}

// ----------------------
// Provider, Wallet & Contract
// ----------------------
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

app.locals.wallet = wallet;
app.locals.provider = provider;
app.locals.contract = contract;

console.log("Wallet address:", wallet.address);
console.log("Connected to contract at:", CONTRACT_ADDRESS);

// ----------------------
// Routes
// ----------------------
app.use("/evidence", evidenceRoutes);

// Court dashboard
app.get("/court/evidences", async (req, res) => {
  try {
    const countBN = await contract.evidenceCount();
    const count = Number(countBN);
    const results = [];

    for (let i = 1; i <= count; i++) {
      const ev = await contract.getEvidence(i);
      results.push({
        id: i,
        fileName: ev.fileName ?? ev[0] ?? "Unknown",
        fileHash: ev.fileHash ?? ev[1] ?? "N/A",
        uploadedBy: ev.uploadedBy ?? ev[2] ?? "Unknown",
        officerName: ev.officerName ?? ev[3] ?? "Unknown",
        timestamp: Number(ev.timestamp ?? ev[4] ?? Date.now()),
      });
    }

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Court route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Forensic dashboard
app.get("/forensic/verify/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    const count = Number(await contract.evidenceCount());
    let match = null;

    for (let i = 1; i <= count; i++) {
      const ev = await contract.getEvidence(i);
      const fileHash = ev.fileHash ?? ev[1];
      if (fileHash === hash) {
        match = {
          action: "Evidence Collected",
          evidenceId: i,
          fileHash,
          timestamp: Number(ev.timestamp ?? ev[4]),
          officerName: ev.uploadedBy ?? ev[2] ?? "Unknown",
          designation: ev.officerName ?? ev[3] ?? "Unknown",
        };
        break;
      }
    }

    if (match) {
      res.json({ success: true, table: [match] });
    } else {
      res.json({
        success: false,
        table: [
          { action: "Not Found", fileHash: hash, timestamp: null, officerName: null, designation: null },
        ],
      });
    }
  } catch (err) {
    console.error("Forensic route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------
// AI Voice Verification
// ----------------------
app.post("/voice/verify", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  const audioPath = path.resolve(req.file.path);

  try {
    const py = execFile("python", ["voice_assistant.py", audioPath]);

    let output = "";
    let errorOutput = "";

    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    py.on("close", () => {
      if (errorOutput) console.warn("Python stderr:", errorOutput);

      try {
        const result = JSON.parse(output.trim());
        result.fileName = req.file.originalname;

        if (!result.error && result.confidence < 0.6) {
          result.label = "uncertain";
          result.isDeepfake = false;
        }

        res.json({ success: true, data: result });
      } catch (err) {
        console.error("Parse error:", err, "Raw output:", output);
        res.status(500).json({
          success: false,
          fileName: req.file.originalname,
          error: "Invalid JSON from Python",
        });
      } finally {
        fs.unlink(audioPath, (err) => err && console.error("Failed to delete temp file:", err));
      }
    });
  } catch (err) {
    console.error("Voice verify exception:", err);
    res.status(500).json({ success: false, fileName: req.file.originalname, error: err.message });
  }
});

// ----------------------
// Health check
// ----------------------
app.get("/", (req, res) => res.send("Backend server is running ✅"));

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
