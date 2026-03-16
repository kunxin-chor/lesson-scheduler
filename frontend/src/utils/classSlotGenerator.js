export function generateClassSlots(startDate, classSlotPatterns, exceptions, numberOfWeeks = 52, numberOfLessons = null, endDate = null) {
  console.log('🎯 generateClassSlots called with:', {
    startDate,
    classSlotPatterns,
    exceptions,
    numberOfWeeks,
    numberOfLessons,
    endDate
  })
  
  const slots = []
  const startDateObj = new Date(startDate)
  
  // Convert exceptions to date strings, handling ISO dates properly to avoid timezone issues
  const exceptionDates = new Set(exceptions.map(d => {
    // Parse ISO date string (YYYY-MM-DD) directly without timezone conversion
    const [year, month, day] = d.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toDateString()
  }))
  
  console.log('🎯 Exception dates converted:', Array.from(exceptionDates))
  
  // Determine the end date based on parameters
  let finalEndDate
  if (endDate) {
    finalEndDate = new Date(endDate)
  } else {
    finalEndDate = new Date(startDateObj)
    finalEndDate.setDate(finalEndDate.getDate() + (numberOfWeeks * 7))
  }
  
  console.log('🎯 Generation config:', {
    finalEndDate,
    numberOfLessons,
    willStopAtLessonCount: !!numberOfLessons
  })
  
  let currentDate = new Date(startDateObj)
  
  while (currentDate <= finalEndDate) {
    // Stop if we've reached the numberOfLessons limit
    if (numberOfLessons && slots.length >= numberOfLessons) {
      break
    }
    
    const dayOfWeek = currentDate.getDay()
    const dateString = currentDate.toDateString()
    
    if (exceptionDates.has(dateString)) {
      console.log('🚫 Skipping exception date:', dateString)
    }
    
    if (!exceptionDates.has(dateString)) {
      const matchingPatterns = classSlotPatterns.filter(p => p.dayOfWeek === dayOfWeek)
      
      for (const pattern of matchingPatterns) {
        // Check limit before adding each slot
        if (numberOfLessons && slots.length >= numberOfLessons) {
          break
        }
        
        const frequency = pattern.frequency || 1
        
        if (frequency === 1) {
          slots.push({
            id: `slot-${currentDate.getTime()}-${pattern.timeSlot}`,
            date: new Date(currentDate),
            dayOfWeek: dayOfWeek,
            timeSlot: pattern.timeSlot,
            isManuallyAdded: false
          })
        } else if (frequency > 1) {
          const weeksSinceStart = Math.floor((currentDate - startDateObj) / (7 * 24 * 60 * 60 * 1000))
          
          if (weeksSinceStart % frequency === 0) {
            slots.push({
              id: `slot-${currentDate.getTime()}-${pattern.timeSlot}`,
              date: new Date(currentDate),
              dayOfWeek: dayOfWeek,
              timeSlot: pattern.timeSlot,
              isManuallyAdded: false
            })
          }
        }
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return slots
}

export function regenerateClassSlots(intake, numberOfWeeks = 52) {
  return generateClassSlots(
    intake.startDate,
    intake.classSlotPatterns,
    intake.exceptions,
    numberOfWeeks
  )
}

export function addManualSlot(existingSlots, date, timeSlot) {
  const newSlot = {
    id: `slot-${new Date(date).getTime()}-${timeSlot}-manual`,
    date: new Date(date),
    dayOfWeek: new Date(date).getDay(),
    timeSlot: timeSlot,
    isManuallyAdded: true
  }
  
  const duplicate = existingSlots.find(
    s => s.date.toDateString() === newSlot.date.toDateString() && s.timeSlot === timeSlot
  )
  
  if (duplicate) {
    return existingSlots
  }
  
  return [...existingSlots, newSlot].sort((a, b) => a.date - b.date)
}

export function deleteSlot(existingSlots, slotId) {
  return existingSlots.filter(s => s.id !== slotId)
}
