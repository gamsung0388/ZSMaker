import html2canvas from 'html2canvas'
import { EXPORT_OPTIONS } from '../constants/scheduleConfig'

export async function exportElementImage(element, type = 'png') {
  if (!element) return

  const option = EXPORT_OPTIONS[type] ?? EXPORT_OPTIONS.png
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
  })

  const link = document.createElement('a')
  link.href = canvas.toDataURL(option.mimeType, option.quality)
  link.download = `zio-weekly-schedule.${option.extension}`
  link.click()
}
