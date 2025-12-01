//courtdashboard.jsx
import React, { useState, useEffect } from "react";

const CourtDashboard = () => {
  const [evidences, setEvidences] = useState([]);

  const fetchEvidences = async () => {
    try {
      const response = await fetch("http://localhost:5000/court/evidences"); 
      const data = await response.json();
      if (data.success) setEvidences(data.data);
    } catch (err) {
      console.error(err);
      alert("Could not fetch evidences from backend.");
    }
  };

  useEffect(() => {
    fetchEvidences();
  }, []);

  return (
    <div className="relative flex justify-center mt-28">
      {/* Blurry neon background */}
      <div className="blurry-shape absolute -z-10"></div>

      <div className="panel max-w-2xl w-full p-6 rounded-2xl shadow-lg border border-green-400 relative z-10 text-gray-300">
        <h2 className="text-2xl font-bold font-['Bruno Ace'] mb-4 text-green-400">⚖️ Court Dashboard</h2>

        {evidences.length === 0 ? (
          <p>No evidences found.</p>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            {evidences.map((ev) => (
              <div key={ev.id} className="p-4 bg-black/70 rounded border border-green-400">
                <p><strong>ID:</strong> {ev.id}</p>
                <p><strong>File:</strong> {ev.fileName || "N/A"}</p>
                <p><strong>Hash:</strong> {ev.fileHash || "N/A"}</p>
                <p><strong>Uploaded By:</strong> {ev.uploadedBy || "Unknown"}</p>
                <p><strong>Officer:</strong> {ev.officerName || "Unknown"}</p>
                <p><strong>Timestamp:</strong> {ev.timestamp ? new Date(ev.timestamp * 1000).toLocaleString() : "N/A"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourtDashboard;
