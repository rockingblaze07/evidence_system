from flask import Flask, request, jsonify
from voice_assistant import detect_deepfake
import tempfile

app = Flask(__name__)

@app.route("/voice/verify", methods=["POST"])
def verify_voice():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400

    file = request.files["audio"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Save uploaded file to temp
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    file.save(temp_file.name)

    # Run deepfake detection
    result = detect_deepfake(temp_file.name)

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
