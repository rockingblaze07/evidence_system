document.addEventListener("DOMContentLoaded", () => {

    const button =
        document.getElementById(
            "verifyVoiceButton"
        );

    if (button) {

        button.addEventListener(
            "click",
            verifyVoice
        );
    }


    /*
     * Voice assistant embedded
     * inside forensic dashboard
     */

    const forensicButton =
        document.getElementById(
            "forensicVoiceButton"
        );

    if (forensicButton) {

        forensicButton.addEventListener(
            "click",
            verifyForensicVoice
        );
    }
});


async function verifyVoice() {

    const file =
        document.getElementById(
            "audioFile"
        ).files[0];

    const errorBox =
        document.getElementById(
            "voiceError"
        );

    const resultBox =
        document.getElementById(
            "voiceResult"
        );

    if (!file) {

        alert(
            "Select an audio file first"
        );

        return;
    }

    errorBox.textContent = "";

    resultBox.classList.add(
        "hidden"
    );

    const formData =
        new FormData();

    formData.append(
        "audio",
        file
    );

    try {

        const response =
            await fetch(
                "http://localhost:5000/voice/verify",
                {
                    method: "POST",
                    body: formData
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                data.error ||
                "Unknown error"
            );
        }

        displayVoiceResult(
            data.data,
            file.name,
            resultBox
        );

    } catch (error) {

        console.error(error);

        errorBox.textContent =
            "Error verifying voice. Check server and Python script.";
    }
}


async function verifyForensicVoice() {

    const file =
        document.getElementById(
            "forensicAudioFile"
        ).files[0];

    const resultBox =
        document.getElementById(
            "forensicVoiceResult"
        );

    if (!file) {

        alert(
            "Select an audio file first"
        );

        return;
    }

    const formData =
        new FormData();

    formData.append(
        "audio",
        file
    );

    try {

        const response =
            await fetch(
                "http://localhost:5000/voice/verify",
                {
                    method: "POST",
                    body: formData
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                data.error ||
                "Unknown error"
            );
        }

        displayVoiceResult(
            data.data,
            file.name,
            resultBox
        );

    } catch (error) {

        console.error(error);

        resultBox.innerHTML = `
            <p class="error-message">
                Error verifying voice.
            </p>
        `;
    }
}


function displayVoiceResult(
    data,
    originalFileName,
    container
) {

    const fileName =
        data?.fileName ||
        originalFileName;

    const isDeepfake =
        data?.isDeepfake ?? false;

    const confidence =
        data?.confidence ?? 0;

    const label =
        data?.label || "N/A";

    const pythonError =
        data?.error || null;

    container.innerHTML = `

        <p>
            <strong>File:</strong>
            ${fileName}
        </p>

        <p>
            <strong>Deepfake:</strong>
            ${isDeepfake ? "✅ Yes" : "❌ No"}
            (${(confidence * 100).toFixed(1)}%)
        </p>

        <p>
            <strong>Label:</strong>
            ${label}
        </p>

        ${
            pythonError
                ? `
                    <p class="error-message">
                        <strong>Python Error:</strong>
                        ${pythonError}
                    </p>
                  `
                : ""
        }
    `;

    container.classList.remove(
        "hidden"
    );
}