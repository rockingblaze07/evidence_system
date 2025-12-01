import React, { useState } from "react";
import CryptoJS from "crypto-js";
import { useTranslation } from "react-i18next";

const PoliceDashboard = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [officerName, setOfficerName] = useState("");
  const [designation, setDesignation] = useState("");
  const [hash, setHash] = useState("");
  const [backendResponse, setBackendResponse] = useState(null);
  const [evidenceId, setEvidenceId] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setHash("");
    setBackendResponse(null);
    setEvidenceId(null);
  };

  const handleHashFile = () => {
    if (!file) return alert(t("alerts.selectFile"));
    if (!officerName) return alert(t("alerts.enterOfficerName"));
    if (!designation) return alert(t("alerts.enterDesignation"));

    const reader = new FileReader();
    reader.onload = (event) => {
      const u8 = new Uint8Array(event.target.result);
      const wordArray = CryptoJS.lib.WordArray.create(u8);
      const fileHash = CryptoJS.SHA256(wordArray).toString();
      setHash(fileHash);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hash) return alert(t("alerts.generateHashFirst"));
    try {
      const metadata = {
        fileName: file.name,
        fileHash: hash,
        officerName,
        designation,
      };

      const response = await fetch("http://localhost:5000/evidence/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      }).catch((err) => {
        console.error("Network error:", err);
        alert(t("alerts.backendNotReachable"));
        return;
      });

      if (!response) return;
      const data = await response.json();
      setBackendResponse(data);

      if (data.success) {
        setEvidenceId(data.evidenceId);
        alert(t("alerts.submissionSuccess", { id: data.evidenceId }));
      } else {
        alert(`Backend error: ${data.error || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error("Error sending metadata:", err);
      alert(t("alerts.errorSendingMetadata"));
    }
  };

  return (
    <div className="relative flex justify-center mt-28">
      <div className="blurry-shape absolute -z-10"></div>
      <div className="panel max-w-md w-full p-6 rounded-2xl shadow-lg border border-blue-500 relative z-10 text-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">🚔 {t("police.title")}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t("police.officerName")}
            value={officerName}
            onChange={(e) => setOfficerName(e.target.value)}
            className="mb-4 block w-full p-2 rounded text-white bg-[#111] border border-gray-600"
          />
          <input
            type="text"
            placeholder={t("police.designation")}
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="mb-4 block w-full p-2 rounded text-white bg-[#111] border border-gray-600"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-4 block w-full text-sm text-green-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-mono
            file:bg-blue-500 file:text-black
            hover:file:bg-blue-400"
          />
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleHashFile}
              className="bg-green-600 hover:bg-green-500 text-black px-4 py-2 rounded"
            >
              {t("police.generateHash")}
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
            >
              {t("police.submit")}
            </button>
          </div>
        </form>

        {hash && (
          <div className="mt-4 p-2 bg-gray-900 rounded border border-green-400 text-green-300 text-sm break-all">
            <strong>{t("police.hash")}:</strong> {hash}
          </div>
        )}

        {evidenceId && (
          <div className="mt-4 p-2 bg-gray-900 rounded border border-yellow-400 text-yellow-300 text-sm">
            <strong>{t("police.evidenceId")}:</strong> {evidenceId}
            <br />
            <span className="text-gray-400 text-xs">{t("police.evidenceNote")}</span>
          </div>
        )}

        {backendResponse && (
          <div className="mt-4 p-2 bg-gray-900 rounded border border-blue-400 text-blue-300 text-sm max-h-60 overflow-auto">
            <strong>{t("police.backendResponse")}:</strong>
            <pre>{JSON.stringify(backendResponse, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliceDashboard;
