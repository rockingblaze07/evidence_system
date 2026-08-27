function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

function redirectUser(role) {

    switch (role) {

        case "police":
            window.location.href = "police.html";
            break;

        case "forensic":
            window.location.href = "forensic.html";
            break;

        case "court":
            window.location.href = "court.html";
            break;

        case "admin":
            window.location.href = "voice-assistant.html";
            break;

        default:
            window.location.href = "index.html";
    }
}


function logout() {

    localStorage.removeItem("user");

    window.location.href = "index.html";
}


function createNavbar() {

    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    const user = getCurrentUser();

    let links = `
        <a href="index.html">Home</a>
    `;

    if (user) {

        if (user.role === "police") {

            links += `
                <a href="police.html">Police</a>
            `;

        }

        if (user.role === "forensic") {

            links += `
                <a href="forensic.html">Forensics</a>
            `;

        }

        if (user.role === "court") {

            links += `
                <a href="court.html">Court</a>
            `;

        }

        if (user.role === "admin") {

            links += `
                <a href="police.html">Police</a>
                <a href="forensic.html">Forensics</a>
                <a href="court.html">Court</a>
                <a href="voice-assistant.html">
                    AI Deepfake Detection
                </a>
            `;
        }

        links += `
            <button
                class="logout-button"
                onclick="logout()">
                Logout
            </button>
        `;

    } else {

        links += `
            <a href="login.html" class="green-link">
                Login
            </a>

            <a href="signup.html" class="blue-link">
                Signup
            </a>
        `;
    }

    navbar.innerHTML = `
        <nav class="navbar">

            <div class="logo">
                Cybercrime Evidence Chain of Custody
            </div>

            <div class="nav-links">
                ${links}
            </div>

        </nav>
    `;
}


function requireRole(allowedRoles) {

    const user = getCurrentUser();

    if (!user || !allowedRoles.includes(user.role)) {

        window.location.href = "index.html";

        return false;
    }

    return true;
}


document.addEventListener("DOMContentLoaded", createNavbar);