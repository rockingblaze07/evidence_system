import React, { useState } from "react";

const VoiceAssistant = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleVerify = async () => {
    if (!file) return alert("Select an audio file first");

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch("http://localhost:5000/voice/verify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error || "Unknown error");

      setResult({
        fileName: data.data?.fileName || file.name,
        isDeepfake: data.data?.isDeepfake ?? false,
        confidence: data.data?.confidence ?? 0,
        label: data.data?.label || "N/A",
        error: data.data?.error || null,
      });
    } catch (err) {
      console.error(err);
      setError("Error verifying voice. Check server and Python script.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center mt-28">
      <div className="blurry-shape absolute -z-10"></div>

      <div className="panel max-w-2xl w-full flex flex-col gap-4 p-6 rounded-2xl shadow-lg relative z-10 text-green-300">
        <h2 className="text-3xl font-bold mb-4 text-green-400">🎤 AI Voice Assistant</h2>

        <input type="file" accept="audio/*" onChange={handleFileChange} className="mb-2 w-full" />
        <button
          onClick={handleVerify}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Voice"}
        </button>

        {error && <p className="text-red-400 mt-2">{error}</p>}

        {result && (
          <div className="panel text-green-300 mt-4 p-4 border border-green-500 rounded space-y-2">
            <p><strong>File:</strong> {result.fileName}</p>
            <p>
              <strong>Deepfake:</strong>{" "}
              {result.isDeepfake ? "✅ Yes" : "❌ No"} ({(result.confidence * 100).toFixed(1)}%)
            </p>
            <p><strong>Label:</strong> {"Likely Human"}</p>
            {result.error && <p className="text-red-400"><strong>Python Error:</strong> {result.error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
