
const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
    const showMessage = (element, text, type = "error") => {
        element.textContent = text;
        element.className = `message ${type}`;
    };

    async function requestJson(path, options = {}) {
        let response;
        try {
            response = await fetch(`${API_BASE_URL}${path}`, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers
                }
            });
        } catch {
            throw new Error("Cannot reach the backend. Start the Spring Boot server at http://localhost:8080 and try again.");
        }

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || `Request failed (${response.status}).`);
        }
        return data;
    }

    const registrationForm = document.getElementById("registrationForm");
    if (registrationForm) {
        registrationForm.addEventListener("submit", async event => {
            event.preventDefault();
            const message = document.getElementById("registrationMessage");
            const password = document.getElementById("registerPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password.length < 8) {
                showMessage(message, "Password must contain at least 8 characters.");
                return;
            }
            if (password !== confirmPassword) {
                showMessage(message, "Your passwords do not match.");
                return;
            }

            const account = {
                fullName: document.getElementById("fullName").value.trim(),
                studentNumber: document.getElementById("studentNumber").value.trim(),
                email: document.getElementById("email").value.trim().toLowerCase(),
                phone: document.getElementById("phone").value.trim(),
                course: document.getElementById("course").value.trim(),
                yearOfStudy: document.getElementById("yearOfStudy").value,
                password,
                confirmPassword,
                agreeTerms: document.getElementById("agreeTerms").checked
            };

            const submitButton = registrationForm.querySelector("button[type='submit']");
            submitButton.disabled = true;
            showMessage(message, "Creating your account…", "info");
            try {
                await requestJson("/students/register", {
                    method: "POST",
                    body: JSON.stringify(account)
                });
                registrationForm.reset();
                showMessage(message, "Account created. You can now sign in.", "success");
            } catch (error) {
                showMessage(message, error.message);
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async event => {
            event.preventDefault();
            const message = document.getElementById("loginMessage");
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            const submitButton = loginForm.querySelector("button[type='submit']");

            submitButton.disabled = true;
            showMessage(message, "Signing in…", "info");
            try {
                const user = await requestJson("/students/login", {
                    method: "POST",
                    body: JSON.stringify({ email, password })
                });

                // Spring Security HTTP Basic protects subsequent API requests.
                const authHeader = `Basic ${btoa(`${email}:${password}`)}`;
                sessionStorage.setItem("authHeader", authHeader);

                const session = {
                    id: String(user.id),
                    name: user.fullName,
                    email: user.email,
                    role: String(user.role).toLowerCase(),
                    studentNumber: user.studentNumber || "",
                    phone: user.phone || "",
                    course: user.course || "",
                    yearOfStudy: user.yearOfStudy || ""
                };
                localStorage.setItem("dispensarySession", JSON.stringify(session));

                // Existing dashboard modules use this non-secret profile cache for display.
                let users = [];
                try {
                    const cachedUsers = JSON.parse(localStorage.getItem("dispensaryUsers") || "[]");
                    if (Array.isArray(cachedUsers)) users = cachedUsers.filter(item => item && String(item.id) !== session.id);
                } catch {
                    // This cache is only for the existing prototype dashboard display.
                }
                users.push(session);
                localStorage.setItem("dispensaryUsers", JSON.stringify(users));

                showMessage(message, "Login successful.", "success");
                window.location.href = session.role === "staff"
                    ? "pages/staff-dashboard.html"
                    : "pages/dashboard.html";
            } catch (error) {
                showMessage(message, error.message);
            } finally {
                submitButton.disabled = false;
            }
        });
    }
});
