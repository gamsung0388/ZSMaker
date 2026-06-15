<template>
  <header class="editor-toolbar">
    <div class="toolbar-title">
      <span class="panda">🐼</span>
      <div>
        <strong>지오 스케줄 에디터</strong>
        <p>템플릿 위에 바로 입력하고 저장해요</p>
      </div>
    </div>

    <div class="tool-group">
      <label for="templateSelect">템플릿</label>
      <select
        id="templateSelect"
        :value="selectedTemplate"
        @change="emit('update:selectedTemplate', $event.target.value)"
      >
        <option v-for="template in templateOptions" :key="template.value" :value="template.value">
          {{ template.label }}
        </option>
      </select>
    </div>

    <div class="tool-group range-group">
      <label for="contentFontSize">내용 크기</label>
      <input
        id="contentFontSize"
        :value="editorOptions.contentFontSize"
        type="range"
        min="16"
        max="42"
        @input="emitNumberOption('contentFontSize', $event.target.value)"
      />
      <span>{{ editorOptions.contentFontSize }}px</span>
    </div>

    <div class="tool-group range-group">
      <label for="timeFontSize">시간 크기</label>
      <input
        id="timeFontSize"
        :value="editorOptions.timeFontSize"
        type="range"
        min="14"
        max="36"
        @input="emitNumberOption('timeFontSize', $event.target.value)"
      />
      <span>{{ editorOptions.timeFontSize }}px</span>
    </div>

    <div class="tool-group">
      <label for="textColor">색상</label>
      <input
        id="textColor"
        :value="editorOptions.textColor"
        type="color"
        @input="emit('update:editorOption', 'textColor', $event.target.value)"
      />
    </div>

    <button
      type="button"
      class="tool-button"
      :class="{ active: editorOptions.bold }"
      @click="emit('toggle-option', 'bold')"
    >
      굵게
    </button>

    <div class="tool-group">
      <label for="alignSelect">정렬</label>
      <select
        id="alignSelect"
        :value="editorOptions.align"
        @change="emit('update:editorOption', 'align', $event.target.value)"
      >
        <option v-for="align in ALIGN_OPTIONS" :key="align.value" :value="align.value">
          {{ align.label }}
        </option>
      </select>
    </div>

    <button
      type="button"
      class="tool-button"
      :class="{ active: editorOptions.hideColon }"
      @click="emit('toggle-option', 'hideColon')"
    >
      : 제거
    </button>

    <button type="button" class="tool-button" @click="emit('save')">저장</button>
    <button type="button" class="tool-button" @click="emit('load')">불러오기</button>
    <button type="button" class="tool-button danger" @click="emit('reset-schedule')">내용 초기화</button>
    <button type="button" class="tool-button danger" @click="emit('reset-all')">전체 초기화</button>

    <button
      type="button"
      class="tool-button export"
      :disabled="isExporting"
      @click="emit('export', 'png')"
    >
      PNG 저장
    </button>
    <button
      type="button"
      class="tool-button export"
      :disabled="isExporting"
      @click="emit('export', 'jpeg')"
    >
      JPEG 저장
    </button>
  </header>
</template>

<script setup>
import { ALIGN_OPTIONS } from '../../constants/scheduleConfig'

defineProps({
  templateOptions: {
    type: Array,
    required: true,
  },
  selectedTemplate: {
    type: String,
    required: true,
  },
  editorOptions: {
    type: Object,
    required: true,
  },
  isExporting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:selectedTemplate',
  'update:editorOption',
  'toggle-option',
  'save',
  'load',
  'reset-schedule',
  'reset-all',
  'export',
])

function emitNumberOption(optionKey, value) {
  emit('update:editorOption', optionKey, Number(value))
}
</script>
