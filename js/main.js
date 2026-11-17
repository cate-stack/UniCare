/* Shared API, session and browser helpers used by UniCare pages. */
window.UniCare = window.UniCare || {};
window.UniCare.apiBaseUrl = "http://localhost:8080/api";
window.UniCare.apiRequest = async function (path, options = {}) {
    const headers = { "Content-Type": "application/json", ...options.headers };
    const authHeader = sessionStorage.getItem("authHeader");
    if (authHeader) headers.Authorization = authHeader;
    let response;
    try {
        response = await fetch(`${window.UniCare.apiBaseUrl}${path}`, { ...options, headers });
    } catch {
        throw new Error("Cannot reach the API. Make sure the backend is running on port 8080.");
    }
    const data = response.status === 204 ? null : await response.json().catch(() => ({}));
    if (response.status === 401) {
        sessionStorage.removeItem("authHeader");
        localStorage.removeItem("dispensarySession");
        window.location.href = "../index.html";
        throw new Error("Your session expired. Please sign in again.");
    }
    if (!response.ok) throw new Error(data?.message || `Request failed (${response.status}).`);
    return data;
};
window.UniCare.session = function () {
    try { return JSON.parse(localStorage.getItem("dispensarySession") || "null"); }
    catch { return null; }
};
window.UniCare.requireRole = function (role) {
    const session = window.UniCare.session();
    if (!session || session.role !== role || !sessionStorage.getItem("authHeader")) {
        window.location.href = "../index.html";
        return null;
    }
    return session;
};
window.UniCare.logout = function () {
    sessionStorage.removeItem("authHeader");
    localStorage.removeItem("dispensarySession");
    window.location.href = "../index.html";
};
window.UniCare.read = function (key, fallback = []) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
};
window.UniCare.write = function (key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};
window.UniCare.makeId = function (prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};
window.UniCare.today = function () {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
};
