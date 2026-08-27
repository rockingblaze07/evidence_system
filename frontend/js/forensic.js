let forensicFile = null;


document.addEventListener("DOMContentLoaded", async () => {

    if (!requireRole(["admin", "forensic"])) {
        return;
    }

    await loadPendingEvidence();

    document
        .getElementById("forensicFile")
        .addEventListener(
            "change",
            event => {

                forensicFile =
                    event.target.files[0];

                document
                    .getElementById(
                        "verificationResult"
                    )
                    .classList.add("hidden");
            }
        );

    document
        .getElementById("verifyButton")
        .addEventListener(
            "click",
            verifyEvidence
        );
});


async function loadPendingEvidence() {

    try {

        const response =
            await fetch(
                "http://localhost:5000/court/evidences"
            );

        const data =
            await response.json();

        if (!data.success) {
            return;
        }

        const container =
            document.getElementById(
                "pendingEvidence"
            );

        if (!data.data.length) {
            return;
        }

        let html = `
            <strong>Pending Evidences</strong>
            <ul>
        `;

        data.data.forEach(ev => {

            html += `
                <li>
                    EvidenceId: ${ev.id},
                    File: ${ev.fileName}
                </li>
            `;
        });

        html += "</ul>";

        container.innerHTML = html;

    } catch (error) {

        console.error(error);

        alert(
            "Could not fetch evidences from backend."
        );
    }
}


async function calculateHash(file) {

    const buffer =
        await file.arrayBuffer();

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            buffer
        );

    return Array
        .from(new Uint8Array(hashBuffer))
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");
}


async function verifyEvidence() {

    const evidenceId =
        document
            .getElementById("evidenceId")
            .value
            .trim();

    if (!forensicFile || !evidenceId) {

        alert(
            "Please enter Evidence ID and select file."
        );

        return;
    }

    try {

        const fileHash =
            await calculateHash(
                forensicFile
            );

        const response =
            await fetch(
                "http://localhost:5000/evidence/verify",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        evidenceId,
                        fileHash
                    })
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            alert(
                data.error ||
                "Verification failed."
            );

            return;
        }


        /*
         * Evidence mismatch
         */

        if (!data.verified) {

            alert(
                "Evidence Mismatched ❌"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "index.html";

            return;
        }


        /*
         * Evidence verified
         */

        const timestamp =
            data.timestamp
                ? new Date(
                    data.timestamp * 1000
                ).toLocaleString()
                : "N/A";

        const result =
            document.getElementById(
                "verificationResult"
            );

        result.innerHTML = `

            <strong>
                Verification Result
            </strong>

            <table class="result-table">

                <thead>

                    <tr>

                        <th>Action</th>

                        <th>Hash</th>

                        <th>Timestamp</th>

                        <th>Officer</th>

                        <th>Designation</th>

                    </tr>

                </thead>

                <tbody>

                    <tr>

                        <td>
                            Evidence Verified ✅
                        </td>

                        <td>
                            ${data.storedHash}
                        </td>

                        <td>
                            ${timestamp}
                        </td>

                        <td>
                            ${data.officerName || "Unknown"}
                        </td>

                        <td>
                            ${data.designation || "Unknown"}
                        </td>

                    </tr>

                </tbody>

            </table>
        `;

        result.classList.remove(
            "hidden"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Verification error"
        );
    }
}