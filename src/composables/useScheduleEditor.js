import { computed, nextTick, reactive, ref } from 'vue'
import {
  DAY_OPTIONS,
  DEFAULT_EDITOR_OPTIONS,
  DEFAULT_TEMPLATE,
  TEMPLATE_LIST,
  TEMPLATE_MAP,
} from '../constants/scheduleConfig'
import { exportElementImage } from '../utils/exportImage'
import { createEditorOptions, createEmptyScheduleForm } from '../utils/scheduleFactory'
import {
  createStoragePayload,
  loadScheduleFromLocal,
  saveScheduleToLocal,
} from '../utils/scheduleStorage'

export function useScheduleEditor() {
  const captureArea = ref(null)
  const selectedTemplate = ref(DEFAULT_TEMPLATE)
  const isExporting = ref(false)
  const editorOptions = reactive(createEditorOptions())
  const scheduleForm = reactive(createEmptyScheduleForm())

  const templateOptions = computed(() =>
    TEMPLATE_LIST.map(({ label, value }) => ({
      label,
      value,
    })),
  )

  const currentLayout = computed(() => {
    return TEMPLATE_MAP[selectedTemplate.value]?.layout ?? TEMPLATE_MAP[DEFAULT_TEMPLATE].layout
  })

  const templateSrc = computed(() => `${import.meta.env.BASE_URL}${selectedTemplate.value}`)

  function normalizeTemplate(templateValue) {
    return TEMPLATE_MAP[templateValue] ? templateValue : DEFAULT_TEMPLATE
  }

  function getDisplayTime(value) {
    if (!value) return ''
    return editorOptions.hideColon ? value.replaceAll(':', '') : value
  }

  function updateSelectedTemplate(templateValue) {
    selectedTemplate.value = normalizeTemplate(templateValue)
  }

  function updateEditorOption(optionKey, value) {
    if (!(optionKey in DEFAULT_EDITOR_OPTIONS)) return
    editorOptions[optionKey] = value
  }

  function toggleOption(optionKey) {
    if (typeof editorOptions[optionKey] !== 'boolean') return
    editorOptions[optionKey] = !editorOptions[optionKey]
  }

  function updateDayField(dayKey, fieldKey, value) {
    if (!scheduleForm[dayKey] || !(fieldKey in scheduleForm[dayKey])) return
    scheduleForm[dayKey][fieldKey] = value
  }

  function getBaseInputStyle(index) {
    const layout = currentLayout.value

    return {
      top: `${layout.startTop + index * layout.rowGap}%`,
      height: `${layout.rowHeight}%`,
      color: editorOptions.textColor,
      fontWeight: editorOptions.bold ? '900' : '700',
    }
  }

  function getContentInputStyle(index) {
    const layout = currentLayout.value

    return {
      ...getBaseInputStyle(index),
      left: `${layout.contentLeft}%`,
      width: `${layout.contentWidth}%`,
      fontSize: `${editorOptions.contentFontSize}px`,
      textAlign: editorOptions.align,
    }
  }

  function getTimeInputStyle(index) {
    const layout = currentLayout.value

    return {
      ...getBaseInputStyle(index),
      left: `${layout.timeLeft}%`,
      width: `${layout.timeWidth}%`,
      fontSize: `${editorOptions.timeFontSize}px`,
      textAlign: 'center',
    }
  }

  function applyScheduleForm(savedForm = {}) {
    DAY_OPTIONS.forEach((day) => {
      scheduleForm[day.key].content = savedForm?.[day.key]?.content ?? ''
      scheduleForm[day.key].time = savedForm?.[day.key]?.time ?? ''
    })
  }

  function applyEditorOptions(savedOptions = {}) {
    Object.assign(editorOptions, createEditorOptions(savedOptions))
  }

  function saveToLocal() {
    saveScheduleToLocal(
      createStoragePayload({
        selectedTemplate: selectedTemplate.value,
        scheduleForm,
        editorOptions,
      }),
    )

    alert('저장했어요.')
  }

  function loadFromLocal() {
    const result = loadScheduleFromLocal()

    if (!result.ok) {
      alert(result.reason === 'empty' ? '저장된 스케줄이 없어요.' : '저장 데이터를 불러오지 못했어요.')
      return
    }

    const parsed = result.data
    updateSelectedTemplate(parsed?.selectedTemplate)

    // 예전 저장 구조 form도 같이 대응
    applyScheduleForm(parsed?.scheduleForm ?? parsed?.form)
    applyEditorOptions(parsed?.editorOptions)

    alert('불러왔어요.')
  }

  function resetSchedule() {
    const confirmed = confirm('입력한 내용을 모두 지울까요?')
    if (!confirmed) return

    applyScheduleForm()
  }

  function resetAll() {
    const confirmed = confirm('템플릿, 글자 옵션, 입력 내용을 모두 초기화할까요?')
    if (!confirmed) return

    selectedTemplate.value = DEFAULT_TEMPLATE
    applyEditorOptions()
    applyScheduleForm()
  }

  async function downloadImage(type = 'png') {
    if (isExporting.value || !captureArea.value) return

    isExporting.value = true
    await nextTick()

    try {
      await exportElementImage(captureArea.value, type)
    } finally {
      isExporting.value = false
    }
  }

  return {
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
  }
}
