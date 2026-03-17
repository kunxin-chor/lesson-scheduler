export function generateCalendarMarkdown(intake, slots) {
  if (!slots || slots.length === 0) {
    return '# No class slots found'
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

  let markdown = `# ${intake.name}\n\n`

  sortedDates.forEach(dateKey => {
    const date = new Date(dateKey)
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    markdown += `# ${formattedDate}\n\n`

    // Sort slots by time slot (morning, afternoon, evening)
    const timeSlotOrder = { morning: 0, afternoon: 1, evening: 2 }
    const sortedSlots = slotsByDate[dateKey].sort((a, b) => {
      return timeSlotOrder[a.timeSlot] - timeSlotOrder[b.timeSlot]
    })

    sortedSlots.forEach(slot => {
      if (slot.lesson) {
        markdown += `## ${slot.lesson.title}\n\n`

        if (slot.lesson.moduleName) {
          markdown += `**Module:** ${slot.lesson.moduleName}\n\n`
        }

        if (slot.lesson.prelearningMaterials) {
          markdown += `### Pre-learning Materials\n\n`
          markdown += `${slot.lesson.prelearningMaterials}\n\n`
        }

        if (slot.lesson.guidedInstructions) {
          markdown += `### Guided Instructions\n\n`
          markdown += `${slot.lesson.guidedInstructions}\n\n`
        }

        if (slot.lesson.handsOnActivities) {
          markdown += `### Hands-On Activities\n\n`
          markdown += `${slot.lesson.handsOnActivities}\n\n`
        }

        markdown += `---\n\n`
      }
    })
  })

  return markdown
}
