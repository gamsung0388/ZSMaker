import { DAY_OPTIONS, DEFAULT_EDITOR_OPTIONS } from '../constants/scheduleConfig'

export function createEditorOptions(options = {}) {
  return {
    ...DEFAULT_EDITOR_OPTIONS,
    ...options,
  }
}

export function createDaySchedule(daySchedule = {}) {
  return {
    content: daySchedule?.content ?? '',
    time: daySchedule?.time ?? '',
  }
}

export function createEmptyScheduleForm() {
  return DAY_OPTIONS.reduce((form, day) => {
    form[day.key] = createDaySchedule()
    return form
  }, {})
}
