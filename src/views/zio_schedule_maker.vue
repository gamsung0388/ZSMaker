<template>
  <div class="zio-editor-page">
    <ZioEditorToolbar
      :template-options="templateOptions"
      :selected-template="selectedTemplate"
      :editor-options="editorOptions"
      :is-exporting="isExporting"
      @update:selected-template="updateSelectedTemplate"
      @update:editor-option="updateEditorOption"
      @toggle-option="toggleOption"
      @save="saveToLocal"
      @load="loadFromLocal"
      @reset-schedule="resetSchedule"
      @reset-all="resetAll"
      @export="downloadImage"
    />

    <ZioScheduleCanvas
      :days="DAY_OPTIONS"
      :template-src="templateSrc"
      :schedule-form="scheduleForm"
      :is-exporting="isExporting"
      :get-display-time="getDisplayTime"
      :get-content-input-style="getContentInputStyle"
      :get-time-input-style="getTimeInputStyle"
      @update:capture-area="setCaptureArea"
      @update-day-field="updateDayField"
    />
  </div>
</template>

<script setup>
import ZioEditorToolbar from '../components/schedule/ZioEditorToolbar.vue'
import ZioScheduleCanvas from '../components/schedule/ZioScheduleCanvas.vue'
import { useScheduleEditor } from '../composables/useScheduleEditor'

const {
  DAY_OPTIONS,
  captureArea,
  selectedTemplate,
  isExporting,
  editorOptions,
  scheduleForm,
  templateOptions,
  templateSrc,
  getDisplayTime,
  getContentInputStyle,
  getTimeInputStyle,
  updateSelectedTemplate,
  updateEditorOption,
  toggleOption,
  updateDayField,
  saveToLocal,
  loadFromLocal,
  resetSchedule,
  resetAll,
  downloadImage,
} = useScheduleEditor()

function setCaptureArea(element) {
  captureArea.value = element
}
</script>

<style scoped>
.zio-editor-page {
  min-height: 100vh;
  padding: 14px 0 26px;
  background:
    radial-gradient(circle at top left, rgba(162, 211, 128, 0.35), transparent 34%),
    linear-gradient(180deg, #eff8e9 0%, #fbfff8 100%);
}
</style>
