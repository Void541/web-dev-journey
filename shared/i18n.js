// shared/i18n.js
let currentLang = localStorage.getItem("lang") || "de";
const LANG_KEY = "lang";

const translations = {
  de: {
    // ================= PORTFOLIO =================
    hero_kicker: "Portfolio von Fabian Materna",
    hero_title: "Ich entwickle ein Canvas-Spiel mit JavaScript.",
    hero_subtitle:
      "Im Game Lab arbeite ich an einem Kampfsystem, einem Craftingsystem und einem questbasierten Fortschrittssystem.",
    hero_highlight_1_label: "Was mich auszeichnet",
    hero_highlight_1_copy:
      "Ich lerne über echte Projekte und kombiniere UI, Struktur und Systemdenken statt nur Theorie zu sammeln.",
    hero_highlight_2_label: "Stärkstes Projekt",
    hero_highlight_2_copy:
      "Game Lab ist aktuell mein klarstes Showcase für Gameplay-Logik, Architektur und saubere Weiterentwicklung.",
    hero_panel_kicker: "Archive Node",
    hero_panel_1_label: "Fokus",
    hero_panel_1_value: "Systeme, UI, Frontend",
    hero_panel_2_label: "Aktuelles Projekt",
    hero_panel_2_value: "Game Lab",
    hero_panel_3_label: "Modus",
    hero_panel_3_value: "Bauen. Verfeinern. Wiederholen.",
    hero_panel_4_label: "Richtung",
    hero_panel_4_value: "Vue, TypeScript und Backend-Grundlagen",
    btn_projects: "Projekte ansehen",
    btn_contact: "Kontakt aufnehmen",

    meta_focus: "Fokus: Interaktive Frontends & Systemdenken",
    meta_rhythm: "Lernen durch echte Projekte",
    meta_goal: "Ziel: Einstieg als Junior-Fullstack-Entwickler",
    nav_projects: "Projekte",
    nav_learning: "Lernquellen",
    nav_contact: "Kontakt",
    nav_about: "Über mich",
    nav_faq: "FAQ",
    themen_switch: "Theme wechseln",
    lang_switch: "Zu Englisch wechseln",
    menu_open: "Menü öffnen",
    menu_close: "Menü schließen",
    about_title: "Über mich",

    about_text:
      "Ich bin Fabian und suche den Einstieg als Junior-Fullstack-Entwickler. Im Game Lab entwickle ich ein Canvas-Spiel mit JavaScript. Dieses Portfolio zeigt, wie ich responsive Oberflächen, Tastaturbedienung und einen Sprachwechsel umsetze. Auf dieser Frontend-Praxis baue ich meine Backend-Kenntnisse auf.",
    about_snapshot_1_label: "Aktuell im Fokus",
    about_snapshot_1_copy:
      "Im Game Lab entwickle ich Spiellogik und Canvas-Darstellung. Im Portfolio arbeite ich an responsivem Layout und verständlicher Bedienung.",
    about_snapshot_2_label: "Wie ich lerne",
    about_snapshot_2_copy:
      "Ich setze Funktionen in kleinen Schritten um, prüfe sie im Browser und halte Änderungen in Git fest.",
    about_snapshot_3_label: "Worauf ich hinarbeite",
    about_snapshot_3_copy:
      "Ich vertiefe Vue und TypeScript in Übungen und möchte als Nächstes eigene APIs und Datenbanken kennenlernen.",

    skills_title: "Was ich bereits einsetze",
    skills_intro:
      "Konkrete Beispiele aus meinem Portfolio und Game Lab.",
    skill_1: "HTML: semantische Abschnitte und beschriftete Formularfelder",
    skill_2: "CSS: responsive Layouts mit Grid und Flexbox",
    skill_3: "JavaScript: DOM-Ereignisse, Sprachwechsel und gespeicherte Einstellungen",
    skill_4: "Game Lab: Canvas-Rendering, Bewegung und Spielzustand",
    skill_5: "Git und GitHub: Änderungen versionieren und über Pages veröffentlichen",
    skill_6: "Barrierefreiheit: Tastaturbedienung und zugängliche Button-Beschriftungen",

    roadmap_title: "Worauf ich als Nächstes hinarbeite",
    roadmap_intro:
      "Meine Lernziele auf dem Weg in die Fullstack-Entwicklung.",
    roadmap_1: "Vue-Komponenten und gemeinsame Zustände in Übungen strukturieren",
    roadmap_2: "TypeScript für Datenmodelle und Funktionsschnittstellen vertiefen",
    roadmap_3: "Eine kleine HTTP-API mit Validierung und Fehlerbehandlung bauen",
    roadmap_4: "Daten in einer relationalen Datenbank speichern und abfragen",
    roadmap_5: "Frontend, API und Datenbank verbinden und wichtige Abläufe testen",

    learning_title: "Womit ich aktuell lerne",
    learning_intro:
      "Ein paar Ressourcen, die mir gerade besonders helfen, besser in Web Design, CSS-Systemen, JavaScript und modernem Frontend-Denken zu werden.",
    learning_open: "Öffnen",
    learning_item_1_type: "Dokumentation",
    learning_item_1_focus: "Frontend-Grundlagen",
    learning_item_1_title: "MDN Learn Web Development",
    learning_item_1_desc:
      "Für saubere Grundlagen in HTML, CSS und JavaScript. Besonders hilfreich, wenn ich Konzepte wirklich verstehen statt nur anwenden will.",
    learning_item_2_type: "Guide",
    learning_item_2_focus: "CSS & Responsive Design",
    learning_item_2_title: "web.dev Learn CSS",
    learning_item_2_desc:
      "Hilft mir dabei, Layout, Spacing, Grid und moderne CSS-Patterns systematischer zu lernen und bewusster einzusetzen.",
    learning_item_3_type: "YouTube",
    learning_item_3_focus: "Design in CSS",
    learning_item_3_title: "Kevin Powell",
    learning_item_3_desc:
      "Gute Quelle für CSS, Komponenten-Denken und die Frage, warum ein Interface ruhig, sauber oder unordentlich wirkt.",
    learning_item_4_type: "Framework",
    learning_item_4_focus: "Nächster Schritt",
    learning_item_4_title: "Vue Docs",
    learning_item_4_desc:
      "Die Doku, auf die ich später hinarbeite, wenn mein Fundament in UI, Struktur und Komponenten-Denken noch stärker geworden ist.",

    learning_item_5_type: "Dokumentation",
    learning_item_5_focus: "JavaScript Grundlagen",
    learning_item_5_title: "javascript.info",
    learning_item_5_desc:
      "Eine sehr gute Quelle, um JavaScript systematisch zu lernen und Themen Schritt für Schritt mit Beispielen zu verstehen.",
    learning_item_6_type: "Guide",
    learning_item_6_focus: "JavaScript Vertiefung",
    learning_item_6_title: "MDN JavaScript Guide",
    learning_item_6_desc:
      "Hilft mir dabei, JavaScript-Konzepte über die Grundlagen hinaus sauberer zu verstehen und besser einzuordnen.",

    projects_title: "Projekte",
    projects_intro:
      "Eine kleine Auswahl der Projekte, an denen ich gerade am meisten wachse. Der Fokus liegt bewusst auf Qualität, Struktur und sichtbarem Lernfortschritt.",
    faq_title: "FAQ",
    faq_intro:
      "Fragen, die ich mir auf meinem Weg in die Webentwicklung selbst stelle und die auch in Gesprächen über moderne Softwareentwicklung immer wieder auftauchen.",
    contact_title: "Kontakt",

    project1_title: "Projekt 1: Mini Portfolio",
    project1_desc: "Diese Seite. Fokus: Struktur, Layout, GitHub Pages.",
    project2_title: "Projekt 2: To-Do App",
    project2_desc: "Interaktiv mit JavaScript (DOM + Events) und localStorage.",
    project3_title: "Projekt 3: Quiz",
    project3_desc: "Quiz mit Kategorien, Highscore und Fragen-Editor.",

    btn_code: "Code",
    btn_live: "Live",
    contact_name: "Name",
    contact_email: "E-Mail",
    contact_message: "Nachricht",
    contact_privacy:
      "Beim Absenden werden deine Angaben zur Bearbeitung deiner Anfrage an Formspree übermittelt.",
    contact_privacy_link: "Datenschutzhinweise von Formspree",
    privacy_link: "Datenschutz (Entwurf)",
    contact_send: "Nachricht senden",
    contact_text:
      "Wenn du Feedback hast oder sehen möchtest, wie ich mich entwickle, schau auf GitHub vorbei.",
    btn_github: "GitHub",
    btn_top: "Nach oben",
    footer_left: "© 2026 Fabian Materna — Web Dev Journey",
    footer_right: "Gebaut mit HTML & CSS • Gehostet auf GitHub Pages",

    //================= Game Lab =================

    project_featured: "Featured Project",
    badge_in_progress: "In Entwicklung",
    project4_spotlight_label: "Herzensprojekt",
    project4_spotlight_text:
      "Das Game Lab ist aktuell mein wichtigstes Projekt, weil ich dort Gameplay, Struktur und Systemdenken zusammenbringe.",

    project4_title: "Game Lab",
    project4_combat_alt: "Game Lab: Raumschiff im Kampf gegen Raider mit Spieler- und Ziel-Lebensanzeige.",
    project4_combat_caption: "Kampfansicht: Gegner, Zielauswahl und Lebensanzeigen.",
    project4_hangar_toggle: "Hangaransicht ansehen",
    project4_preview_alt: "Game Lab: Raumschiff im Hangar mit NPC-Stationen und Minimap.",
    project4_preview_caption: "Einblick ins Game Lab: Hangar und NPC-Stationen.",
    project4_desc:
      "Ein browserbasiertes 2D-Spiel mit eigenem Game Loop, Kampfsystem, Gegnerverhalten und modularer Architektur.",

    project4_story_title: "Mein Einstieg",
    project4_story_text:
      "Im Game Lab habe ich zunächst eine steuerbare Spielerfigur aufgebaut. Dafür habe ich Position, Geschwindigkeit und Lebenspunkte modelliert und anschließend Darstellung und Bewegung umgesetzt. So habe ich gelernt, wie Spielzustand, Canvas-Rendering und Eingaben zusammenspielen.",

    project4_highlight_1: "Canvas Rendering & Animation",
    project4_highlight_2: "Combat, Projectiles & Collision",
    project4_highlight_3: "UI, HUD und Gameplay-Systeme",
    project4_highlight_4: "Modularer JavaScript-Aufbau",

    project4_stat_1: "Status: Aktiv in Entwicklung",
    project4_stat_2: "Fokus: Gameplay & Progression",
    project4_stat_3: "Herzstück meines Portfolios",
    faq_q1: "Warum will ich eigentlich Webentwickler werden?",
    faq_a1:
      "Mich reizt, dass Webentwicklung Kreativität, Struktur und Problemlösen verbindet. Ich kann sichtbare Produkte bauen und gleichzeitig lernen, wie gute Software systematisch entsteht.",
    faq_q2: "Wie lerne ich Programmieren gerade am effektivsten?",
    faq_a2:
      "Ich lerne über echte Projekte. Statt nur Theorie zu lesen, baue ich kleine Anwendungen und ein größeres Herzensprojekt, damit ich UI, Logik, Debugging und Architektur praktisch trainiere.",
    faq_q3: "Was sind aktuell meine größten Stärken?",
    faq_a3:
      "Ich arbeite konstant, dokumentiere meinen Fortschritt über Projekte und denke gerne in Systemen. Besonders wichtig ist mir, nicht nur etwas irgendwie zum Laufen zu bringen, sondern den Code Schritt für Schritt sauberer zu strukturieren.",
    faq_q4: "Ersetzt KI Programmierer oder verändert sie nur die Arbeit?",
    faq_a4:
      "Ich sehe KI eher als Werkzeug als als Ersatz. Sie kann beim Recherchieren, Strukturieren oder Debuggen helfen, aber Verständnis, Verantwortung, Priorisierung und gute Entscheidungen im Produkt bleiben menschlich sehr wichtig.",
    faq_q5: "Wie will ich KI sinnvoll beim Lernen und Entwickeln nutzen?",
    faq_a5:
      "Ich nutze KI, um schneller Feedback zu bekommen, Konzepte besser zu verstehen und verschiedene Lösungswege zu vergleichen. Wichtig ist mir dabei, die Antworten nicht blind zu übernehmen, sondern sie nachzuvollziehen und selbst umzusetzen.",
    faq_q6: "Was bedeutet modernes Programmieren für mich überhaupt?",
    faq_a6:
      "Modernes Programmieren bedeutet für mich nicht nur neue Tools zu kennen, sondern sauber zu kommunizieren, wartbaren Code zu schreiben, mit Hilfsmitteln wie KI sinnvoll umzugehen und kontinuierlich dazuzulernen.",

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
    quiz_ready_sub:
      "Kurzes Quiz (Single Choice). Dein Highscore wird gespeichert.",
    back_main: "← Zurück",

    quiz_editor_title: "Fragen Editor (Custom)",
    quiz_editor_sub:
      "Speichert lokal im Browser (localStorage). Perfekt um dein Quiz zu erweitern.",
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
    hero_title: "I'm building a canvas game with JavaScript.",
    hero_subtitle:
      "In Game Lab, I'm working on a combat system, a crafting system, and a quest-based progression system.",
    hero_highlight_1_label: "What stands out",
    hero_highlight_1_copy:
      "I learn through real projects and combine UI, structure, and systems thinking instead of only collecting theory.",
    hero_highlight_2_label: "Strongest project",
    hero_highlight_2_copy:
      "Game Lab is currently my clearest showcase for gameplay logic, architecture, and thoughtful iteration.",
    hero_panel_kicker: "Archive Node",
    hero_panel_1_label: "Focus",
    hero_panel_1_value: "Systems, UI, frontend",
    hero_panel_2_label: "Current project",
    hero_panel_2_value: "Game Lab",
    hero_panel_3_label: "Mode",
    hero_panel_3_value: "Build. Refine. Repeat.",
    hero_panel_4_label: "Direction",
    hero_panel_4_value: "Vue, TypeScript, and backend fundamentals",
    btn_projects: "View Projects",
    btn_contact: "Get in touch",

    meta_focus: "Focus: Interactive frontends & systems thinking",
    meta_rhythm: "Learning through real projects",
    meta_goal: "Goal: A Junior Fullstack Developer role",
    btn_projects: "View Projects",
    nav_projects: "Projects",
    nav_learning: "Learning",
    nav_contact: "Contact",
    nav_about: "About",
    nav_faq: "FAQ",
    themen_switch: "Switch theme",
    lang_switch: "Switch to German",
    menu_open: "Open menu",
    menu_close: "Close menu",
    about_title: "About",

    about_text:
      "I’m Fabian, and I’m looking for a junior full-stack developer role. In Game Lab, I’m building a JavaScript canvas game. This portfolio demonstrates responsive layouts, keyboard interaction, and language switching. I’m building on that frontend experience by learning backend development.",
    about_snapshot_1_label: "Current focus",
    about_snapshot_1_copy:
      "In Game Lab, I work on game logic and canvas rendering. In my portfolio, I focus on responsive layouts and clear interactions.",
    about_snapshot_2_label: "How I learn",
    about_snapshot_2_copy:
      "I build features in small steps, check them in the browser, and track changes in Git.",
    about_snapshot_3_label: "What I’m working toward",
    about_snapshot_3_copy:
      "I’m practising Vue and TypeScript. Next, I want to learn how to build APIs and work with databases.",

    skills_title: "Skills I use in my projects",
    skills_intro:
      "Examples from my portfolio and Game Lab.",
    skill_1: "HTML: semantic sections and labelled form fields",
    skill_2: "CSS: responsive layouts with Grid and Flexbox",
    skill_3: "JavaScript: DOM events, language switching, and saved preferences",
    skill_4: "Game Lab: canvas rendering, movement, and game state",
    skill_5: "Git and GitHub: versioning changes and publishing with Pages",
    skill_6: "Accessibility: keyboard interaction and accessible button labels",

    roadmap_title: "What I’m moving toward next",
    roadmap_intro:
      "What I plan to learn as I move toward full-stack development.",
    roadmap_1: "Practise structuring Vue components and shared state",
    roadmap_2: "Deepen my TypeScript skills with data models and function interfaces",
    roadmap_3: "Build a small HTTP API with validation and error handling",
    roadmap_4: "Store and query data in a relational database",
    roadmap_5: "Connect a frontend, API, and database, and test key workflows",

    learning_title: "What I’m currently learning with",
    learning_intro:
      "A few resources that are helping me get better at web design, CSS systems, JavaScript, and modern frontend thinking.",
    learning_open: "Open",
    learning_item_1_type: "Documentation",
    learning_item_1_focus: "Frontend fundamentals",
    learning_item_1_title: "MDN Learn Web Development",
    learning_item_1_desc:
      "A strong source for HTML, CSS, and JavaScript fundamentals. Especially helpful when I want to truly understand concepts instead of only applying them.",
    learning_item_2_type: "Guide",
    learning_item_2_focus: "CSS & responsive design",
    learning_item_2_title: "web.dev Learn CSS",
    learning_item_2_desc:
      "Helps me learn layout, spacing, grid, and modern CSS patterns in a more structured way and use them more intentionally.",
    learning_item_3_type: "YouTube",
    learning_item_3_focus: "Design in CSS",
    learning_item_3_title: "Kevin Powell",
    learning_item_3_desc:
      "A great source for CSS, component thinking, and understanding why an interface feels calm, clean, or visually noisy.",
    learning_item_4_type: "Framework",
    learning_item_4_focus: "Next step",
    learning_item_4_title: "Vue Docs",
    learning_item_4_desc:
      "The documentation I want to grow into once my foundation in UI, structure, and component thinking is even stronger.",

    learning_item_5_type: "Documentation",
    learning_item_5_focus: "JavaScript fundamentals",
    learning_item_5_title: "javascript.info",
    learning_item_5_desc:
      "A very good source for learning JavaScript in a structured way and understanding topics step by step with examples.",
    learning_item_6_type: "Guide",
    learning_item_6_focus: "Deeper JavaScript",
    learning_item_6_title: "MDN JavaScript Guide",
    learning_item_6_desc:
      "Helps me understand JavaScript concepts beyond the basics more clearly and place them in a stronger overall context.",

    projects_title: "Projects",
    projects_intro:
      "A small selection of the projects where I’m currently growing the most. The focus is intentionally on quality, structure, and visible learning progress.",
    faq_title: "FAQ",
    faq_intro:
      "Questions I ask myself on my path into web development and that also come up often in conversations about modern software development.",
    contact_title: "Contact",

    project1_title: "Project 1: Mini Portfolio",
    project1_desc: "This site. Focus: structure, layout, GitHub Pages.",
    project2_title: "Project 2: To-Do App",
    project2_desc: "Interactive JavaScript (DOM + events) with localStorage.",
    project3_title: "Project 3: Quiz",
    project3_desc: "Quiz with categories, highscore and a question editor.",

    btn_code: "Code",
    btn_live: "Live",
    contact_name: "Name",
    contact_email: "Email",
    contact_message: "Message",
    contact_privacy:
      "When you submit this form, your details are sent to Formspree to process your enquiry.",
    contact_privacy_link: "Formspree privacy policy",
    privacy_link: "Privacy (German draft)",
    contact_send: "Send message",
    contact_text:
      "If you have feedback or want to see how I'm progressing, check out my GitHub.",
    btn_github: "GitHub",
    btn_top: "Back to top",
    footer_left: "© 2026 Fabian Materna — Web Dev Journey",
    footer_right: "Built with HTML & CSS • Hosted on GitHub Pages",

    //================= Game Lab =================

    project_featured: "Featured Project",
    badge_in_progress: "In Progress",
    project4_spotlight_label: "Signature Project",
    project4_spotlight_text:
      "Game Lab is my main project right now because it brings together gameplay, structure, and systems thinking in one place.",

    project4_title: "Game Lab",
    project4_combat_alt: "Game Lab: a spaceship fighting raiders, with player and target health indicators.",
    project4_combat_caption: "Combat view: enemies, target selection, and health indicators.",
    project4_hangar_toggle: "View the hangar",
    project4_preview_alt: "Game Lab: a spaceship in the hangar with NPC stations and a minimap.",
    project4_preview_caption: "Inside Game Lab: the hangar and NPC stations.",
    project4_desc:
      "A browser-based 2D game with a custom game loop, combat systems, enemy behavior and modular architecture.",

    project4_story_title: "How I started",
    project4_story_text:
      "I started Game Lab by building a controllable player character. I defined its position, speed, and health, then implemented rendering and movement. This helped me understand how game state, canvas rendering, and player input work together.",

    project4_highlight_1: "Canvas rendering & animation",
    project4_highlight_2: "Combat, projectiles & collision",
    project4_highlight_3: "UI, HUD and gameplay systems",
    project4_highlight_4: "Modular JavaScript structure",

    project4_stat_1: "Status: Actively in development",
    project4_stat_2: "Focus: Gameplay & progression",
    project4_stat_3: "Centerpiece of my portfolio",
    faq_q1: "Why do I actually want to become a web developer?",
    faq_a1:
      "I’m drawn to how web development combines creativity, structure, and problem-solving. I can build visible products while also learning how good software is created systematically.",
    faq_q2: "How am I currently learning programming most effectively?",
    faq_a2:
      "I learn through real projects. Instead of only reading theory, I build small applications and one larger passion project so I can practice UI, logic, debugging, and architecture in a practical way.",
    faq_q3: "What are my biggest strengths right now?",
    faq_a3:
      "I work consistently, document my progress through projects, and enjoy thinking in systems. It matters to me not just to make something work somehow, but to structure the code more cleanly step by step.",
    faq_q4: "Will AI replace programmers, or mainly change the work?",
    faq_a4:
      "I see AI more as a tool than a replacement. It can help with research, structuring, and debugging, but understanding, responsibility, prioritization, and good product decisions are still very human tasks.",
    faq_q5: "How do I want to use AI while learning and building?",
    faq_a5:
      "I use AI to get feedback faster, understand concepts better, and compare different solution paths. What matters to me is not copying answers blindly, but understanding them and implementing them myself.",
    faq_q6: "What does modern programming actually mean to me?",
    faq_a6:
      "To me, modern programming is not only about knowing new tools. It also means communicating clearly, writing maintainable code, using tools like AI responsibly, and continuing to learn.",

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
    quiz_editor_sub:
      "Saved locally in your browser (localStorage). Perfect to extend your quiz.",
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
      const current =
        document.documentElement.getAttribute("data-lang") || "de";
      setLang(current === "de" ? "en" : "de");
    });
  }
}

export function setLang(lang) {
  const dict = translations[lang] || translations.de;
  currentLang = lang;

  document.documentElement.setAttribute("data-lang", lang);
  localStorage.setItem(LANG_KEY, lang);

  document.documentElement.setAttribute("lang", lang);

  const toggle = document.getElementById("langToggle");
  if (toggle) toggle.textContent = lang === "de" ? "EN" : "DE";

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

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    const value = dict[key];
    if (typeof value === "string") {
      el.setAttribute("aria-label", value);
    }
  });
}
