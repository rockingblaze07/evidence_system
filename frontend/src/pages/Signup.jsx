import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("police");
  const [password, setPassword] = useState("");

  // ✅ Redirect if already logged in
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      redirectUser(loggedInUser.role);
    }
  }, [navigate]);

  const redirectUser = (role) => {
    switch (role) {
      case "police": navigate("/police"); break;
      case "forensic": navigate("/forensic"); break;
      case "court": navigate("/court"); break;
      case "admin": navigate("/voice-assistant"); break;
      default: navigate("/"); break;
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!username || !role || !password) return alert("⚠️ Enter all fields");

    // 📦 Load existing users
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // ❌ Prevent duplicate username for same role
    if (users.some((u) => u.username === username && u.role === role)) {
      return alert("⚠️ User with this username & role already exists.");
    }

    const newUser = { username, role, password };

    // ✅ Save updated users list
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("✅ Signup successful! Please login.");
    navigate("/login");
  };

  return (
    <div className="flex justify-center items-center mt-28">
      <form className="bg-gray-900 p-6 rounded shadow-lg" onSubmit={handleSignup}>
        <h2 className="text-2xl font-bold mb-4">Signup</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-2 p-2 w-full rounded"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mb-2 p-2 w-full rounded"
        >
          <option value="police">Police</option>
          <option value="forensic">Forensic</option>
          <option value="court">Court</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2 p-2 w-full rounded"
        />

        <button type="submit" className="bg-green-500 p-2 w-full rounded">
          Signup
        </button>

        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-400 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
