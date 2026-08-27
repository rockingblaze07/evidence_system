document.addEventListener("DOMContentLoaded", () => {

    const user = getCurrentUser();

    /*
     * Login page
     */
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        if (user) {
            redirectUser(user.role);
            return;
        }

        loginForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const username =
                document.getElementById("username").value.trim();

            const password =
                document.getElementById("password").value;

            const role =
                document.getElementById("role").value;

            if (!username || !password || !role) {

                alert("⚠️ Enter all fields");

                return;
            }

            const users =
                JSON.parse(localStorage.getItem("users")) || [];

            const foundUser = users.find(
                u =>
                    u.username === username &&
                    u.password === password &&
                    u.role === role
            );

            if (!foundUser) {

                alert(
                    "❌ Invalid credentials. Please signup first."
                );

                return;
            }

            localStorage.setItem(
                "user",
                JSON.stringify(foundUser)
            );

            redirectUser(foundUser.role);
        });
    }


    /*
     * Signup page
     */

    const signupForm =
        document.getElementById("signupForm");

    if (signupForm) {

        if (user) {
            redirectUser(user.role);
            return;
        }

        signupForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const username =
                document.getElementById("username").value.trim();

            const password =
                document.getElementById("password").value;

            const role =
                document.getElementById("role").value;

            if (!username || !password || !role) {

                alert("⚠️ Enter all fields");

                return;
            }

            const users =
                JSON.parse(localStorage.getItem("users")) || [];

            if (
                users.some(
                    u =>
                        u.username === username &&
                        u.role === role
                )
            ) {

                alert(
                    "⚠️ User with this username & role already exists."
                );

                return;
            }

            const newUser = {
                username,
                role,
                password
            };

            users.push(newUser);

            localStorage.setItem(
                "users",
                JSON.stringify(users)
            );

            alert(
                "✅ Signup successful! Please login."
            );

            window.location.href = "login.html";
        });
    }


    /*
     * Page-level protection
     */

    const page = location.pathname.toLowerCase();

    if (page.endsWith("/police.html")) {

        requireRole(["admin", "police"]);

    } else if (page.endsWith("/forensic.html")) {

        requireRole(["admin", "forensic"]);

    } else if (page.endsWith("/court.html")) {

        requireRole(["admin", "court"]);

    } else if (page.endsWith("/voice-assistant.html")) {

        requireRole(["admin"]);
    }

});