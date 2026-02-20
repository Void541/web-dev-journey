"use strict";

const THEME_KEY = "theme";
const HS_KEY = "void_quiz_highscore_v1";

// ---- Questions (du kannst später eigene hinzufügen) ----
const QUESTION_BANK = [
  {
    q: "Was bedeutet DOM?",
    a: ["Document Object Model", "Data Output Method", "Dynamic Order Map", "Design Object Mode"],
    correct: 0,
  },
  {
    q: "Welche Methode speichert Daten im Browser dauerhaft (ohne Login)?",
    a: ["sessionStorage", "localStorage", "cookieJar()", "cacheStorage()"],
    correct: 1,
  },
  {
    q: "Welche Schleife ist ideal, wenn du genau weißt wie oft du iterierst?",
    a: ["for", "while", "do...while", "switch"],
    correct: 0,
  },
  {
    q: "Welche Aussage stimmt?",
    a: ["CSS ist eine Programmiersprache", "HTML strukturiert Inhalte", "JS ist nur für Server", "Git ist ein Browser"],
    correct: 1,
  },
  {
    q: "Wie heißt das Keyword für eine Konstante in JS?",
    a: ["var", "const", "static", "fixed"],
    correct: 1,
  },
  {
    q: "Was macht addEventListener?",
    a: ["Ändert CSS", "Lädt Bilder", "Registriert ein Event", "Speichert Daten"],
    correct: 2,
  },
  {
    q: "Welche Funktion wandelt JSON-Text in ein Objekt um?",
    a: ["JSON.parse()", "JSON.stringify()", "parseInt()", "toString()"],
    correct: 0,
  },
  {
    q: "Womit startest du typischerweise einen Game Loop im Browser?",
    a: ["setTimeout()", "requestAnimationFrame()", "while(true)", "onloadLoop()"],
    correct: 1,
  },
  {
    q: "Welche Aussage über Arrays ist richtig?",
    a: ["Arrays haben keine Länge", "Arrays können gemischte Typen enthalten", "Arrays sind immer sortiert", "Arrays können keine Objekte enthalten"],
    correct: 1,
  },
  {
    q: "Was ist 'state' in einer App?",
    a: ["Der aktuelle Zustand der Daten/GUI", "Eine CSS-Datei", "Ein Git-Branch", "Eine Browser-Erweiterung"],
    correct: 0,
  },
];

// ---- DOM ----
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

const screenStart = document.getElementById("screenStart");
const screenQuiz = document.getElementById("screenQuiz");
const screenResult = document.getElementById("screenResult");

const selectCount = document.getElementById("selectCount");
const toggleShuffle = document.getElementById("toggleShuffle");
const selectTimer = document.getElementById("selectTimer");

const highscoreText = document.getElementById("highscoreText");
const resetHighscoreBtn = document.getElementById("resetHighscore");
const startBtn = document.getElementById("startBtn");

const progressText = document.getElementById("progressText");
const barFill = document.getElementById("barFill");
const scoreText = document.getElementById("scoreText");
const timerText = document.getElementById("timerText");

const questionText = document.getElementById("questionText");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const quitBtn = document.getElementById("quitBtn");

const resultText = document.getElementById("resultText");
const resultHint = document.getElementById("resultHint");
const backBtn = document.getElementById("backBtn");
const restartBtn = document.getElementById("restartBtn");

// ---- State ----
let quiz = {
  questions: [],
  index: 0,
  score: 0,
  locked: false,
  selected: null,
  timerSec: 0,
  timerId: null,
};

initTheme();
renderHighscore();

// ---- Events ----
startBtn.addEventListener("click", () => startQuiz());

restartBtn.addEventListener("click", () => startQuiz());
backBtn.addEventListener("click", () => showScreen("start"));
quitBtn.addEventListener("click", () => showScreen("start"));

nextBtn.addEventListener("click", () => {
  if (quiz.locked === false) return; // erst nach Antwort
  quiz.index++;
  if (quiz.index >= quiz.questions.length) finishQuiz();
  else renderQuestion();
});

resetHighscoreBtn.addEventListener("click", () => {
  localStorage.removeItem(HS_KEY);
  renderHighscore();
});

// ---- Theme ----
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  setTheme(saved || (prefersLight ? "light" : "dark"));

  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });
}

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  themeToggle.textContent = theme === "light" ? "☀️" : "🌙";
}

// ---- Quiz flow ----
function startQuiz() {
  const count = clamp(Number(selectCount.value), 1, QUESTION_BANK.length);
  const doShuffle = !!toggleShuffle.checked;
  const timerSec = Number(selectTimer.value) || 0;

  const bank = doShuffle ? shuffle([...QUESTION_BANK]) : [...QUESTION_BANK];
  const picked = bank.slice(0, count);

  quiz.questions = picked;
  quiz.index = 0;
  quiz.score = 0;
  quiz.locked = false;
  quiz.selected = null;
  quiz.timerSec = timerSec;

  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  clearTimer();

  quiz.locked = false;
  quiz.selected = null;
  nextBtn.disabled = true;

  const total = quiz.questions.length;
  const i = quiz.index;
  const q = quiz.questions[i];

  progressText.textContent = `Frage ${i + 1}/${total}`;
  barFill.style.width = `${Math.round(((i) / total) * 100)}%`;

  scoreText.textContent = String(quiz.score);
  questionText.textContent = q.q;

  answersEl.innerHTML = "";
  q.a.forEach((text, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer";
    btn.textContent = text;
    btn.addEventListener("click", () => selectAnswer(idx));
    answersEl.appendChild(btn);
  });

  if (quiz.timerSec > 0) startTimer(quiz.timerSec);
  else timerText.classList.add("hidden");
}

function selectAnswer(choiceIndex) {
  if (quiz.locked) return;
  quiz.selected = choiceIndex;
  quiz.locked = true;

  clearTimer();

  const q = quiz.questions[quiz.index];
  const correctIndex = q.correct;

  const answerButtons = [...answersEl.querySelectorAll(".answer")];
answerButtons[choiceIndex].classList.add("selected"); // <-- neu
answerButtons.forEach(b => b.classList.add("locked"));

  // mark correct + wrong
  answerButtons[correctIndex].classList.add("correct");
  if (choiceIndex !== correctIndex) answerButtons[choiceIndex].classList.add("wrong");
  else quiz.score += 1;

  scoreText.textContent = String(quiz.score);
  nextBtn.disabled = false;

  // progress bar update after answering
  const total = quiz.questions.length;
  const i = quiz.index + 1;
  barFill.style.width = `${Math.round((i / total) * 100)}%`;
}

function finishQuiz() {
  clearTimer();
  showScreen("result");

  const total = quiz.questions.length;
  resultText.textContent = `${quiz.score} / ${total}`;

  const pct = Math.round((quiz.score / total) * 100);
  let hint = "Solide Basis.";
  if (pct === 100) hint = "Perfekt. Das sitzt.";
  else if (pct >= 80) hint = "Sehr stark – fast fehlerfrei.";
  else if (pct >= 60) hint = "Gute Richtung – weiter festigen.";
  else hint = "Kein Stress – wichtig ist Konstanz.";

  resultHint.textContent = `${pct}% • ${hint}`;

  updateHighscore(quiz.score, total);
  renderHighscore();
}

function showScreen(which) {
  clearTimer();
  screenStart.classList.toggle("hidden", which !== "start");
  screenQuiz.classList.toggle("hidden", which !== "quiz");
  screenResult.classList.toggle("hidden", which !== "result");
}

// ---- Timer ----
function startTimer(seconds) {
  let t = seconds;
  timerText.classList.remove("hidden");
  timerText.textContent = `⏱ ${t}`;

  quiz.timerId = setInterval(() => {
    t -= 1;
    timerText.textContent = `⏱ ${t}`;
    if (t <= 0) {
      clearTimer();
      // Auto-fail if no answer
      autoFail();
    }
  }, 1000);
}

function autoFail() {
  if (quiz.locked) return;
  quiz.locked = true;
  nextBtn.disabled = false;

  const q = quiz.questions[quiz.index];
  const correctIndex = q.correct;
  const answerButtons = [...answersEl.querySelectorAll(".answer")];
  answerButtons.forEach(b => b.classList.add("locked"));
  answerButtons[correctIndex].classList.add("correct");

  const total = quiz.questions.length;
  const i = quiz.index + 1;
  barFill.style.width = `${Math.round((i / total) * 100)}%`;
}

function clearTimer() {
  if (quiz.timerId) clearInterval(quiz.timerId);
  quiz.timerId = null;
  timerText.classList.add("hidden");
}

// ---- Highscore ----
function renderHighscore() {
  const hs = getHighscore();
  if (!hs) {
    highscoreText.textContent = "0 / 0";
    return;
  }
  highscoreText.textContent = `${hs.bestScore} / ${hs.total}`;
}

function getHighscore() {
  try {
    const raw = localStorage.getItem(HS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function updateHighscore(score, total) {
  const hs = getHighscore();
  if (!hs || hs.total !== total || score > hs.bestScore) {
    localStorage.setItem(HS_KEY, JSON.stringify({ bestScore: score, total }));
  }
}

// ---- Utils ----
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

document.addEventListener("keydown", (e) => {
  if (screenQuiz.classList.contains("hidden")) return;
  if (quiz.locked) return;

  const n = Number(e.key);
  if (!Number.isFinite(n)) return;

  // 1-4
  if (n >= 1 && n <= 4) selectAnswer(n - 1);
});