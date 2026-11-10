import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const portfolio = new URL("../apps/portfolio/", import.meta.url);
const pages = ["index.html", "privacy.html"];
const problems = [];
const read = (url) => readFileSync(url, "utf8");

// Load the browser modules without changing the repository's Node module type.
const loadModule = (url) =>
  import("data:text/javascript;base64," + Buffer.from(read(url)).toString("base64"));

globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.document = {
  documentElement: { setAttribute: () => {} },
  getElementById: () => null,
  querySelectorAll: () => [],
};

const { setLang, t } = await loadModule(new URL("../../shared/i18n.js", portfolio));
const { renderAboutSnapshots, renderLearningResources } = await loadModule(
  new URL("content.js", portfolio),
);
const snapshots = {};
const resources = {};
renderAboutSnapshots(snapshots);
renderLearningResources(resources);

const idsIn = (html) =>
  Array.from(html.matchAll(/\bid=["']([^"']+)["']/g), (match) => match[1]);
let translationCount = 0;
let linkCount = 0;

for (const page of pages) {
  const url = new URL(page, portfolio);
  const html = read(url) + (page === "index.html" ? snapshots.innerHTML + resources.innerHTML : "");
  const ids = idsIn(html);
  for (const id of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) {
    problems.push(`${page}: duplicate id "${id}"`);
  }

  const keys = new Set(
    Array.from(
      html.matchAll(/\bdata-i18n(?:-aria-label|-placeholder)?=["']([^"']+)["']/g),
      (match) => match[1],
    ),
  );
  for (const language of ["de", "en"]) {
    setLang(language);
    for (const key of keys) {
      translationCount++;
      const value = t(key);
      if (typeof value !== "string" || !value.trim() || value === key) {
        problems.push(`${page}: missing ${language} translation "${key}"`);
      }
    }
  }

  for (const [, link] of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(link)) continue;
    linkCount++;
    const target = new URL(link, url);
    let path = fileURLToPath(target);
    if (existsSync(path) && statSync(path).isDirectory()) {
      path = fileURLToPath(new URL("index.html", target));
    }
    if (!existsSync(path)) {
      problems.push(`${page}: missing local target "${link}"`);
    } else if (target.hash && /\.html?$/i.test(path)) {
      const targetIds = path === fileURLToPath(url) ? ids : idsIn(readFileSync(path, "utf8"));
      if (!targetIds.includes(decodeURIComponent(target.hash.slice(1)))) {
        problems.push(`${page}: missing anchor "${link}"`);
      }
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Portfolio OK: ${translationCount} translations, ${linkCount} local references.`);
}
