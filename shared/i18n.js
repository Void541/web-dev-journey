// shared/i18n.js
let currentLang = localStorage.getItem("lang") || "de";
const LANG_KEY = "lang";

const translations = {
  de: {
    // ================= PORTFOLIO =================
    hero_kicker: "Portfolio von Fabian Materna",
    hero_title: "Ich baue interaktive Webprojekte mit Fokus auf Struktur, Systeme und Gameplay.",
    hero_subtitle: "Ich entwickle praxisnah moderne Frontend-Projekte, um saubere Architektur, UI-Verständnis und produktnahes Denken aufzubauen. Mein stärkstes Projekt ist aktuell das Game Lab.",
    btn_projects: "Projekte ansehen",
    btn_about: "Mehr über mich",

    meta_focus: "Fokus: Interaktive Frontends & Systemdenken",
    meta_rhythm: "Lernen durch echte Projekte",
    meta_goal: "Ziel: Junior Frontend / Werkstudent",
    nav_projects: "Projekte",
    nav_contact: "Kontakt",
    nav_about: "Über mich",
    nav_faq: "FAQ",
    about_title: "Über mich",

    about_text:"Ich entwickle mir gerade ein solides Fundament in moderner Frontend-Entwicklung, indem ich echte Projekte plane, baue und weiter verbessere. Besonders wichtig sind mir saubere Struktur, verständliche UI-Entscheidungen und ein systematischer Umgang mit wachsender Komplexität. Mit Projekten wie dem Game Lab trainiere ich nicht nur Oberflächen, sondern auch Architektur, State-Logik und produktnahes Denken.",

    skills_title: "Woran ich arbeite",
    skill_1: "HTML5 & semantische Struktur",
    skill_2: "CSS (Layout, Flexbox, Grid, Responsive Design)",
    skill_3: "JavaScript (DOM, State, Events, localStorage)",
    skill_4: "Modulare Architektur & Code-Organisation",
    skill_5: "Git & GitHub Workflow",
    skill_6: "Grundlagen API-Integration",

    roadmap_title: "Worauf ich als Nächstes hinarbeite",
    roadmap_1: "Stärkere Frontend-Architektur & sauberere Komponenten",
    roadmap_2: "Sichereres Web Design & bessere UI-Entscheidungen",
    roadmap_3: "API-Integration & Backend-Grundlagen",
    roadmap_4: "Komplexere Systemlogiken für interaktive Projekte",
    roadmap_5: "Der Schritt in Frameworks wie Vue",

    learning_title: "Womit ich aktuell lerne",
    learning_intro: "Ein paar Ressourcen, die mir gerade besonders helfen, besser in Web Design, CSS-Systemen und modernem Frontend-Denken zu werden.",
    learning_open: "Öffnen",
    learning_item_1_type: "Dokumentation",
    learning_item_1_focus: "Frontend-Grundlagen",
    learning_item_1_title: "MDN Learn Web Development",
    learning_item_1_desc: "Für saubere Grundlagen in HTML, CSS und JavaScript. Besonders hilfreich, wenn ich Konzepte wirklich verstehen statt nur anwenden will.",
    learning_item_2_type: "Guide",
    learning_item_2_focus: "CSS & Responsive Design",
    learning_item_2_title: "web.dev Learn CSS",
    learning_item_2_desc: "Hilft mir dabei, Layout, Spacing, Grid und moderne CSS-Patterns systematischer zu lernen und bewusster einzusetzen.",
    learning_item_3_type: "YouTube",
    learning_item_3_focus: "Design in CSS",
    learning_item_3_title: "Kevin Powell",
    learning_item_3_desc: "Gute Quelle für CSS, Komponenten-Denken und die Frage, warum ein Interface ruhig, sauber oder unordentlich wirkt.",
    learning_item_4_type: "Framework",
    learning_item_4_focus: "Nächster Schritt",
    learning_item_4_title: "Vue Docs",
    learning_item_4_desc: "Die Doku, auf die ich später hinarbeite, wenn mein Fundament in UI, Struktur und Komponenten-Denken noch stärker geworden ist.",

    projects_title: "Projekte",
    faq_title: "FAQ",
    faq_intro: "Fragen, die ich mir auf meinem Weg in die Webentwicklung selbst stelle und die auch in Gesprächen über moderne Softwareentwicklung immer wieder auftauchen.",
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
    footer_left: "© 2026 Fabian Materna — Web Dev Journey",
    footer_right: "Gebaut mit HTML & CSS • Gehostet auf GitHub Pages",

    //================= Game Lab =================

    project_featured: "Featured Project",
    badge_in_progress: "In Entwicklung",
    project4_spotlight_label: "Herzensprojekt",
    project4_spotlight_text: "Das Game Lab ist aktuell mein wichtigstes Projekt, weil ich dort Gameplay, Struktur und Systemdenken zusammenbringe.",

    project4_title: "Game Lab",
    project4_desc: "Ein browserbasiertes 2D-Spiel mit eigenem Game Loop, Kampfsystem, Gegnerverhalten und modularer Architektur.",

    project4_highlight_1: "Canvas Rendering & Animation",
    project4_highlight_2: "Combat, Projectiles & Collision",
    project4_highlight_3: "UI, HUD und Gameplay-Systeme",
    project4_highlight_4: "Modularer JavaScript-Aufbau",

    project4_stat_1: "Status: Aktiv in Entwicklung",
    project4_stat_2: "Fokus: Gameplay & Progression",
    project4_stat_3: "Herzstück meines Portfolios",
    faq_q1: "Warum will ich eigentlich Webentwickler werden?",
    faq_a1: "Mich reizt, dass Webentwicklung Kreativität, Struktur und Problemlösen verbindet. Ich kann sichtbare Produkte bauen und gleichzeitig lernen, wie gute Software systematisch entsteht.",
    faq_q2: "Wie lerne ich Programmieren gerade am effektivsten?",
    faq_a2: "Ich lerne über echte Projekte. Statt nur Theorie zu lesen, baue ich kleine Anwendungen und ein größeres Herzensprojekt, damit ich UI, Logik, Debugging und Architektur praktisch trainiere.",
    faq_q3: "Was sind aktuell meine größten Stärken?",
    faq_a3: "Ich arbeite konstant, dokumentiere meinen Fortschritt über Projekte und denke gerne in Systemen. Besonders wichtig ist mir, nicht nur etwas irgendwie zum Laufen zu bringen, sondern den Code Schritt für Schritt sauberer zu strukturieren.",
    faq_q4: "Ersetzt KI Programmierer oder verändert sie nur die Arbeit?",
    faq_a4: "Ich sehe KI eher als Werkzeug als als Ersatz. Sie kann beim Recherchieren, Strukturieren oder Debuggen helfen, aber Verständnis, Verantwortung, Priorisierung und gute Entscheidungen im Produkt bleiben menschlich sehr wichtig.",
    faq_q5: "Wie will ich KI sinnvoll beim Lernen und Entwickeln nutzen?",
    faq_a5: "Ich nutze KI, um schneller Feedback zu bekommen, Konzepte besser zu verstehen und verschiedene Lösungswege zu vergleichen. Wichtig ist mir dabei, die Antworten nicht blind zu übernehmen, sondern sie nachzuvollziehen und selbst umzusetzen.",
    faq_q6: "Was bedeutet modernes Programmieren für mich überhaupt?",
    faq_a6: "Modernes Programmieren bedeutet für mich nicht nur neue Tools zu kennen, sondern sauber zu kommunizieren, wartbaren Code zu schreiben, mit Hilfsmitteln wie KI sinnvoll umzugehen und kontinuierlich dazuzulernen.",

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
    hero_kicker: "Portfolio of Fabian Materna",
    hero_title: "I build interactive web projects with a focus on structure, systems, and gameplay.",
    hero_subtitle: "I’m developing practical frontend projects to build stronger architecture, UI thinking, and product-oriented problem solving. My strongest project right now is Game Lab.",
    btn_projects: "View Projects",
    btn_about: "Learn More",

    meta_focus: "Focus: Interactive frontends & systems thinking",
    meta_rhythm: "Learning through real projects",
    meta_goal: "Goal: Junior Frontend / Working Student",
    btn_projects: "View Projects",
    nav_projects: "Projects",
    nav_contact: "Contact",
    nav_about: "About",
    nav_faq: "FAQ",
    about_title: "About",

    about_text:"I’m building a solid foundation in modern frontend development by planning, building, and improving real projects. What matters most to me is clean structure, thoughtful UI decisions, and a systematic approach to growing complexity. With projects like Game Lab, I’m not only practicing interfaces, but also architecture, state logic, and product-oriented thinking.",

    skills_title: "What I’m actively building",
    skill_1: "HTML5 & semantic structure",
    skill_2: "CSS (layout, Flexbox, Grid, responsive design)",
    skill_3: "JavaScript (DOM, state, events, localStorage)",
    skill_4: "Modular architecture & code organization",
    skill_5: "Git & GitHub workflow",
    skill_6: "API integration fundamentals",

    roadmap_title: "What I’m moving toward next",
    roadmap_1: "Stronger frontend architecture & cleaner components",
    roadmap_2: "More confident web design & better UI decisions",
    roadmap_3: "API integration & backend fundamentals",
    roadmap_4: "More complex systems for interactive projects",
    roadmap_5: "The transition into frameworks like Vue",

    learning_title: "What I’m currently learning with",
    learning_intro: "A few resources that are helping me get better at web design, CSS systems, and modern frontend thinking.",
    learning_open: "Open",
    learning_item_1_type: "Documentation",
    learning_item_1_focus: "Frontend fundamentals",
    learning_item_1_title: "MDN Learn Web Development",
    learning_item_1_desc: "A strong source for HTML, CSS, and JavaScript fundamentals. Especially helpful when I want to truly understand concepts instead of only applying them.",
    learning_item_2_type: "Guide",
    learning_item_2_focus: "CSS & responsive design",
    learning_item_2_title: "web.dev Learn CSS",
    learning_item_2_desc: "Helps me learn layout, spacing, grid, and modern CSS patterns in a more structured way and use them more intentionally.",
    learning_item_3_type: "YouTube",
    learning_item_3_focus: "Design in CSS",
    learning_item_3_title: "Kevin Powell",
    learning_item_3_desc: "A great source for CSS, component thinking, and understanding why an interface feels calm, clean, or visually noisy.",
    learning_item_4_type: "Framework",
    learning_item_4_focus: "Next step",
    learning_item_4_title: "Vue Docs",
    learning_item_4_desc: "The documentation I want to grow into once my foundation in UI, structure, and component thinking is even stronger.",
    
    projects_title: "Projects",
    faq_title: "FAQ",
    faq_intro: "Questions I ask myself on my path into web development and that also come up often in conversations about modern software development.",
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
    footer_left: "© 2026 Fabian Materna — Web Dev Journey",
    footer_right: "Built with HTML & CSS • Hosted on GitHub Pages",

    //================= Game Lab =================

    project_featured: "Featured Project",
    badge_in_progress: "In Progress",
    project4_spotlight_label: "Signature Project",
    project4_spotlight_text: "Game Lab is my main project right now because it brings together gameplay, structure, and systems thinking in one place.",

    project4_title: "Game Lab",
    project4_desc: "A browser-based 2D game with a custom game loop, combat systems, enemy behavior and modular architecture.",

    project4_highlight_1: "Canvas rendering & animation",
    project4_highlight_2: "Combat, projectiles & collision",
    project4_highlight_3: "UI, HUD and gameplay systems",
    project4_highlight_4: "Modular JavaScript structure",

    project4_stat_1: "Status: Actively in development",
    project4_stat_2: "Focus: Gameplay & progression",
    project4_stat_3: "Centerpiece of my portfolio",
    faq_q1: "Why do I actually want to become a web developer?",
    faq_a1: "I’m drawn to how web development combines creativity, structure, and problem-solving. I can build visible products while also learning how good software is created systematically.",
    faq_q2: "How am I currently learning programming most effectively?",
    faq_a2: "I learn through real projects. Instead of only reading theory, I build small applications and one larger passion project so I can practice UI, logic, debugging, and architecture in a practical way.",
    faq_q3: "What are my biggest strengths right now?",
    faq_a3: "I work consistently, document my progress through projects, and enjoy thinking in systems. It matters to me not just to make something work somehow, but to structure the code more cleanly step by step.",
    faq_q4: "Will AI replace programmers, or mainly change the work?",
    faq_a4: "I see AI more as a tool than a replacement. It can help with research, structuring, and debugging, but understanding, responsibility, prioritization, and good product decisions are still very human tasks.",
    faq_q5: "How do I want to use AI while learning and building?",
    faq_a5: "I use AI to get feedback faster, understand concepts better, and compare different solution paths. What matters to me is not copying answers blindly, but understanding them and implementing them myself.",
    faq_q6: "What does modern programming actually mean to me?",
    faq_a6: "To me, modern programming is not only about knowing new tools. It also means communicating clearly, writing maintainable code, using tools like AI responsibly, and continuing to learn.",

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
  currentLang = lang;

  document.documentElement.setAttribute("data-lang", lang);
  localStorage.setItem(LANG_KEY, lang);

  const toggle = document.getElementById("langToggle");
  if (toggle) toggle.textContent = (lang === "de" ? "EN" : "DE");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const value = dict[key];
    if (typeof value === "string") el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const value = dict[key];
    if (typeof value === "string") el.setAttribute("placeholder", value);
  });
}
