# voice_assistant.py
import sys
import os
import json
import wave
import numpy as np
from pydub import AudioSegment
import tempfile

# -----------------------------
# Audio processing utilities
# -----------------------------
def load_audio(file_path):
    """
    Convert any audio file (MP3/WAV) to 16kHz mono WAV.
    Returns path to temporary WAV file.
    """
    try:
        audio = AudioSegment.from_file(file_path)
    except Exception as e:
        raise ValueError(f"Cannot read audio file: {e}")

    audio = audio.set_channels(1).set_frame_rate(16000)

    temp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
    audio.export(temp_wav, format="wav")
    return temp_wav

def read_wav(path):
    with wave.open(path, 'rb') as wf:
        n_channels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        framerate = wf.getframerate()
        n_frames = wf.getnframes()
        audio_bytes = wf.readframes(n_frames)
    if sampwidth != 2:
        raise ValueError('Only 16-bit PCM WAV supported.')
    data = np.frombuffer(audio_bytes, dtype=np.int16)
    if n_channels == 2:
        data = data.reshape(-1, 2).mean(axis=1)
    data = data.astype(np.float32) / 32768.0
    return data, framerate

def zero_crossing_rate(sig):
    signs = np.sign(sig)
    signs[signs == 0] = 1
    zc = np.mean(np.abs(np.diff(signs))) / 2.0
    return float(zc)

def spectral_flatness(sig, sr, frame_size=1024, hop=512, eps=1e-12):
    n = len(sig)
    flats = []
    for start in range(0, n - frame_size, hop):
        frame = sig[start:start+frame_size]
        if np.all(frame == 0):
            continue
        window = np.hanning(frame_size)
        spec = np.fft.rfft(frame * window)
        mag = np.abs(spec)**2 + eps
        gmean = np.exp(np.mean(np.log(mag)))
        amean = np.mean(mag)
        flats.append(gmean / (amean + eps))
    return float(np.median(flats)) if flats else 0.0

def clipping_ratio(sig, thresh=0.98):
    return float(np.mean(np.abs(sig) > thresh))

# -----------------------------
# Deepfake detection (heuristic)
# -----------------------------
def detect_deepfake(file_path):
    try:
        wav_path = load_audio(file_path)
        sig, sr = read_wav(wav_path)
        zcr = zero_crossing_rate(sig)
        flat = spectral_flatness(sig, sr)
        clip = clipping_ratio(sig)

        score = 0.0
        if zcr > 0.12: score += 0.4
        if flat > 0.5: score += 0.4
        if clip > 0.02: score += 0.2

        label = 'Likely Human (Authentic)' if score < 0.5 else 'Possible Deepfake/Manipulated'
        confidence = min(score, 1.0)

        return {
            "fileName": os.path.basename(file_path),
            "isDeepfake": score >= 0.5,
            "confidence": round(confidence, 3),
            "label": label,
            "error": None,
            "details": {
                "zcr": round(zcr, 4),
                "spectral_flatness": round(flat, 4),
                "clipping_ratio": round(clip, 4),
                "score": round(score, 3)
            }
        }

    except Exception as e:
        return {
            "fileName": os.path.basename(file_path),
            "isDeepfake": False,
            "confidence": 0,
            "label": "error",
            "error": str(e),
            "details": {}
        }
    finally:
        # Cleanup temporary WAV if it was created
        if 'wav_path' in locals() and os.path.exists(wav_path):
            os.remove(wav_path)

# -----------------------------
# Command-line execution
# -----------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Please provide audio file path"}))
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({"error": "File not found"}))
        sys.exit(1)

    result = detect_deepfake(file_path)
    print(json.dumps(result))
