<script setup>
import { computed, reactive, ref, watch } from 'vue'

const props = defineProps({
  lesson: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle-done', 'delete-lesson', 'save-lesson'])
const isEditing = ref(false)
const form = reactive({
  kind: '',
  title: '',
  summary: '',
  tags: '',
})

const previewTags = computed(() =>
  form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean),
)

function syncForm() {
  form.kind = props.lesson.kind
  form.title = props.lesson.title
  form.summary = props.lesson.summary
  form.tags = props.lesson.tags.join(', ')
}

function startEditing() {
  syncForm()
  isEditing.value = true
}

function cancelEditing() {
  syncForm()
  isEditing.value = false
}

function saveLesson() {
  const title = form.title.trim()
  const summary = form.summary.trim()
  const tags = previewTags.value

  if (!title || !summary || tags.length === 0) return

  emit('save-lesson', {
    id: props.lesson.id,
    kind: form.kind,
    title,
    summary,
    tags,
  })

  isEditing.value = false
}

watch(
  () => props.lesson,
  () => {
    if (!isEditing.value) {
      syncForm()
    }
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <article class="lesson-card" :class="{ 'lesson-card-done': props.lesson.done }">
    <div class="lesson-card-head">
      <p class="eyebrow">{{ props.lesson.kind }}</p>
      <span class="lesson-state">{{ props.lesson.done ? 'Erledigt' : 'Offen' }}</span>
    </div>

    <template v-if="isEditing">
      <div class="edit-grid">
        <label class="field">
          <span class="field-label">Art</span>
          <select v-model="form.kind" class="field-control">
            <option>Praxis</option>
            <option>State</option>
            <option>Komponente</option>
            <option>Verständnis</option>
          </select>
        </label>

        <label class="field field-wide">
          <span class="field-label">Titel</span>
          <input
            v-model="form.title"
            class="field-control"
            type="text"
            placeholder="Titel der Lernkarte"
          />
        </label>

        <label class="field field-wide">
          <span class="field-label">Kurzbeschreibung</span>
          <textarea
            v-model="form.summary"
            class="field-control field-textarea lesson-edit-textarea"
            rows="3"
          ></textarea>
        </label>

        <label class="field field-wide">
          <span class="field-label">Tags</span>
          <input
            v-model="form.tags"
            class="field-control"
            type="text"
            placeholder="z. B. emits, parent, state"
          />
        </label>
      </div>
    </template>

    <template v-else>
      <h3>{{ props.lesson.title }}</h3>
      <p class="lesson-copy">{{ props.lesson.summary }}</p>
    </template>

    <ul class="tag-list">
      <li
        v-for="tag in isEditing ? previewTags : props.lesson.tags"
        :key="`${props.lesson.id}-${tag}`"
        class="tag"
      >
        {{ tag }}
      </li>
    </ul>

    <div class="lesson-card-actions">
      <button
        v-if="!isEditing"
        class="action-btn"
        type="button"
        @click="emit('toggle-done', props.lesson.id)"
      >
        {{ props.lesson.done ? 'Wieder öffnen' : 'Als fertig markieren' }}
      </button>
      <button
        v-if="!isEditing"
        class="action-btn action-btn-muted"
        type="button"
        @click="startEditing"
      >
        Bearbeiten
      </button>
      <button
        v-if="!isEditing"
        class="action-btn action-btn-danger"
        type="button"
        @click="emit('delete-lesson', props.lesson.id)"
      >
        Löschen
      </button>

      <button
        v-if="isEditing"
        class="action-btn"
        type="button"
        @click="saveLesson"
      >
        Speichern
      </button>
      <button
        v-if="isEditing"
        class="action-btn action-btn-muted"
        type="button"
        @click="cancelEditing"
      >
        Abbrechen
      </button>
    </div>
  </article>
</template>

