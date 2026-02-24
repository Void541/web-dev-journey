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
    nav_projects: "Projekte",
    nav_contact: "Kontakt",
    nav_about: "Über mich",

    about_text:"Ich entwickle strukturiert mein Fundament in moderner Webentwicklung mit dem langfristigen Ziel, eigene Software- und Spieleprojekte umzusetzen. Mein Fokus liegt auf sauberer Architektur, modularen Systemen und nachhaltigem Code – nicht nur auf funktionierenden Oberflächen. Aktuell arbeite ich an kleinen, eigenständigen Projekten, um Systemdenken, State-Management und saubere Code-Strukturen zu vertiefen. Langfristig möchte ich komplexere Anwendungen und spielähnliche Systeme mit Backend-Anbindung entwickeln.",

    skills_title: "Skills (aktuell)",
    skill_1: "HTML5 & semantische Struktur",
    skill_2: "CSS (Layout, Flexbox, Grid, Responsive Design)",
    skill_3: "JavaScript (DOM, State, Events, localStorage)",
    skill_4: "Modulare Architektur & Code-Organisation",
    skill_5: "Git & GitHub Workflow",
    skill_6: "Grundlagen API-Integration",

    roadmap_title: "Roadmap",
    roadmap_1: "Frontend-Architektur & UI-Systeme",
    roadmap_2: "API-Integration & Backend-Grundlagen",
    roadmap_3: "Datenpersistenz & Serverkommunikation",
    roadmap_4: "Spielähnliche Systemlogiken (Score, State, Game Loops)",
    roadmap_5: "Fullstack-Projekte mit eigener Serverlogik",

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
    footer_left: "© 2026 Void — Web Dev Journey",
    footer_right: "Gebaut mit HTML & CSS • Gehostet auf GitHub Pages",
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
    nav_projects: "Projects",
    nav_contact: "Contact",
    nav_about: "About",

    about_text:"I’m systematically building my foundation in modern web development with the long-term goal of creating my own software and game projects. My focus is on clean architecture, modular systems, and maintainable code — not just functional interfaces. I’m currently developing small standalone projects to strengthen my understanding of system design, state management, and structured code. Long-term, I aim to build more complex applications and game-like systems with backend integration.",

    skills_title: "Skills (current)",
    skill_1: "HTML5 & semantic structure",
    skill_2: "CSS (layout, Flexbox, Grid, responsive design)",
    skill_3: "JavaScript (DOM, state, events, localStorage)",
    skill_4: "Modular architecture & code organization",
    skill_5: "Git & GitHub workflow",
    skill_6: "API integration fundamentals",

    roadmap_title: "Roadmap",
    roadmap_1: "Frontend architecture & UI systems",
    roadmap_2: "API integration & backend fundamentals",
    roadmap_3: "Data persistence & server communication",
    roadmap_4: "Game-like system logic (score, state, game loops)",
    roadmap_5: "Fullstack projects with custom server logic",
    
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
    footer_left: "© 2026 Void — Web Dev Journey",
    footer_right: "Built with HTML & CSS • Hosted on GitHub Pages",
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