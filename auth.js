/* =========================================================
   Planify — Authentication Logic
   Handles signup, login, logout with localStorage
   Includes password visibility toggle & strength meter
   ========================================================= */

// ===== SIGN UP =====
function signup() {
    const nameEl = document.getElementById("signupName");
    const emailEl = document.getElementById("signupEmail");
    const passwordEl = document.getElementById("signupPassword");
    const termsEl = document.getElementById("agreeTerms");

    const name = nameEl ? nameEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";

    // Validation
    if (!name || !email || !password) {
        showToast("Please fill in all fields.", "error");
        return;
    }

    if (password.length < 6) {
        showToast("Password must be at least 6 characters.", "error");
        return;
    }

    if (termsEl && !termsEl.checked) {
        showToast("Please agree to the Terms of Service.", "error");
        return;
    }

    // Save user credentials
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);

    showToast("Account created! Redirecting...", "success");

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1200);
}

// ===== LOGIN =====
function login() {
    const emailEl = document.getElementById("loginEmail");
    const passwordEl = document.getElementById("loginPassword");

    const email = emailEl ? emailEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";

    const storedEmail = localStorage.getItem("userEmail");
    const storedPassword = localStorage.getItem("userPassword");

    if (!email || !password) {
        showToast("Please fill in all fields.", "error");
        return;
    }

    if (email === storedEmail && password === storedPassword) {
        showToast("Login successful! \uD83D\uDE80", "success");
        setTimeout(() => {
            window.location.href = "planner.html";
        }, 800);
    } else {
        showToast("Invalid email or password.", "error");
    }
}

// ===== LOGOUT =====
function logout() {
    showToast("Logging out...", "info");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
}

// ===== PASSWORD VISIBILITY TOGGLE (fallback if not loaded from script.js) =====
if (typeof togglePasswordVisibility === "undefined") {
    function togglePasswordVisibility(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        if (input.type === "password") {
            input.type = "text";
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
        } else {
            input.type = "password";
            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
        }
    }
}

// ===== PASSWORD STRENGTH METER (fallback if not loaded from script.js) =====
if (typeof updatePasswordStrength === "undefined") {
    function updatePasswordStrength(password) {
        const bars = [
            document.getElementById("str1"),
            document.getElementById("str2"),
            document.getElementById("str3"),
            document.getElementById("str4")
        ];
        const textEl = document.getElementById("strengthText");
        if (!bars[0] || !textEl) return;

        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

        const levels = [
            { label: "", color: "" },
            { label: "Weak", color: "#f87171" },
            { label: "Fair", color: "#fbbf24" },
            { label: "Good", color: "#60a5fa" },
            { label: "Strong", color: "#34d399" }
        ];

        bars.forEach((bar, i) => {
            bar.style.background = i < score ? levels[score].color : "rgba(255,255,255,0.1)";
        });

        textEl.textContent = password.length === 0 ? "" : levels[score].label;
        if (password.length > 0) textEl.style.color = levels[score].color;
    }
}

// ===== INIT PASSWORD STRENGTH on signup page =====
document.addEventListener("DOMContentLoaded", function () {
    const signupPwd = document.getElementById("signupPassword");
    if (signupPwd) {
        signupPwd.addEventListener("input", function () {
            if (typeof updatePasswordStrength === "function") {
                updatePasswordStrength(this.value);
            }
        });
    }
});

// ===== TOAST HELPER (for auth pages without script.js) =====
if (typeof showToast === "undefined") {
    function showToast(message, type) {
        const container = document.getElementById("toastContainer");
        if (!container) {
            alert(message);
            return;
        }

        const toast = document.createElement("div");
        toast.className = "toast toast-" + type;

        const icons = {
            success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span><span class="toast-msg">' + message + '</span>';
        container.appendChild(toast);

        setTimeout(function () {
            toast.classList.add("toast-exit");
            setTimeout(function () { toast.remove(); }, 300);
        }, 3500);
    }
}
