import { SAVE_VERSION, STORAGE_KEY } from '../constants/scheduleConfig'
import { cloneData } from './object'

export function createStoragePayload({ selectedTemplate, scheduleForm, editorOptions }) {
  return {
    version: SAVE_VERSION,
    selectedTemplate,
    scheduleForm: cloneData(scheduleForm),
    editorOptions: cloneData(editorOptions),
  }
}

export function saveScheduleToLocal(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function loadScheduleFromLocal() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return {
      ok: false,
      reason: 'empty',
      data: null,
    }
  }

  try {
    return {
      ok: true,
      reason: '',
      data: JSON.parse(saved),
    }
  } catch (error) {
    return {
      ok: false,
      reason: 'parse',
      data: null,
    }
  }
}
