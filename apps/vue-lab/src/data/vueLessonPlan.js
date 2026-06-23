export const vueLessonPlan = [
  {
    id: 'props',
    kind: 'Grundlage',
    title: 'Props verstehen',
    summary:
      'Eine Komponente bekommt Daten von außen und zeigt sie nur an, statt sie selbst zu erfinden.',
    tags: ['Props', 'Parent', 'Child'],
    done: true,
  },
  {
    id: 'emits',
    kind: 'Interaktion',
    title: 'Events zurück an den Parent senden',
    summary:
      'Die Card verändert den State nicht selbst, sondern meldet dem Parent nur: Ich wurde geklickt.',
    tags: ['emit', 'Events', 'State Flow'],
    done: false,
  },
  {
    id: 'list-rendering',
    kind: 'Rendering',
    title: 'Listen mit v-for rendern',
    summary:
      'Mehrere Karten entstehen aus Datenobjekten statt aus kopiertem HTML-Markup.',
    tags: ['v-for', 'key', 'Daten'],
    done: true,
  },
  {
    id: 'reactive-state',
    kind: 'State',
    title: 'Reaktiven State im Parent halten',
    summary:
      'Der Parent besitzt die Wahrheit über den Zustand und gibt sie kontrolliert an Kinder weiter.',
    tags: ['ref', 'computed', 'Single Source'],
    done: false,
  },
]

