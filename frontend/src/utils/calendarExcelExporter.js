import * as XLSX from 'xlsx'
import { marked } from 'marked'

export function exportCalendarToExcel(intake, slots) {
  if (!slots || slots.length === 0) {
    alert('No class slots to export')
    return
  }

  // Configure marked to output clean HTML
  marked.setOptions({
    breaks: true,
    gfm: true
  })

  // Group slots by date
  const slotsByDate = {}
  slots.forEach(slot => {
    const dateKey = new Date(slot.date).toDateString()
    if (!slotsByDate[dateKey]) {
      slotsByDate[dateKey] = []
    }
    slotsByDate[dateKey].push(slot)
  })

  // Sort dates
  const sortedDates = Object.keys(slotsByDate).sort((a, b) => {
    return new Date(a) - new Date(b)
  })

  // Create worksheet data
  const wsData = []
  
  // Add header row
  wsData.push([
    'Date',
    'Day',
    'Time Slot',
    'Lesson Title',
    'Module',
    'Pre-learning Materials',
    'Guided Instructions',
    'Hands-On Activities'
  ])

  // Add data rows
  sortedDates.forEach(dateKey => {
    const date = new Date(dateKey)
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })

    // Sort slots by time slot
    const timeSlotOrder = { morning: 0, afternoon: 1, evening: 2 }
    const sortedSlots = slotsByDate[dateKey].sort((a, b) => {
      return timeSlotOrder[a.timeSlot] - timeSlotOrder[b.timeSlot]
    })

    sortedSlots.forEach(slot => {
      const timeSlotName = slot.timeSlot.charAt(0).toUpperCase() + slot.timeSlot.slice(1)
      
      if (slot.lesson) {
        // Convert markdown to HTML
        const prelearningHTML = slot.lesson.prelearningMaterials 
          ? marked.parse(slot.lesson.prelearningMaterials)
          : ''
        const instructionsHTML = slot.lesson.guidedInstructions
          ? marked.parse(slot.lesson.guidedInstructions)
          : ''
        const handsOnHTML = slot.lesson.handsOnActivities
          ? marked.parse(slot.lesson.handsOnActivities)
          : ''

        wsData.push([
          formattedDate,
          dayOfWeek,
          timeSlotName,
          slot.lesson.title || '',
          slot.lesson.moduleName || '',
          prelearningHTML,
          instructionsHTML,
          handsOnHTML
        ])
      } else {
        wsData.push([
          formattedDate,
          dayOfWeek,
          timeSlotName,
          'No lesson assigned',
          '',
          '',
          '',
          ''
        ])
      }
    })
  })

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // Date
    { wch: 12 },  // Day
    { wch: 12 },  // Time Slot
    { wch: 30 },  // Lesson Title
    { wch: 20 },  // Module
    { wch: 50 },  // Pre-learning
    { wch: 50 },  // Guided Instructions
    { wch: 50 }   // Hands-On
  ]

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Calendar')

  // Generate filename
  const filename = `${intake.name.replace(/[^a-z0-9]/gi, '_')}_Calendar.xlsx`

  // Download file
  XLSX.writeFile(wb, filename)
}
