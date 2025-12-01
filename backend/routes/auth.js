import express from "express";
import fs from "fs";
import bcrypt from "bcrypt";

const router = express.Router();
const USERS_FILE = "./users.json";

// Load users from file
const loadUsers = () => {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE));
};

// Save users back to file
const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// ✅ Signup route
router.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ success: false, error: "All fields required" });
  }

  const users = loadUsers();
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ success: false, error: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed, role });
  saveUsers(users);

  res.json({ success: true, message: "Signup successful" });
});

// ✅ Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(400).json({ success: false, error: "Invalid username" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ success: false, error: "Invalid password" });

  res.json({ success: true, role: user.role });
});

export default router;
