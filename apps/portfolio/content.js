const aboutSnapshots = [
  {
    classes: "snapshot-card-focus",
    labelKey: "about_snapshot_1_label",
    labelFallback: "Aktuell im Fokus",
    copyKey: "about_snapshot_1_copy",
    copyFallback:
      "Interaktive Frontends, bessere UI-Entscheidungen und ein sauberer Umgang mit wachsender Projektkomplexität.",
  },
  {
    classes: "snapshot-card-learning",
    labelKey: "about_snapshot_2_label",
    labelFallback: "Wie ich lerne",
    copyKey: "about_snapshot_2_copy",
    copyFallback:
      "Nicht nur lesen, sondern bauen, verbessern, reflektieren und aus echten Projekten sichtbaren Fortschritt machen.",
  },
  {
    classes: "snapshot-card-direction",
    labelKey: "about_snapshot_3_label",
    labelFallback: "Worauf ich hinarbeite",
    copyKey: "about_snapshot_3_copy",
    copyFallback:
      "Ein starkes Frontend-Fundament, produktnähere Projekte und danach moderne Frameworks wie Vue.",
  },
];

const learningResources = [
  {
    classes: "resource-card-wide",
    typeKey: "learning_item_1_type",
    typeFallback: "Dokumentation",
    focusKey: "learning_item_1_focus",
    focusFallback: "Frontend-Grundlagen",
    titleKey: "learning_item_1_title",
    titleFallback: "MDN Learn Web Development",
    descKey: "learning_item_1_desc",
    descFallback:
      "Für saubere Grundlagen in HTML, CSS und JavaScript. Besonders hilfreich, wenn ich Konzepte wirklich verstehen statt nur anwenden will.",
    href: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
  },
  {
    classes: "resource-card-compact",
    typeKey: "learning_item_2_type",
    typeFallback: "Guide",
    focusKey: "learning_item_2_focus",
    focusFallback: "CSS & Responsive Design",
    titleKey: "learning_item_2_title",
    titleFallback: "web.dev Learn CSS",
    descKey: "learning_item_2_desc",
    descFallback:
      "Hilft mir dabei, Layout, Spacing, Grid und moderne CSS-Patterns systematischer zu lernen und bewusster einzusetzen.",
    href: "https://web.dev/learn/css/",
  },
  {
    classes: "resource-card-compact",
    typeKey: "learning_item_3_type",
    typeFallback: "YouTube",
    focusKey: "learning_item_3_focus",
    focusFallback: "Design in CSS",
    titleKey: "learning_item_3_title",
    titleFallback: "Kevin Powell",
    descKey: "learning_item_3_desc",
    descFallback:
      "Gute Quelle für CSS, Komponenten-Denken und die Frage, warum ein Interface ruhig, sauber oder unordentlich wirkt.",
    href: "https://www.kevinpowell.co/youtube/",
  },
  {
    classes: "resource-card-wide",
    typeKey: "learning_item_4_type",
    typeFallback: "Framework",
    focusKey: "learning_item_4_focus",
    focusFallback: "Nächster Schritt",
    titleKey: "learning_item_4_title",
    titleFallback: "Vue Docs",
    descKey: "learning_item_4_desc",
    descFallback:
      "Die Doku, auf die ich später hinarbeite, wenn mein Fundament in UI, Struktur und Komponenten-Denken noch stärker geworden ist.",
    href: "https://vuejs.org/guide/introduction.html",
  },
  {
    classes: "resource-card-wide",
    typeKey: "learning_item_5_type",
    typeFallback: "Dokumentation",
    focusKey: "learning_item_5_focus",
    focusFallback: "JavaScript Grundlagen",
    titleKey: "learning_item_5_title",
    titleFallback: "javascript.info",
    descKey: "learning_item_5_desc",
    descFallback:
      "Eine sehr gute Quelle, um JavaScript systematisch zu lernen und Themen Schritt für Schritt mit Beispielen zu verstehen.",
    href: "https://javascript.info/",
  },
  {
    classes: "resource-card-compact",
    typeKey: "learning_item_6_type",
    typeFallback: "Guide",
    focusKey: "learning_item_6_focus",
    focusFallback: "JavaScript Vertiefung",
    titleKey: "learning_item_6_title",
    titleFallback: "MDN JavaScript Guide",
    descKey: "learning_item_6_desc",
    descFallback:
      "Hilft mir dabei, JavaScript-Konzepte über die Grundlagen hinaus sauberer zu verstehen und besser einzuordnen.",
    href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
  },
];

function createAboutSnapshotCard(item) {
  return `
    <article class="about-snapshot-card ${item.classes}">
      <p class="about-snapshot-label eyebrow" data-i18n="${item.labelKey}">${item.labelFallback}</p>
      <p class="about-snapshot-copy" data-i18n="${item.copyKey}">${item.copyFallback}</p>
    </article>
  `;
}

function createLearningResourceCard(item) {
  return `
    <article class="card resource-card ${item.classes}">
      <div class="resource-head surface-head">
        <p class="resource-kicker eyebrow" data-i18n="${item.typeKey}">${item.typeFallback}</p>
        <span class="badge" data-i18n="${item.focusKey}">${item.focusFallback}</span>
      </div>
      <h3 class="accent-title" data-i18n="${item.titleKey}">${item.titleFallback}</h3>
      <p data-i18n="${item.descKey}">${item.descFallback}</p>
      <div class="card-actions">
        <a class="btn small ghost" href="${item.href}" target="_blank" rel="noopener noreferrer" data-i18n="learning_open">Öffnen</a>
      </div>
    </article>
  `;
}

export function renderAboutSnapshots(container) {
  if (!container) return;
  container.innerHTML = aboutSnapshots.map(createAboutSnapshotCard).join("");
}

export function renderLearningResources(container) {
  if (!container) return;
  container.innerHTML = learningResources.map(createLearningResourceCard).join("");
}

