import * as XLSX from 'xlsx'

// Extract links from markdown for creating hyperlinks
function extractLinks(markdown) {
  if (!markdown) return []
  const links = []
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let match
  while ((match = linkRegex.exec(markdown)) !== null) {
    links.push({ text: match[1], url: match[2] })
  }
  return links
}

// Convert markdown to plain text with formatting for Excel
function markdownToPlainText(markdown) {
  if (!markdown) return ''
  
  let text = markdown
  
  // Convert headers
  text = text.replace(/^### (.*$)/gim, '$1')
  text = text.replace(/^## (.*$)/gim, '$1')
  text = text.replace(/^# (.*$)/gim, '$1')
  
  // Convert bold
  text = text.replace(/\*\*(.*?)\*\*/g, '$1')
  text = text.replace(/__(.*?)__/g, '$1')
  
  // Convert italic
  text = text.replace(/\*(.*?)\*/g, '$1')
  text = text.replace(/_(.*?)_/g, '$1')
  
  // Convert links [text](url) to just text (hyperlinks will be added separately)
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  
  // Convert inline code
  text = text.replace(/`([^`]+)`/g, '$1')
  
  // Convert code blocks - preserve content but remove backticks
  text = text.replace(/```[\s\S]*?\n([\s\S]*?)```/g, '$1')
  
  // Convert unordered lists
  text = text.replace(/^\s*[-*+]\s+/gim, '• ')
  
  // Convert ordered lists
  text = text.replace(/^\s*\d+\.\s+/gim, (match) => {
    const num = match.match(/\d+/)[0]
    return `${num}. `
  })
  
  // Clean up extra whitespace but preserve line breaks
  text = text.replace(/\n{3,}/g, '\n\n')
  
  return text.trim()
}

export function exportCalendarToExcel(intake, slots) {
  if (!slots || slots.length === 0) {
    alert('No class slots to export')
    return
  }

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
        // Store both plain text and links for later processing
        const prelearningData = {
          text: markdownToPlainText(slot.lesson.prelearningMaterials),
          links: extractLinks(slot.lesson.prelearningMaterials)
        }
        const instructionsData = {
          text: markdownToPlainText(slot.lesson.guidedInstructions),
          links: extractLinks(slot.lesson.guidedInstructions)
        }
        const handsOnData = {
          text: markdownToPlainText(slot.lesson.handsOnActivities),
          links: extractLinks(slot.lesson.handsOnActivities)
        }

        wsData.push([
          formattedDate,
          dayOfWeek,
          timeSlotName,
          slot.lesson.title || '',
          slot.lesson.moduleName || '',
          prelearningData,
          instructionsData,
          handsOnData
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

  // Create worksheet with special handling for data objects
  const processedData = wsData.map(row => 
    row.map(cell => {
      if (cell && typeof cell === 'object' && cell.text !== undefined) {
        return cell.text
      }
      return cell
    })
  )
  
  const ws = XLSX.utils.aoa_to_sheet(processedData)

  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // Date
    { wch: 12 },  // Day
    { wch: 12 },  // Time Slot
    { wch: 30 },  // Lesson Title
    { wch: 20 },  // Module
    { wch: 60 },  // Pre-learning
    { wch: 60 },  // Guided Instructions
    { wch: 60 }   // Hands-On
  ]
  
  // Process cells for hyperlinks and text wrapping
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cellAddress]) continue
      
      // Set text wrapping for all cells
      if (!ws[cellAddress].s) ws[cellAddress].s = {}
      ws[cellAddress].s.alignment = { wrapText: true, vertical: 'top' }
      
      // Add hyperlinks for content columns (5, 6, 7 = Pre-learning, Instructions, Hands-On)
      if (R > 0 && C >= 5 && C <= 7) {
        const dataCell = wsData[R][C]
        if (dataCell && dataCell.links && dataCell.links.length > 0) {
          // Add first link as hyperlink (Excel limitation: one hyperlink per cell)
          const firstLink = dataCell.links[0]
          ws[cellAddress].l = { Target: firstLink.url, Tooltip: firstLink.text }
        }
      }
    }
  }

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Calendar')

  // Generate filename
  const filename = `${intake.name.replace(/[^a-z0-9]/gi, '_')}_Calendar.xlsx`

  // Download file
  XLSX.writeFile(wb, filename)
}
