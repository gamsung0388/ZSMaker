<template>
  <main class="preview-wrap">
    <section ref="captureAreaRef" class="schedule-canvas" :class="{ exporting: isExporting }">
      <img
        class="schedule-template"
        :src="templateSrc"
        alt="지오 주간 스케줄표 템플릿"
        draggable="false"
      />

      <template v-for="(day, index) in days" :key="day.key">
        <textarea
          :value="scheduleForm[day.key].content"
          class="schedule-input content-input"
          :style="getContentInputStyle(index)"
          :aria-label="`${day.label}요일 방송 내용`"
          :placeholder="isExporting ? '' : `${day.label}요일 방송 내용`"
          @input="emit('update-day-field', day.key, 'content', $event.target.value)"
        />

        <div
          v-if="isExporting && scheduleForm[day.key].content"
          class="schedule-input content-export-text"
          :style="getContentInputStyle(index)"
        >
          {{ scheduleForm[day.key].content }}
        </div>

        <input
          :value="scheduleForm[day.key].time"
          class="schedule-input time-input"
          :style="getTimeInputStyle(index)"
          :aria-label="`${day.label}요일 방송 시간`"
          :placeholder="isExporting ? '' : '20:00'"
          @input="emit('update-day-field', day.key, 'time', $event.target.value)"
        />

        <div
          v-if="isExporting && scheduleForm[day.key].time"
          class="schedule-input time-export-text"
          :style="getTimeInputStyle(index)"
        >
          {{ getDisplayTime(scheduleForm[day.key].time) }}
        </div>
      </template>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

defineProps({
  days: {
    type: Array,
    required: true,
  },
  templateSrc: {
    type: String,
    required: true,
  },
  scheduleForm: {
    type: Object,
    required: true,
  },
  isExporting: {
    type: Boolean,
    default: false,
  },
  getDisplayTime: {
    type: Function,
    required: true,
  },
  getContentInputStyle: {
    type: Function,
    required: true,
  },
  getTimeInputStyle: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:captureArea', 'update-day-field'])
const captureAreaRef = ref(null)

onMounted(() => {
  emit('update:captureArea', captureAreaRef.value)
})

watch(captureAreaRef, (element) => {
  emit('update:captureArea', element)
})
</script>
