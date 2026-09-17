/**
 * EduTrack Pro - Login Authentication Logic
 * Client-side Authentication & Session Management
 */

const THEME_KEY = 'sms_theme';
const AUTH_SESSION_KEY = 'sms_auth_user';

// Check if user is already authenticated
if (sessionStorage.getItem(AUTH_SESSION_KEY) || localStorage.getItem(AUTH_SESSION_KEY)) {
    window.location.replace('index.html');
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const eyeOpenIcon = document.getElementById('eyeOpenIcon');
const eyeClosedIcon = document.getElementById('eyeClosedIcon');
const loginErrorAlert = document.getElementById('loginErrorAlert');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');
const rememberMeCheckbox = document.getElementById('rememberMe');
const themeToggleBtn = document.getElementById('themeToggleBtn');

/* ==========================================================================
   Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
});

/**
 * Initialize theme from LocalStorage
 */
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
}

/* ==========================================================================
   Show / Hide Password Logic
   ========================================================================== */
function setupPasswordToggle() {
    if (!togglePasswordBtn || !passwordInput) return;

    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';

        if (isPassword) {
            eyeOpenIcon.style.display = 'none';
            eyeClosedIcon.style.display = 'flex';
            togglePasswordBtn.setAttribute('title', 'Hide password');
            togglePasswordBtn.setAttribute('aria-label', 'Hide password');
        } else {
            eyeOpenIcon.style.display = 'flex';
            eyeClosedIcon.style.display = 'none';
            togglePasswordBtn.setAttribute('title', 'Show password');
            togglePasswordBtn.setAttribute('aria-label', 'Show password');
        }
    });
}

/* ==========================================================================
   Error Display & Clear
   ========================================================================== */
function showError(msg) {
    errorMessage.textContent = msg;
    loginErrorAlert.classList.add('visible');
    usernameInput.classList.add('is-invalid');
    passwordInput.classList.add('is-invalid');
}

function clearError() {
    loginErrorAlert.classList.remove('visible');
    usernameInput.classList.remove('is-invalid');
    passwordInput.classList.remove('is-invalid');
}

/* ==========================================================================
   Login Form Submission
   ========================================================================== */
function setupFormSubmit() {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Validation: Empty inputs
        if (!username || !password) {
            showError('Please enter both your username and password.');
            if (!username) usernameInput.focus();
            else passwordInput.focus();
            return;
        }

        // Validate Credentials: admin / admin123
        if (username === 'admin' && password === 'admin123') {
            // Authentication Success
            clearError();
            loginBtn.disabled = true;
            loginBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-icon">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                <span>Signing in...</span>
            `;

            // Persist session
            sessionStorage.setItem(AUTH_SESSION_KEY, username);
            if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                localStorage.setItem(AUTH_SESSION_KEY, username);
            }

            // Redirect to dashboard
            setTimeout(() => {
                window.location.replace('index.html');
            }, 300);
        } else {
            // Authentication Failure
            showError('Invalid username or password. Please check your credentials.');
            passwordInput.value = '';
            passwordInput.focus();
        }
    });

    // Clear error dynamically as user types
    usernameInput.addEventListener('input', clearError);
    passwordInput.addEventListener('input', clearError);
}

/* ==========================================================================
   Event Listeners Wire-up
   ========================================================================== */
function setupEventListeners() {
    setupPasswordToggle();
    setupFormSubmit();
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}
