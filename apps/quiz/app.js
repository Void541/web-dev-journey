"use strict";
let audioCtx = null;
let QUESTION_BANK = [];

function beep(type = "good") {
  // Audio muss durch User-Interaktion gestartet werden → deshalb lazy init
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();

  const t0 = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = type === "good" ? 660 : 220;

  // Lautstärke sehr niedrig (nicht nervig)
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.05, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(t0);
  osc.stop(t0 + 0.2);
}

const THEME_KEY = "theme";
const HS_KEY = "void_quiz_highscore_v1";
const CUSTOM_KEY = "void_quiz_custom_questions_v1";


// ---- DOM ----
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

const editorForm = document.getElementById("editorForm");
const edCategory = document.getElementById("edCategory");
const edQuestion = document.getElementById("edQuestion");
const edA0 = document.getElementById("edA0");
const edA1 = document.getElementById("edA1");
const edA2 = document.getElementById("edA2");
const edA3 = document.getElementById("edA3");
const edCorrect = document.getElementById("edCorrect");
const editorMsg = document.getElementById("editorMsg");
const clearCustomBtn = document.getElementById("clearCustom");
const customList = document.getElementById("customList");

const selectCategory = document.getElementById("selectCategory");
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
startBtn.addEventListener("click", async () => {
  if (QUESTION_BANK.length === 0) await loadQuestionBank();
  startQuiz();
});

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

if (editorForm) {
  renderCustomList();

  editorForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const qText = (edQuestion.value || "").trim();
    const answers = [
      (edA0.value || "").trim(),
      (edA1.value || "").trim(),
      (edA2.value || "").trim(),
      (edA3.value || "").trim(),
    ];
    const correct = Number(edCorrect.value);
    const category = edCategory.value || "general";

    // Validation
    if (!qText || answers.some(a => !a) || !(correct >= 0 && correct <= 3)) {
      setEditorMsg("Bitte alles ausfüllen (Frage + 4 Antworten).", true);
      return;
    }

    const newQ = { category, q: qText, a: answers, correct };

    const custom = loadCustomQuestions();
    custom.unshift(newQ);
    saveCustomQuestions(custom);

    // Reset inputs
    edQuestion.value = "";
    edA0.value = ""; edA1.value = ""; edA2.value = ""; edA3.value = "";
    edCorrect.value = "0";
    edCategory.value = category;

    setEditorMsg("Gespeichert ✅", false);
    renderCustomList();
    renderHighscore(); // optional
  });

  clearCustomBtn.addEventListener("click", () => {
    localStorage.removeItem(CUSTOM_KEY);
    setEditorMsg("Custom Fragen gelöscht.", false);
    renderCustomList();
  });
}

function setEditorMsg(text, isError) {
  if (!editorMsg) return;
  editorMsg.textContent = text;
  editorMsg.style.color = isError ? "var(--bad)" : "var(--muted)";
  setTimeout(() => {
    if (editorMsg.textContent === text) editorMsg.textContent = "";
  }, 2500);
}

function renderCustomList() {
  if (!customList) return;
  const custom = loadCustomQuestions();

  customList.innerHTML = "";
  if (custom.length === 0) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "Noch keine Custom Fragen gespeichert.";
    customList.appendChild(li);
    return;
  }

  custom.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "custom-item";

    const left = document.createElement("div");
    left.innerHTML = `<strong>[${item.category || "general"}]</strong> ${escapeHtml(item.q)}`;

    const del = document.createElement("button");
    del.className = "btn danger";
    del.type = "button";
    del.textContent = "Löschen";
    del.addEventListener("click", () => {
      const list = loadCustomQuestions();
      list.splice(idx, 1);
      saveCustomQuestions(list);
      renderCustomList();
      setEditorMsg("Gelöscht.", false);
    });

    li.appendChild(left);
    li.appendChild(del);
    customList.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

async function loadQuestionBank() {
  // 1) Versuch: questions.json laden (funktioniert auf GitHub Pages / Live Server)
  try {
    const res = await fetch("questions.json", { cache: "no-store" });
    if (!res.ok) throw new Error("questions.json not ok");
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("questions.json ist kein Array");
    // basic validation
    const cleaned = data.filter(q =>
      q && typeof q.q === "string" &&
      Array.isArray(q.a) && q.a.length === 4 &&
      Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.a.length
    );

    if (cleaned.length === 0) throw new Error("Keine gültigen Fragen gefunden");
    QUESTION_BANK = cleaned;
    return;
  } catch (e) {
    // 2) Fallback: Minimales Set (damit nichts kaputt geht)
    QUESTION_BANK = [
      { category: "web", q: "Was bedeutet DOM?", a: ["Document Object Model", "Data Output Method", "Dynamic Order Map", "Design Object Mode"], correct: 0 },
      { category: "js", q: "Welche Funktion wandelt JSON-Text in ein Objekt um?", a: ["JSON.parse()", "JSON.stringify()", "parseInt()", "toString()"], correct: 0 },
      { category: "games", q: "Womit startest du typischerweise einen Game Loop im Browser?", a: ["setTimeout()", "requestAnimationFrame()", "while(true)", "onloadLoop()"], correct: 1 }
    ];
  }
}

function loadCustomQuestions() {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveCustomQuestions(list) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

function getMergedBank() {
  const custom = loadCustomQuestions();
  // custom zuerst, damit deine eigenen Fragen Priorität haben
  return [...custom, ...QUESTION_BANK];
}

function getBankForCategory() {
  const cat = selectCategory?.value || "all";
  const merged = getMergedBank();
  if (cat === "all") return [...merged];
  return merged.filter(q => (q.category || "general") === cat);
}


// ---- Quiz flow ----
function startQuiz() {
  const available = getBankForCategory();
  const count = clamp(Number(selectCount.value), 1, available.length);
  const doShuffle = !!toggleShuffle.checked;
  const timerSec = Number(selectTimer.value) || 0;

  const bank = doShuffle ? shuffle([...available]) : [...available];
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
  if (choiceIndex !== correctIndex) {
  answerButtons[choiceIndex].classList.add("wrong");
  beep("bad");
} else {
  quiz.score += 1;
  beep("good");
}
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
    beep("bad");
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