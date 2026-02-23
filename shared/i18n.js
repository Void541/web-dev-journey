// shared/i18n.js
const LANG_KEY = "lang";

const translations = {
  de: {

    hero_title: "Web Dev Journey",
    hero_subtitle: "Ich baue gerade mein Fundament in HTML, CSS & JavaScript – Schritt für Schritt, jeden Tag.",
    btn_projects: "Projekte ansehen",
    btn_about: "Mehr über mich",

    meta_focus: "Fokus: Webentwicklung",
    meta_rhythm: "Rhythmus: 30 Min/Tag",
    meta_goal: "Ziel: Junior / Werkstudent",
    about_title: "Über mich",
    projects_title: "Projekte",
    contact_title: "Kontakt",

    project1_title: "Projekt 1: Mini Portfolio",
    project1_desc: "Diese Seite. Fokus: Struktur, Layout, GitHub Pages.",
    project2_title: "Projekt 2: To-Do App",
    project2_desc: "Interaktiv mit JavaScript (DOM + Events) und localStorage.",
    project3_title: "Projekt 3: Quiz",
    project3_desc: "Quiz mit Kategorien, Highscore und Fragen-Editor.",

    btn_code: "Code",
    btn_live: "Live",
    contact_text: "Wenn du Feedback hast oder sehen möchtest, wie ich mich entwickle, schau auf GitHub vorbei.",
    btn_github: "GitHub",
    btn_top: "Nach oben",
  },
  en: {
    hero_title: "Web Dev Journey",
    hero_subtitle: "I’m building my foundation in HTML, CSS & JavaScript — step by step, every day.",
    btn_projects: "View Projects",
    btn_about: "Learn More",

    meta_focus: "Focus: Web Development",
    meta_rhythm: "Daily practice: 30 minutes",
    meta_goal: "Career goal: Junior Developer / Working Student",
    btn_projects: "View Projects",
    projects_title: "Projects",
    contact_title: "Contact",

    project1_title: "Project 1: Mini Portfolio",
    project1_desc: "This site. Focus: structure, layout, GitHub Pages.",
    project2_title: "Project 2: To-Do App",
    project2_desc: "Interactive JavaScript (DOM + events) with localStorage.",
    project3_title: "Project 3: Quiz",
    project3_desc: "Quiz with categories, highscore and a question editor.",

    btn_code: "Code",
    btn_live: "Live",
    contact_text: "If you have feedback or want to see how I'm progressing, check out my GitHub.",
    btn_github: "GitHub",
    btn_top: "Back to top",
  },
};

function detectDefaultLang() {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === "de" || saved === "en") return saved;

  const nav = (navigator.language || "de").toLowerCase();
  return nav.startsWith("en") ? "en" : "de";
}

export function initI18n() {
  const toggle = document.getElementById("langToggle");
  const lang = detectDefaultLang();
  setLang(lang);

  if (toggle) {
    toggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-lang") || "de";
      setLang(current === "de" ? "en" : "de");
    });
  }
}

export function setLang(lang) {
  const dict = translations[lang] || translations.de;

  document.documentElement.setAttribute("data-lang", lang);
  localStorage.setItem(LANG_KEY, lang);

  const toggle = document.getElementById("langToggle");
  if (toggle) toggle.textContent = lang.toUpperCase();

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const value = dict[key];
    if (typeof value === "string") el.textContent = value;
  });
}