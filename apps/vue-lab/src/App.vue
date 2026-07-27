<script setup>
import { computed, reactive, ref } from 'vue'
import LearningCard from './components/LearningCard.vue'
import { vueLessonPlan } from './data/vueLessonPlan.js'

const lessons = ref(vueLessonPlan.map((lesson) => ({ ...lesson })))
const learnerName = ref('')
const draftLesson = reactive({
  kind: 'Praxis',
  title: '',
  summary: '',
  tags: '',
})
const miniProfile = reactive({
  focus: 'Vue Grundlagen',
  note: '',
})
const hasTriedSubmit = ref(false)

const completedCount = computed(
  () => lessons.value.filter((lesson) => lesson.done).length,
)

const nextLesson = computed(
  () => lessons.value.find((lesson) => !lesson.done) ?? null,
)

const personalGreeting = computed(() =>
  learnerName.value.trim()
    ? `Hallo ${learnerName.value.trim()}, Vue reagiert gerade auf deine Eingabe.`
    : 'Tippe deinen Namen ein und beobachte, wie Vue die Ausgabe sofort aktualisiert.',
)

const miniPreview = computed(() =>
  miniProfile.note.trim()
    ? miniProfile.note.trim()
    : 'Noch keine Notiz eingetragen. Das Feld unten ist direkt mit dem State verbunden.',
)

const draftTags = computed(() =>
  draftLesson.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean),
)

const draftChecks = computed(() => ({
  title: draftLesson.title.trim().length > 0,
  summary: draftLesson.summary.trim().length > 0,
  tags: draftTags.value.length > 0,
}))

const canAddLesson = computed(
  () => draftChecks.value.title && draftChecks.value.summary && draftChecks.value.tags,
)

const draftFeedback = computed(() => {
  if (canAddLesson.value) {
    return 'Sieht gut aus. Die Karte ist bereit zum Hinzufuegen.'
  }

  const missing = []

  if (!draftChecks.value.title) missing.push('einen Titel')
  if (!draftChecks.value.summary) missing.push('eine Kurzbeschreibung')
  if (!draftChecks.value.tags) missing.push('mindestens einen Tag')

  return `Es fehlt noch ${missing.join(', ')}.`
})

function toggleLesson(id) {
  const lesson = lessons.value.find((entry) => entry.id === id)
  if (!lesson) return
  lesson.done = !lesson.done
}

function addLesson() {
  hasTriedSubmit.value = true

  if (!canAddLesson.value) return

  const title = draftLesson.title.trim()
  const summary = draftLesson.summary.trim()
  const tags = draftTags.value

  lessons.value.unshift({
    id: `custom-${Date.now()}`,
    kind: draftLesson.kind,
    title,
    summary,
    tags,
    done: false,
  })

  draftLesson.kind = 'Praxis'
  draftLesson.title = ''
  draftLesson.summary = ''
  draftLesson.tags = ''
  hasTriedSubmit.value = false
}

function deleteLesson(id) {
  lessons.value = lessons.value.filter((lesson) => lesson.id !== id)
}

function updateLesson(payload) {
  const lesson = lessons.value.find((entry) => entry.id === payload.id)
  if (!lesson) return

  lesson.kind = payload.kind
  lesson.title = payload.title
  lesson.summary = payload.summary
  lesson.tags = payload.tags
}
</script>

<template>
  <main class="shell">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">Vue Start</p>
        <h1>Wir denken jetzt in Komponenten statt in ganzen Seiten.</h1>
        <p class="hero-text">
          Diese kleine OberflÃ¤che ist dein erster Vue-Spielplatz. Der Parent
          hÃ¤lt die Daten, die Cards bekommen Props und melden Ã„nderungen mit
          Events zurÃ¼ck.
        </p>

        <div class="hero-stats">
          <article class="stat-card">
            <span class="stat-label">Fertig</span>
            <strong class="stat-value">{{ completedCount }}/{{ lessons.length }}</strong>
          </article>
          <article class="stat-card stat-card-accent">
            <span class="stat-label">NÃ¤chster Fokus</span>
            <strong class="stat-value">
              {{ nextLesson ? nextLesson.title : 'Alles erledigt' }}
            </strong>
          </article>
        </div>
      </div>

      <aside class="signal-panel">
        <p class="eyebrow signal-kicker">Warum das wichtig ist</p>
        <ul class="signal-list">
          <li>Props: Daten flieÃŸen von oben nach unten.</li>
          <li>Emits: Kinder melden Aktionen an den Parent zurÃ¼ck.</li>
          <li>State: Eine Quelle der Wahrheit statt verteiltem DOM-Code.</li>
        </ul>
      </aside>
    </section>

    <section class="mini-lab">
      <div class="section-head mini-lab-head">
        <div>
          <p class="eyebrow">Mini Uebung</p>
          <h2>ref, reactive und v-model in klein</h2>
        </div>
        <p class="section-copy">
          Dieser Block ist absichtlich klein. Hier lernen wir erst das Grundgefuehl,
          bevor wir wieder in den groesseren Karten-Code gehen.
        </p>
      </div>

      <div class="mini-lab-grid">
        <section class="mini-card">
          <p class="eyebrow">ref</p>
          <h3>Ein einzelner Wert</h3>
          <p class="lesson-copy">
            Das Input unten ist mit <code>learnerName</code> verbunden.
          </p>

          <label class="field">
            <span class="field-label">Dein Name</span>
            <input
              v-model="learnerName"
              class="field-control"
              type="text"
              placeholder="z. B. Fabian"
            />
          </label>

          <p class="mini-output">{{ personalGreeting }}</p>
        </section>

        <section class="mini-card">
          <p class="eyebrow">reactive</p>
          <h3>Mehrere Werte in einem Objekt</h3>
          <p class="lesson-copy">
            Hier stecken zwei Felder im Objekt <code>miniProfile</code>.
          </p>

          <div class="mini-form">
            <label class="field">
              <span class="field-label">Aktueller Fokus</span>
              <input
                v-model="miniProfile.focus"
                class="field-control"
                type="text"
                placeholder="Woran lernst du gerade?"
              />
            </label>

            <label class="field">
              <span class="field-label">Kurze Notiz</span>
              <textarea
                v-model="miniProfile.note"
                class="field-control field-textarea mini-textarea"
                rows="3"
                placeholder="Was hast du heute verstanden?"
              ></textarea>
            </label>
          </div>

          <div class="mini-preview">
            <span class="stat-label">Live Vorschau</span>
            <strong class="mini-preview-title">{{ miniProfile.focus }}</strong>
            <p class="lesson-copy">{{ miniPreview }}</p>
          </div>
        </section>
      </div>
    </section>

    <section class="lesson-section">
      <div class="section-head">
        <div>
          <p class="eyebrow">Lernkarten</p>
          <h2>Dein erster Vue-Ablauf</h2>
        </div>
        <p class="section-copy">
          Morgen kÃ¶nnen wir jede dieser Karten weiter ausbauen und direkt mit
          echten Vue-Mustern experimentieren.
        </p>
      </div>

      <section class="composer-card">
        <div class="section-head composer-head">
          <div>
            <p class="eyebrow">NÃ¤chster Schritt</p>
            <h2>v-model in Aktion</h2>
          </div>
          <p class="section-copy">
            Alles, was du hier eintippst, landet direkt im Vue-State und kann
            als neue Karte gerendert werden.
          </p>
        </div>

        <form class="composer-form" @submit.prevent="addLesson">
          <label class="field">
            <span class="field-label">Art</span>
            <select v-model="draftLesson.kind" class="field-control">
              <option>Praxis</option>
              <option>State</option>
              <option>Komponente</option>
              <option>VerstÃ¤ndnis</option>
            </select>
          </label>

          <label class="field">
            <span class="field-label">Titel</span>
            <input
              v-model="draftLesson.title"
              class="field-control"
              type="text"
              placeholder="z. B. v-model auf Inputs verstehen"
            />
          </label>

          <label class="field field-wide">
            <span class="field-label">Kurzbeschreibung</span>
            <textarea
              v-model="draftLesson.summary"
              class="field-control field-textarea"
              rows="3"
              placeholder="Was soll diese neue Karte Ã¼ben oder erklÃ¤ren?"
            ></textarea>
          </label>

          <label class="field field-wide">
            <span class="field-label">Tags</span>
            <input
              v-model="draftLesson.tags"
              class="field-control"
              type="text"
              placeholder="z. B. v-model, Forms, Input"
            />
          </label>

          <div class="composer-actions">
            <p
              class="form-feedback"
              :class="{
                'form-feedback-ready': canAddLesson,
                'form-feedback-alert': hasTriedSubmit && !canAddLesson,
              }"
            >
              {{ draftFeedback }}
            </p>
            <button class="action-btn" type="submit" :disabled="!canAddLesson">
              Karte hinzufÃ¼gen
            </button>
          </div>
        </form>
      </section>

      <div class="lesson-grid">
        <LearningCard
          v-for="lesson in lessons"
          :key="lesson.id"
          :lesson="lesson"
          @toggle-done="toggleLesson"
          @delete-lesson="deleteLesson"
          @save-lesson="updateLesson"
        />
      </div>
    </section>
  </main>
</template>

