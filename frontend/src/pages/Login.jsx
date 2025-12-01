import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
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

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !role || !password) return alert("⚠️ Enter all fields");

    // 🔍 Check against stored users
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const foundUser = users.find(
      (u) => u.username === username && u.password === password && u.role === role
    );

    if (!foundUser) {
      return alert("❌ Invalid credentials. Please signup first.");
    }

    // ✅ Save logged in user
    localStorage.setItem("user", JSON.stringify(foundUser));
    redirectUser(foundUser.role);
  };

  return (
    <div className="flex justify-center items-center mt-28">
      <form className="bg-gray-900 p-6 rounded shadow-lg" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-4">Login</h2>

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
          Login
        </button>

        <p className="mt-4 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-green-400 hover:underline">Signup</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
