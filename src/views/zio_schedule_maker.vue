<template>
  <div class="page">
    <header class="top-bar">
      <div>
        <h1>지오 주간 스케줄표 메이커</h1>
        <p>스케줄표 위에 직접 입력하고 PNG/JPEG로 저장할 수 있어요.</p>
      </div>

      <div class="top-actions">
        <select v-model="selectedTemplate" class="template-select">
          <option
            v-for="template in templateOptions"
            :key="template.value"
            :value="template.value"
          >
            {{ template.label }}
          </option>
        </select>
        <button type="button" class="ghost" @click="resetForm">초기화</button>
        <button type="button" @click="saveToLocal">저장</button>
        <button type="button" @click="loadFromLocal">불러오기</button>
        <button type="button" @click="downloadImage('png')">PNG 저장</button>
        <button type="button" @click="downloadImage('jpeg')">JPEG 저장</button>
      </div>
    </header>

    <main class="editor-layout">
      <section class="preview-panel">
        <div class="preview-toolbar">
          <strong>미리보기 직접 입력</strong>
          <span>내용칸과 시간칸을 클릭해서 바로 입력하면 돼요.</span>
        </div>

        <div class="preview-wrap">
          <div
            ref="captureRef"
            class="schedule-canvas"
            :class="{ exporting: isExporting }"
          >
            <img
              class="background"
              :src="backgroundSrc"
              alt="지오 주간 스케줄표 배경"
              @error="imageLoadError = true"
              @load="imageLoadError = false"
            />

            <div v-if="imageLoadError" class="image-warning">
              배경 이미지를 찾지 못했어요.<br />
              public/images/zio-schedule-template.png 경로를 확인해 주세요.
            </div>

            <template v-for="(day, index) in days" :key="day.key">
              <input
                v-model="form[day.key].content"
                class="preview-input content-input"
                :style="contentStyle(index)"
                type="text"
                :placeholder="`${day.ko} 방송 내용`"
              />

              <input
                v-model="form[day.key].time"
                class="preview-input time-input"
                :style="timeStyle(index)"
                type="text"
                placeholder="20:00"
              />

              <div
                class="export-text export-content"
                :style="contentStyle(index)"
              >
                {{ form[day.key].content }}
              </div>

              <div
                class="export-text export-time"
                :style="timeStyle(index)"
              >
                {{ form[day.key].time }}
              </div>
            </template>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import html2canvas from 'html2canvas'

const captureRef = ref(null)
const imageLoadError = ref(false)
const isExporting = ref(false)

const templateOptions = [
  { label: '기본 템플릿', value: 'zio-schedule-template.png' },
  { label: '템플릿 2', value: 'zio-schedule-template2.png' },
  { label: '템플릿 3', value: 'zio-schedule-template3.png' },
]

const selectedTemplate = ref('zio-schedule-template.png')

const backgroundSrc = computed(() => {
  return `${import.meta.env.BASE_URL}images/${selectedTemplate.value}`
})

const days = [
  { key: 'mon', ko: '월', en: 'MON' },
  { key: 'tue', ko: '화', en: 'TUE' },
  { key: 'wed', ko: '수', en: 'WED' },
  { key: 'thu', ko: '목', en: 'THU' },
  { key: 'fri', ko: '금', en: 'FRI' },
  { key: 'sat', ko: '토', en: 'SAT' },
  { key: 'sun', ko: '일', en: 'SUN' },
]

const emptyForm = () => ({
  mon: { content: '', time: '' },
  tue: { content: '', time: '' },
  wed: { content: '', time: '' },
  thu: { content: '', time: '' },
  fri: { content: '', time: '' },
  sat: { content: '', time: '' },
  sun: { content: '', time: '' },
})

const form = reactive(emptyForm())

/**
 * 좌표는 이미지 전체 기준 %.
 * 배경 이미지가 16:9라면 미리보기 크기가 변해도 위치가 유지됩니다.
 *
 * 현재 템플릿 기준:
 * - 왼쪽 긴 칸: 방송 내용
 * - 오른쪽 작은 칸: 시작 시간
 */
const rowLayout = {
  startTop: 20.5,
  rowGap: 9.3,

  contentLeft: 19.0,
  contentWidth: 47.0,

  timeLeft: 68.4,
  timeWidth: 12.0,
}

const contentStyle = (index) => ({
  left: `${rowLayout.contentLeft}%`,
  top: `${rowLayout.startTop + index * rowLayout.rowGap}%`,
  width: `${rowLayout.contentWidth}%`,
})

const timeStyle = (index) => ({
  left: `${rowLayout.timeLeft}%`,
  top: `${rowLayout.startTop + index * rowLayout.rowGap}%`,
  width: `${rowLayout.timeWidth}%`,
})

const resetForm = () => {
  days.forEach((day) => {
    form[day.key].content = ''
    form[day.key].time = ''
  })
}

const saveToLocal = () => {
  const data = {
    selectedTemplate: selectedTemplate.value,
    form: days.reduce((acc, day) => {
      acc[day.key] = {
        content: form[day.key].content,
        time: form[day.key].time,
      }
      return acc
    }, {}),
  }

  localStorage.setItem('zio-weekly-schedule', JSON.stringify(data))
  alert('저장했어요.')
}

const loadFromLocal = () => {
  const saved = localStorage.getItem('zio-weekly-schedule')

  if (!saved) {
    alert('저장된 스케줄이 없어요.')
    return
  }

  try {
    const parsed = JSON.parse(saved)

    days.forEach((day) => {
      form[day.key].content = parsed?.[day.key]?.content ?? ''
      form[day.key].time = parsed?.[day.key]?.time ?? ''
    })

    alert('불러왔어요.')
  } catch (error) {
    alert('저장 데이터를 불러오지 못했어요.')
  }
}

const waitFrame = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })

const downloadImage = async (type) => {
  if (!captureRef.value) return

  try {
    isExporting.value = true
    await waitFrame()

    const canvas = await html2canvas(captureRef.value, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
    })

    const mimeType = type === 'jpeg' ? 'image/jpeg' : 'image/png'
    const fileName =
      type === 'jpeg'
        ? 'zio-weekly-schedule.jpg'
        : 'zio-weekly-schedule.png'

    const quality = type === 'jpeg' ? 0.95 : 1

    const link = document.createElement('a')
    link.download = fileName
    link.href = canvas.toDataURL(mimeType, quality)
    link.click()
  } finally {
    isExporting.value = false
  }
}
</script>

<style scoped>
.page {
  height: 100vh;
  min-height: 100vh;
  padding: 12px 16px;
  background: #eff7ea;
  color: #24331f;
  font-family: 'Pretendard', 'Noto Sans KR', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  width: 100%;
  flex: 0 0 auto;
}

.top-bar h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
}

.top-bar p {
  margin: 4px 0 0;
  color: #6c7d63;
  font-size: 14px;
}

.top-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

button {
  border: 0;
  border-radius: 999px;
  padding: 8px 14px;
  background: #5f944d;
  color: white;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(69, 112, 50, 0.18);
}

button:hover {
  filter: brightness(0.96);
}

button.ghost {
  background: white;
  color: #47723b;
  border: 1px solid #b8d6aa;
}

.editor-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
}

.preview-panel {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid #cfe3c4;
  border-radius: 24px;
  padding: 12px;
  box-shadow: 0 12px 30px rgba(69, 112, 50, 0.12);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex: 0 0 auto;
}

.preview-toolbar strong {
  font-size: 15px;
  font-weight: 900;
}

.preview-toolbar span {
  color: #6c7d63;
  font-size: 13px;
}

.preview-wrap {
  flex: 1;
  min-height: 0;
  border-radius: 18px;
  background: #dfeeda;
  padding: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 핵심 */
.schedule-canvas {
  position: relative;
  aspect-ratio: 16 / 9;

  /* 화면 안에 무조건 들어오게 */
  width: min(100%, calc((100vh - 180px) * 16 / 9));
  max-width: 100%;
  max-height: 100%;

  overflow: hidden;
  border-radius: 12px;
  background: white;
  margin: 0 auto;
}

.background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
}

.image-warning {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.9);
  color: #315225;
  font-weight: 900;
  line-height: 1.7;
}

.preview-input {
  position: absolute;
  z-index: 3;
  height: 6.2%;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #26351f;
  outline: none;
  font-family: 'Pretendard', 'Noto Sans KR', system-ui, sans-serif;
  line-height: 1;
}

.preview-input:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(95, 148, 77, 0.25);
}

.preview-input:focus {
  background: rgba(255, 255, 255, 0.62);
  border-color: #5f944d;
  box-shadow: 0 0 0 3px rgba(95, 148, 77, 0.16);
}

.preview-input::placeholder {
  color: rgba(71, 114, 59, 0.35);
}

.content-input {
  padding: 0 1.4%;
  font-size: clamp(12px, 1.45vw, 24px);
  font-weight: 900;
  text-align: left;
}

.time-input {
  padding: 0 0.3%;
  font-size: clamp(12px, 1.45vw, 24px);
  font-weight: 900;
  text-align: center;
  color: #4f7f43;
  font-variant-numeric: tabular-nums;
}

.schedule-canvas.exporting .preview-input {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  outline: none;
}

.schedule-canvas.exporting .preview-input::placeholder {
  color: transparent;
}

.export-text {
  position: absolute;
  z-index: 4;
  height: 6.2%;
  display: none;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  color: #26351f;
  line-height: 1;
  pointer-events: none;
}

.export-content {
  padding: 0 1.4%;
  font-size: clamp(12px, 1.45vw, 24px);
  font-weight: 900;
  text-align: left;
}

.export-time {
  padding: 0 0.3%;
  justify-content: center;
  font-size: clamp(12px, 1.45vw, 24px);
  font-weight: 900;
  text-align: center;
  color: #4f7f43;
  font-variant-numeric: tabular-nums;
}

.schedule-canvas.exporting .preview-input {
  display: none;
}

.schedule-canvas.exporting .export-text {
  display: flex;
}

.template-select {
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #b8d6aa;
  background: white;
  color: #47723b;
  font-weight: 800;
  outline: none;
  cursor: pointer;
}

.template-select:focus {
  border-color: #5f944d;
  box-shadow: 0 0 0 3px rgba(95, 148, 77, 0.15);
}

@media (max-width: 900px) {
  .page {
    padding: 10px;
  }

  .top-bar {
    flex-direction: column;
    margin-bottom: 8px;
  }

  .top-actions {
    justify-content: flex-start;
  }

  .preview-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .schedule-canvas {
    width: 100%;
  }
}
</style>