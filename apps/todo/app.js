"use strict";

import { getJSON, setJSON } from "../../shared/storage.js";

const STORAGE_KEY = "void_todos_v1";
const THEME_KEY = "theme";

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const clearDoneBtn = document.getElementById("clearDone");

const countLeft = document.getElementById("countLeft");
const countTotal = document.getElementById("countTotal");

const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

let todos = loadTodos();
let filter = "all"; // all | active | done

initTheme();
render();

/* ---------- Theme ---------- */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  setTheme(saved || (prefersLight ? "light" : "dark"));

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }
}

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  if (themeToggle) themeToggle.textContent = theme === "light" ? "☀️" : "🌙";
}

/* ---------- Todos: state ---------- */
function loadTodos() {
  const parsed = getJSON(STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveTodos() {
  setJSON(STORAGE_KEY, todos);
}
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const todo = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    text: trimmed,
    done: false,
    createdAt: Date.now(),
  };

  // Neueste oben
  todos.unshift(todo);
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

function clearDone() {
  todos = todos.filter(t => !t.done);
  saveTodos();
  render();
}

/* ---------- UI ---------- */
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
  todoInput.focus();
});

clearDoneBtn.addEventListener("click", () => {
  clearDone();
});

document.querySelectorAll(".chip[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    document.querySelectorAll(".chip[data-filter]").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    render();
  });
});

function getFilteredTodos() {
  if (filter === "active") return todos.filter(t => !t.done);
  if (filter === "done") return todos.filter(t => t.done);
  return todos;
}

function render() {
  const items = getFilteredTodos();

  todoList.innerHTML = "";

  for (const t of items) {
    const li = document.createElement("li");
    li.className = "todo-item" + (t.done ? " done" : "");
    li.dataset.id = t.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-check";
    checkbox.checked = t.done;
    checkbox.addEventListener("change", () => toggleTodo(t.id));

    const p = document.createElement("p");
    p.className = "todo-text";
    p.textContent = t.text;

    const del = document.createElement("button");
    del.className = "icon-btn";
    del.type = "button";
    del.setAttribute("aria-label", "To-Do löschen");
    del.textContent = "🗑";
    del.addEventListener("click", () => deleteTodo(t.id));

    li.appendChild(checkbox);
    li.appendChild(p);
    li.appendChild(del);

    todoList.appendChild(li);
  }

  updateStats();
}

function updateStats() {
  const left = todos.filter(t => !t.done).length;
  const total = todos.length;

  countLeft.textContent = `${left} offen`;
  countTotal.textContent = `${total} gesamt`;

  // Button deaktivieren, wenn nichts zu löschen
  const anyDone = todos.some(t => t.done);
  clearDoneBtn.disabled = !anyDone;
  clearDoneBtn.style.opacity = anyDone ? "1" : "0.5";
  clearDoneBtn.style.pointerEvents = anyDone ? "auto" : "none";
}