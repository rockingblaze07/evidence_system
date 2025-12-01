import { Link, useNavigate } from "react-router-dom";
import React from "react";

function Navbar() {
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="relative flex items-center justify-between px-8 py-4 border-b border-green-400">
      {/* Logo / Title on left */}
      <div className="text-2xl md:text-3xl font-['Bruno Ace'] text-green-400 font-bold">
        Cybercrime Evidence Chain of Custody
      </div>

      {/* Navigation links on right */}
      <div className="space-x-8 text-lg md:text-xl font-['Abel'] text-green-300 flex items-center">
        <Link to="/" className="hover:text-green-400 transition">Home</Link>

        {/* Show links only if logged in */}
        {user && (
          <>
            {user.role === "police" && (
              <Link to="/police" className="hover:text-green-400 transition">Police</Link>
            )}
            {user.role === "forensic" && (
              <Link to="/forensic" className="hover:text-green-400 transition">Forensics</Link>
            )}
            {user.role === "court" && (
              <Link to="/court" className="hover:text-green-400 transition">Court</Link>
            )}
            {user.role === "admin" && (
              <>
                <Link to="/police" className="hover:text-green-400 transition">Police</Link>
                <Link to="/forensic" className="hover:text-green-400 transition">Forensics</Link>
                <Link to="/court" className="hover:text-green-400 transition">Court</Link>
                <Link to="/voice-assistant" className="hover:text-green-400 transition">AI Deepfake Detection</Link>
              </>
            )}

            {/* Logout button */}
            <button 
              onClick={handleLogout} 
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}

        {/* Show Login/Signup only if not logged in */}
        {!user && (
          <>
            <Link to="/login" className="text-green-400 hover:underline">Login</Link>
            <Link to="/signup" className="text-blue-400 hover:underline">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
