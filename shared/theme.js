const THEME_KEY = "theme";

export function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");

  const saved = localStorage.getItem(THEME_KEY);
  const prefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  setTheme(saved || (prefersLight ? "light" : "dark"));

  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }
}

export function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.textContent = theme === "light" ? "☀️" : "🌙";
  }
}