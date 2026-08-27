let selectedFile = null;
let generatedHash = "";


document.addEventListener("DOMContentLoaded", () => {

    if (!requireRole(["admin", "police"])) {
        return;
    }

    const fileInput =
        document.getElementById("evidenceFile");

    const hashButton =
        document.getElementById("hashButton");

    const evidenceForm =
        document.getElementById("evidenceForm");

    fileInput.addEventListener("change", (event) => {

    console.log("FILE INPUT CHANGE EVENT FIRED");

    const files = event.target.files;

    console.log("Files:", files);

    if (!files || files.length === 0) {

        selectedFile = null;

        document.getElementById("selectedFileName").textContent =
            "No file selected";

        console.log("No file selected");

        return;
    }

    selectedFile = files[0];

    console.log("Selected file:", selectedFile);
    console.log("File name:", selectedFile.name);
    console.log("File size:", selectedFile.size);
    console.log("File type:", selectedFile.type);

    document.getElementById("selectedFileName").textContent =
        `Selected: ${selectedFile.name}`;

    generatedHash = "";

    document
        .getElementById("hashResult")
        .classList.add("hidden");

    document
        .getElementById("evidenceIdResult")
        .classList.add("hidden");
});


    hashButton.addEventListener(
        "click",
        generateFileHash
    );


    evidenceForm.addEventListener(
        "submit",
        submitEvidence
    );
});


async function generateFileHash() {

    const officerName =
        document.getElementById("officerName")
            .value
            .trim();

    const designation =
        document.getElementById("designation")
            .value
            .trim();

    if (!selectedFile) {

        alert("Please select a file!");

        return;
    }

    if (!officerName) {

        alert("Please enter officer name!");

        return;
    }

    if (!designation) {

        alert("Please enter designation!");

        return;
    }

    try {

        const buffer =
            await selectedFile.arrayBuffer();

        const hashBuffer =
            await crypto.subtle.digest(
                "SHA-256",
                buffer
            );

        const hashArray =
            Array.from(
                new Uint8Array(hashBuffer)
            );

        generatedHash =
            hashArray
                .map(
                    byte =>
                        byte
                            .toString(16)
                            .padStart(2, "0")
                )
                .join("");

        const result =
            document.getElementById("hashResult");

        result.innerHTML = `
            <strong>SHA-256 Hash:</strong>
            ${generatedHash}
        `;

        result.classList.remove("hidden");

    } catch (error) {

        console.error(error);

        alert("Error generating file hash.");
    }
}


async function submitEvidence(event) {

    event.preventDefault();

    if (!generatedHash) {

        alert("Generate hash first!");

        return;
    }

    const officerName =
        document.getElementById("officerName")
            .value
            .trim();

    const designation =
        document.getElementById("designation")
            .value
            .trim();

    const metadata = {

        fileName: selectedFile.name,

        fileHash: generatedHash,

        officerName,

        designation
    };

    try {

        const response =
            await fetch(
                "http://localhost:5000/evidence/add",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(metadata)
                }
            );

        const data =
            await response.json();

        const responseBox =
            document.getElementById(
                "backendResponse"
            );

        const responseText =
            document.getElementById(
                "backendResponseText"
            );

        responseText.textContent =
            JSON.stringify(
                data,
                null,
                2
            );

        responseBox.classList.remove(
            "hidden"
        );


        if (data.success) {

            const idBox =
                document.getElementById(
                    "evidenceIdResult"
                );

            idBox.innerHTML = `
                <strong>Evidence ID:</strong>
                ${data.evidenceId}
                <br>
                <span style="color:#777">
                    (Use this ID + same file
                    in Forensic Dashboard)
                </span>
            `;

            idBox.classList.remove(
                "hidden"
            );

            alert(
                `✅ Evidence submitted! Evidence ID: ${data.evidenceId}`
            );

        } else {

            alert(
                `Backend error: ${
                    data.error ||
                    JSON.stringify(data)
                }`
            );
        }

    } catch (error) {

        console.error(error);

        alert(
            "Cannot reach backend. Make sure server is running."
        );
    }
}