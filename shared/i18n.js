// shared/i18n.js
let currentLang = localStorage.getItem("lang") || "de";
const LANG_KEY = "lang";

const translations = {
  de: {
    // ================= PORTFOLIO =================
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

    //================= TODO =================
    todo_placeholder: "Neue Aufgabe eingeben...",
    todo_add: "Hinzufügen",

    todo_filter_all: "Alle",
    todo_filter_active: "Aktiv",
    todo_filter_done: "Erledigt",

    todo_clear_done: "Erledigte löschen",

    todo_stats: "{open} offen · {total} gesamt",

    todo_title: "To-Do App",
    open: "offen",
    total: "gesamt",
    todo_left: "{open} offen",
    todo_total: "{total} gesamt",


    // ================= QUIZ ================= 
    quiz_ready_title: "Bereit?",
    quiz_ready_sub: "Kurzes Quiz (Single Choice). Dein Highscore wird gespeichert.",
    back_main: "← Zurück",

    quiz_editor_title: "Fragen Editor (Custom)",
    quiz_editor_sub: "Speichert lokal im Browser (localStorage). Perfekt um dein Quiz zu erweitern.",
    quiz_save_question: "Frage speichern",
    quiz_delete_question: "Frage löschen",
    quiz_custom_questions: "Eigene Fragen anzeigen",

    quiz_settings_title: "Einstellungen",
    quiz_highscore_title: "Highscore",

    quiz_label_category: "Kategorie",
    quiz_label_questions: "Fragen",
    quiz_label_shuffle: "Shuffle",
    quiz_label_timer: "Timer (sek)",

    quiz_label_correct: "Richtig",
    quiz_label_question: "Frage",
    quiz_label_a: "Antwort A",
    quiz_label_b: "Antwort B",
    quiz_label_c: "Antwort C",
    quiz_label_d: "Antwort D",

    quiz_start: "Start",
    quiz_reset: "Reset",
    quiz_score: "Score",
    quiz_cancel: "Abbrechen",
    quiz_next: "Nächste",

    quiz_result_title: "Ergebnis",
    quiz_back: "Zurück",
    quiz_restart: "Nochmal",

    quiz_ph_question: "Deine Frage...",
    quiz_ph_a: "Antwort A",
    quiz_ph_b: "Antwort B",
    quiz_ph_c: "Antwort C",
    quiz_ph_d: "Antwort D",
  },
  en: {
    // ================= PORTFOLIO ================= 
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

    //================= TODO =================
    todo_placeholder: "Enter new task...",
    todo_add: "Add",

    todo_filter_all: "All",
    todo_filter_active: "Active",
    todo_filter_done: "Done",

    todo_clear_done: "Clear done",

    todo_stats: "{open} open · {total} total",

    todo_title: "To-Do App",
    open: "open",
    total: "total",
    todo_left: "{open} open",
    todo_total: "{total} total",


    //================= QUIZ ================= 
    
    quiz_ready_title: "Ready?",
    quiz_ready_sub: "Short quiz (single choice). Your highscore is saved.",
    back_main: "← Back",

    quiz_editor_title: "Question Editor (Custom)",
    quiz_editor_sub: "Saved locally in your browser (localStorage). Perfect to extend your quiz.",
    quiz_save_question: "Save Question",
    quiz_delete_question: "Delete Question",
    quiz_custom_questions: "Custom Questions List",

    quiz_settings_title: "Settings",
    quiz_highscore_title: "Highscore",

    quiz_label_category: "Category",
    quiz_label_questions: "Questions",
    quiz_label_shuffle: "Shuffle",
    quiz_label_timer: "Timer (sec)",

    quiz_label_correct: "Correct",
    quiz_label_question: "Question",
    quiz_label_a: "Answer A",
    quiz_label_b: "Answer B",
    quiz_label_c: "Answer C",
    quiz_label_d: "Answer D",

    quiz_start: "Start",
    quiz_reset: "Reset",
    quiz_score: "Score",
    quiz_cancel: "Cancel",
    quiz_next: "Next",

    quiz_result_title: "Result",
    quiz_back: "Back",
    quiz_restart: "Play again",

    quiz_ph_question: "Your question...",
    quiz_ph_a: "Answer A",
    quiz_ph_b: "Answer B",
    quiz_ph_c: "Answer C",
    quiz_ph_d: "Answer D",
    
  },
};

function detectDefaultLang() {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved === "de" || saved === "en") return saved;

  const nav = (navigator.language || "de").toLowerCase();
  return nav.startsWith("en") ? "en" : "de";
}
export function t(key) {
  const lang = currentLang; // oder wie du deine variable nennst
  const dict = translations[lang] || {};

  return dict[key] || key;
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
  if (toggle) toggle.textContent = (lang === "de" ? "EN" : "DE");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const value = dict[key];
    if (typeof value === "string") el.textContent = value;

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
  const key = el.getAttribute("data-i18n-placeholder");
  const value = dict[key];
  if (typeof value === "string") el.setAttribute("placeholder", value);
  });
  });
}