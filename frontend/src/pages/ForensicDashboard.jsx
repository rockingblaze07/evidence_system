import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { useTranslation } from "react-i18next";
import VoiceAssistant from "./VoiceAssistant";
import { useNavigate } from "react-router-dom";  // ⬅️ add navigation

const ForensicDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();  // ⬅️ init navigation

  const [pendingEvidences, setPendingEvidences] = useState([]);
  const [file, setFile] = useState(null);
  const [evidenceId, setEvidenceId] = useState("");
  const [resultTable, setResultTable] = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch("http://localhost:5000/court/evidences");
        const data = await res.json();
        if (data.success) setPendingEvidences(data.data);
      } catch (err) {
        console.error(err);
        alert(t("forensic.errors.fetch"));
      }
    };
    fetchPending();
  }, [t]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResultTable(null);
  };

  const handleVerify = async () => {
    if (!file || !evidenceId) return alert(t("forensic.errors.missingInput"));

    const reader = new FileReader();
    reader.onload = async (event) => {
      const u8 = new Uint8Array(event.target.result);
      const wordArray = CryptoJS.lib.WordArray.create(u8);
      const fileHash = CryptoJS.SHA256(wordArray).toString();

      try {
        const response = await fetch("http://localhost:5000/evidence/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ evidenceId, fileHash }),
        });

        const data = await response.json();
        if (!data.success) return alert(data.error || t("forensic.errors.verifyFail"));

        if (!data.verified) {
          // 🚨 Evidence mismatch → force logout + redirect
          alert(t("Evidence Mismatched ❌"));
          localStorage.removeItem("user");
          navigate("/");  // ⬅️ redirect to home
          return;
        }

        // ✅ Evidence verified
        const action = t("Evidence Verified ✅");
        const formattedTimestamp = data.timestamp
          ? new Date(data.timestamp * 1000).toLocaleString()
          : "N/A";

        setResultTable([
          {
            action,
            fileHash: data.storedHash,
            timestamp: formattedTimestamp,
            officerName: data.officerName ?? t("forensic.unknown"),
            designation: data.designation ?? t("forensic.unknown"),
          },
        ]);
      } catch (err) {
        console.error(err);
        alert(t("forensic.errors.general"));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="relative flex justify-center mt-28">
      <div className="blurry-shape absolute -z-10"></div>
      <div className="panel max-w-md w-full p-6 rounded-2xl shadow-lg border border-green-500 relative z-10 text-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-green-400">
          {t("🧪 Forensic Dashboard")}
        </h2>

        {pendingEvidences.length > 0 && (
          <div className="mb-4 text-sm">
            <strong>{t("forensic.pending")}</strong>
            <ul className="list-disc list-inside">
              {pendingEvidences.map((ev) => (
                <li key={ev.id}>
                  {t("EvidenceId")}: {ev.id}, {t("file")}: {ev.fileName}
                </li>
              ))}
            </ul>
          </div>
        )}

        <input
          type="text"
          placeholder={t("Enter EvidenceId")}
          value={evidenceId}
          onChange={(e) => setEvidenceId(e.target.value)}
          className="mb-2 p-2 w-full rounded text-white bg-[#111] border border-gray-600"
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-2 block w-full text-sm text-green-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-mono
            file:bg-green-500 file:text-black
            hover:file:bg-green-400"
        />
        <button
          type="button"
          onClick={handleVerify}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
        >
          {t("verify")}
        </button>

        {resultTable && (
          <div className="mt-4 p-2 bg-gray-900 rounded border border-yellow-400 text-yellow-300 text-sm">
            <strong>{t("result")}</strong>
            <table className="w-full mt-2 text-left text-sm">
              <thead>
                <tr>
                  <th>{t("action")}</th>
                  <th>{t("hash")}</th>
                  <th>{t("timestamp")}</th>
                  <th>{t("officer")}</th>
                  <th>{t("designation")}</th>
                </tr>
              </thead>
              <tbody>
                {resultTable.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.action}</td>
                    <td className="break-all">{row.fileHash}</td>
                    <td>{row.timestamp}</td>
                    <td>{row.officerName}</td>
                    <td>{row.designation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 w-full max-w-md">
          <VoiceAssistant />
        </div>
      </div>
    </div>
  );
};

export default ForensicDashboard;
