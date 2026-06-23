<script setup>
import { computed, ref } from 'vue'
import LearningCard from './components/LearningCard.vue'
import { vueLessonPlan } from './data/vueLessonPlan.js'

const lessons = ref(vueLessonPlan.map((lesson) => ({ ...lesson })))

const completedCount = computed(
  () => lessons.value.filter((lesson) => lesson.done).length,
)

const nextLesson = computed(
  () => lessons.value.find((lesson) => !lesson.done) ?? null,
)

function toggleLesson(id) {
  const lesson = lessons.value.find((entry) => entry.id === id)
  if (!lesson) return
  lesson.done = !lesson.done
}
</script>

<template>
  <main class="shell">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">Vue Start</p>
        <h1>Wir denken jetzt in Komponenten statt in ganzen Seiten.</h1>
        <p class="hero-text">
          Diese kleine Oberfläche ist dein erster Vue-Spielplatz. Der Parent
          hält die Daten, die Cards bekommen Props und melden Änderungen mit
          Events zurück.
        </p>

        <div class="hero-stats">
          <article class="stat-card">
            <span class="stat-label">Fertig</span>
            <strong class="stat-value">{{ completedCount }}/{{ lessons.length }}</strong>
          </article>
          <article class="stat-card stat-card-accent">
            <span class="stat-label">Nächster Fokus</span>
            <strong class="stat-value">
              {{ nextLesson ? nextLesson.title : 'Alles erledigt' }}
            </strong>
          </article>
        </div>
      </div>

      <aside class="signal-panel">
        <p class="eyebrow signal-kicker">Warum das wichtig ist</p>
        <ul class="signal-list">
          <li>Props: Daten fließen von oben nach unten.</li>
          <li>Emits: Kinder melden Aktionen an den Parent zurück.</li>
          <li>State: Eine Quelle der Wahrheit statt verteiltem DOM-Code.</li>
        </ul>
      </aside>
    </section>

    <section class="lesson-section">
      <div class="section-head">
        <div>
          <p class="eyebrow">Lernkarten</p>
          <h2>Dein erster Vue-Ablauf</h2>
        </div>
        <p class="section-copy">
          Morgen können wir jede dieser Karten weiter ausbauen und direkt mit
          echten Vue-Mustern experimentieren.
        </p>
      </div>

      <div class="lesson-grid">
        <LearningCard
          v-for="lesson in lessons"
          :key="lesson.id"
          :lesson="lesson"
          @toggle-done="toggleLesson"
        />
      </div>
    </section>
  </main>
</template>
