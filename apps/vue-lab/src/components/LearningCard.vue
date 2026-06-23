<script setup>
defineProps({
  lesson: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle-done'])
</script>

<template>
  <article class="lesson-card" :class="{ 'lesson-card-done': lesson.done }">
    <div class="lesson-card-head">
      <p class="eyebrow">{{ lesson.kind }}</p>
      <span class="lesson-state">{{ lesson.done ? 'Erledigt' : 'Offen' }}</span>
    </div>

    <h3>{{ lesson.title }}</h3>
    <p class="lesson-copy">{{ lesson.summary }}</p>

    <ul class="tag-list">
      <li v-for="tag in lesson.tags" :key="tag" class="tag">
        {{ tag }}
      </li>
    </ul>

    <div class="lesson-card-actions">
      <button class="action-btn" type="button" @click="emit('toggle-done', lesson.id)">
        {{ lesson.done ? 'Wieder öffnen' : 'Als fertig markieren' }}
      </button>
    </div>
  </article>
</template>
