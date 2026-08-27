document.addEventListener("DOMContentLoaded", async () => {

    if (!requireRole(["admin", "court"])) {
        return;
    }

    await fetchEvidences();
});


async function fetchEvidences() {

    const container =
        document.getElementById(
            "evidenceList"
        );

    try {

        const response =
            await fetch(
                "http://localhost:5000/court/evidences"
            );

        const data =
            await response.json();

        if (
            !data.success ||
            !data.data.length
        ) {

            container.innerHTML =
                "<p>No evidences found.</p>";

            return;
        }

        container.innerHTML = "";

        data.data.forEach(ev => {

            const timestamp =
                ev.timestamp
                    ? new Date(
                        ev.timestamp * 1000
                    ).toLocaleString()
                    : "N/A";

            const card =
                document.createElement("div");

            card.className =
                "evidence-card";

            card.innerHTML = `

                <p>
                    <strong>ID:</strong>
                    ${ev.id}
                </p>

                <p>
                    <strong>File:</strong>
                    ${ev.fileName || "N/A"}
                </p>

                <p>
                    <strong>Hash:</strong>
                    ${ev.fileHash || "N/A"}
                </p>

                <p>
                    <strong>Uploaded By:</strong>
                    ${ev.uploadedBy || "Unknown"}
                </p>

                <p>
                    <strong>Officer:</strong>
                    ${ev.officerName || "Unknown"}
                </p>

                <p>
                    <strong>Timestamp:</strong>
                    ${timestamp}
                </p>
            `;

            container.appendChild(card);
        });

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Could not fetch evidences from backend.</p>";
    }
}