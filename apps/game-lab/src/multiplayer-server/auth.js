const authRootEL = document.getElementById("auth");
const loginViewEL = document.getElementById("login-view");
const registerViewEL = document.getElementById("register-view");
const loginUsernameEL = document.getElementById("login-username");
const loginPasswordEL = document.getElementById("login-password");
const registerEmailEL = document.getElementById("register-email");
const registerUsernameEL = document.getElementById("register-username");
const registerPasswordEL = document.getElementById("register-password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const showRegisterBtn = document.getElementById("show-register-btn");
const showLoginBtn = document.getElementById("show-login-btn");
const authStatusEL = document.getElementById("auth-status");

console.log("[AUTH] auth.js loaded");

const authQuery = new URLSearchParams(window.location.search).get("auth");
const isLocalAuthHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const shouldEnableAuth = isLocalAuthHost || authQuery === "1";

const hasAuthUi =
  authRootEL &&
  loginViewEL &&
  registerViewEL &&
  loginUsernameEL &&
  loginPasswordEL &&
  registerEmailEL &&
  registerUsernameEL &&
  registerPasswordEL &&
  loginBtn &&
  registerBtn &&
  showRegisterBtn &&
  showLoginBtn &&
  authStatusEL;

function setAuthStatus(message) {
  authStatusEL.textContent = message;
}

function showView(viewName) {
  const showLogin = viewName === "login";
  loginViewEL.classList.toggle("auth-view-hidden", !showLogin);
  registerViewEL.classList.toggle("auth-view-hidden", showLogin);
  setAuthStatus(showLogin ? "Login view ready." : "Register view ready.");
}

function hideAuthOverlay() {
  authRootEL.style.display = "none";
}

if (!hasAuthUi) {
  console.warn("Auth UI is incomplete. auth.js was loaded, but required elements are missing.");
} else if (!shouldEnableAuth) {
  authRootEL.hidden = true;
  authRootEL.remove();
  console.log("[AUTH] Auth UI disabled for this host.");
} else {
  authRootEL.hidden = false;
  showView("login");

  showRegisterBtn.addEventListener("click", () => {
    showView("register");
  });

  showLoginBtn.addEventListener("click", () => {
    showView("login");
  });

  loginBtn.addEventListener("click", async () => {
    setAuthStatus("Login button clicked. Preparing request...");
    console.log("[AUTH] Login button clicked");

    const username = loginUsernameEL.value.trim();
    const password = loginPasswordEL.value;

    if (!username || !password) {
      setAuthStatus("Please enter both username and password.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setAuthStatus(`Login successful! Welcome, ${data.player.username}.`);
        console.log("Login response data:", data);
        window.dispatchEvent(
          new CustomEvent("auth:login-success", {
            detail: { player: data.player },
          }),
        );
        hideAuthOverlay();
      } else {
        setAuthStatus(`Login failed: ${data.error}`);
        console.warn("Login failed with response:", data);
      }
    } catch (err) {
      setAuthStatus("An error occurred during login. Please try again.");
      console.error("Login error:", err);
    }
  });

  registerBtn.addEventListener("click", async () => {
    setAuthStatus("Register button clicked.");
    console.log("[AUTH] Register button clicked");

    const email = registerEmailEL.value.trim().toLowerCase();
    const username = registerUsernameEL.value.trim();
    const password = registerPasswordEL.value;

    if (!email || !username || !password) {
      setAuthStatus("Please enter email, username, and password.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setAuthStatus(
          `Registration successful for ${data.player.username}. ` +
          `Email verification is not wired up yet, but the email is now stored.`,
        );
        console.log("Registration response data:", data);
        showView("login");
        loginUsernameEL.value = username;
        loginPasswordEL.value = password;
      } else {
        setAuthStatus(`Registration failed: ${data.error}`);
        console.warn("Registration failed with response:", data);
      }
    } catch (err) {
      setAuthStatus("An error occurred during registration. Please try again.");
      console.error("Registration error:", err);
    }
  });
}
