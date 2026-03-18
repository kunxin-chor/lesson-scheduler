export function generateClassSlots(startDate, classSlotPatterns, exceptions, numberOfWeeks = 52, numberOfLessons = null, endDate = null, lessonPlan = null, dayGapBetweenModules = 0) {
  console.log('🎯 generateClassSlots called with:', {
    startDate,
    classSlotPatterns,
    exceptions,
    numberOfWeeks,
    numberOfLessons,
    endDate,
    lessonPlan: lessonPlan ? lessonPlan.name : 'none',
    dayGapBetweenModules
  })
  
  const slots = []
  const startDateObj = new Date(startDate)
  
  // Flatten all lessons from all modules if lessonPlan is provided
  // Also track module boundaries for gap insertion
  let allLessons = []
  let moduleBoundaries = [] // Array of lesson indices where modules end
  
  if (lessonPlan) {
    if (lessonPlan.lessons && Array.isArray(lessonPlan.lessons)) {
      // Flat lessons array (from backend transformation)
      // Sort modules first, then group lessons by module
      if (lessonPlan.modules) {
        const sortedModules = [...lessonPlan.modules].sort((a, b) => a.order - b.order)
        sortedModules.forEach(module => {
          const moduleLessons = lessonPlan.lessons
            .filter(l => l.moduleId === module.id)
            .sort((a, b) => a.order - b.order)
            .map(lesson => ({
              ...lesson,
              moduleName: module.name
            }))
          
          allLessons = allLessons.concat(moduleLessons)
          
          // Mark the end of this module
          if (allLessons.length < (numberOfLessons || Infinity)) {
            moduleBoundaries.push(allLessons.length)
          }
        })
      } else {
        // No modules, just use lessons as-is
        allLessons = [...lessonPlan.lessons].sort((a, b) => a.order - b.order)
      }
    } else if (lessonPlan.modules) {
      // Nested in modules - sort modules first
      const sortedModules = [...lessonPlan.modules].sort((a, b) => a.order - b.order)
      sortedModules.forEach(module => {
        if (module.lessons) {
          const moduleLessons = [...module.lessons]
            .sort((a, b) => a.order - b.order)
            .map(lesson => ({
              ...lesson,
              moduleName: module.name,
              moduleId: module.id
            }))
          allLessons = allLessons.concat(moduleLessons)
          
          // Mark the end of this module
          if (allLessons.length < (numberOfLessons || Infinity)) {
            moduleBoundaries.push(allLessons.length)
          }
        }
      })
    }
  }
  
  console.log('🎯 Module boundaries at lesson indices:', moduleBoundaries)
  console.log('🎯 Lesson order:', allLessons.map(l => `${l.moduleId}-${l.title}`))
  
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
  let lastModuleBoundaryIndex = -1
  
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
      
      let moduleGapApplied = false
      
      for (const pattern of matchingPatterns) {
        // Check limit before adding each slot
        if (numberOfLessons && slots.length >= numberOfLessons) {
          break
        }
        
        const frequency = pattern.frequency || 1
        
        // Get the lesson for this slot index
        const lessonIndex = slots.length
        const lesson = allLessons[lessonIndex] || null
        
        if (frequency === 1) {
          slots.push({
            id: `slot-${currentDate.getTime()}-${pattern.timeSlot}`,
            date: new Date(currentDate),
            dayOfWeek: dayOfWeek,
            timeSlot: pattern.timeSlot,
            isManuallyAdded: false,
            lessonIndex: lessonIndex,
            lesson: lesson
          })
        } else if (frequency > 1) {
          const weeksSinceStart = Math.floor((currentDate - startDateObj) / (7 * 24 * 60 * 60 * 1000))
          
          if (weeksSinceStart % frequency === 0) {
            slots.push({
              id: `slot-${currentDate.getTime()}-${pattern.timeSlot}`,
              date: new Date(currentDate),
              dayOfWeek: dayOfWeek,
              timeSlot: pattern.timeSlot,
              isManuallyAdded: false,
              lessonIndex: lessonIndex,
              lesson: lesson
            })
          }
        }
        
        // After adding a slot, check if we just completed a module
        const justAddedIndex = slots.length
        const crossedBoundary = moduleBoundaries.find(
          boundary => boundary === justAddedIndex && boundary > lastModuleBoundaryIndex
        )
        
        if (crossedBoundary !== undefined && dayGapBetweenModules > 0) {
          console.log(`🎯 Completed module at lesson ${crossedBoundary}, adding ${dayGapBetweenModules} day gap`)
          currentDate.setDate(currentDate.getDate() + dayGapBetweenModules - 1)
          lastModuleBoundaryIndex = crossedBoundary
          moduleGapApplied = true
          break
        }
      }
      
      if (moduleGapApplied) {
        currentDate.setDate(currentDate.getDate() + 1)
        continue
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
