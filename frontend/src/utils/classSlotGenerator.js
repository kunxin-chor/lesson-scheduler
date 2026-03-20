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
  
  // Create a unified list of modules, lessons, and assignments sorted by order
  // Track module boundaries for gap insertion (assignments don't trigger gaps)
  let allItems = [] // Contains both lessons and assignments
  let moduleBoundaries = [] // Array of item indices where modules end
  
  if (lessonPlan) {
    // Build unified items list with modules and assignments
    const unifiedItems = []
    
    if (lessonPlan.modules) {
      lessonPlan.modules.forEach(module => {
        unifiedItems.push({ ...module, type: 'module' })
      })
    }
    
    if (lessonPlan.assignments) {
      lessonPlan.assignments.forEach(assignment => {
        unifiedItems.push({ ...assignment, type: 'assignment' })
      })
    }
    
    // Sort by order to get the correct sequence
    unifiedItems.sort((a, b) => a.order - b.order)
    
    console.log('📋 Unified items order:', unifiedItems.map(item => 
      item.type === 'module' ? `MODULE: ${item.name}` : `ASSIGNMENT: ${item.title}`
    ))
    
    // Process each item in order
    unifiedItems.forEach((item, index) => {
      if (item.type === 'module') {
        // Add all lessons from this module
        let moduleLessons = []
        
        if (lessonPlan.lessons && Array.isArray(lessonPlan.lessons)) {
          // Flat lessons array
          moduleLessons = lessonPlan.lessons
            .filter(l => l.moduleId === item.id)
            .sort((a, b) => a.order - b.order)
            .map(lesson => ({
              ...lesson,
              moduleName: item.name,
              type: 'lesson'
            }))
        } else if (item.lessons) {
          // Nested lessons
          moduleLessons = [...item.lessons]
            .sort((a, b) => a.order - b.order)
            .map(lesson => ({
              ...lesson,
              moduleName: item.name,
              moduleId: item.id,
              type: 'lesson'
            }))
        }
        
        allItems.push(...moduleLessons)
        
        // Mark the end of this module ONLY if next item is also a module (gap applies between modules)
        const nextItem = unifiedItems[index + 1]
        if (nextItem && nextItem.type === 'module' && allItems.length < (numberOfLessons || Infinity)) {
          moduleBoundaries.push(allItems.length)
          console.log(`📋 Module boundary marked at ${allItems.length} (before next module: ${nextItem.name})`)
        }
      } else if (item.type === 'assignment') {
        // Add the assignment as a single item
        console.log('📋 Adding assignment to allItems:', item.title, 'at index', allItems.length)
        allItems.push({
          ...item,
          type: 'assignment'
        })
        console.log('📋 allItems length after adding assignment:', allItems.length)
      }
    })
  }
  
  console.log('🎯 Module boundaries at item indices:', moduleBoundaries)
  console.log('🎯 allItems.length:', allItems.length)
  console.log('🎯 allItems[23]:', allItems[23])
  console.log('🎯 allItems[22]:', allItems[22])
  console.log('🎯 allItems[24]:', allItems[24])
  const itemsWithTypes = allItems.map((item, idx) => ({
    index: idx,
    type: item.type,
    title: item.title
  }))
  console.log('🎯 All items with types:', itemsWithTypes)
  
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
  let itemIndex = 0 // Track which item (lesson or assignment) we're on
  
  while (currentDate <= finalEndDate && itemIndex < allItems.length) {
    // Stop if we've reached the numberOfLessons limit
    if (numberOfLessons && slots.length >= numberOfLessons) {
      console.log(`⚠️ Stopping: slots.length (${slots.length}) >= numberOfLessons (${numberOfLessons}), itemIndex: ${itemIndex}`)
      break
    }
    
    const currentItem = allItems[itemIndex]
    
    if (itemIndex === 23) {
      console.log(`🔍 At itemIndex 23, currentItem:`, currentItem)
      console.log(`🔍 currentItem.type:`, currentItem?.type)
      console.log(`🔍 slots.length:`, slots.length)
    }
    
    // Handle assignments differently - they span multiple days and ignore weekends/exceptions
    if (currentItem && currentItem.type === 'assignment') {
      console.log(`📋 Processing assignment: ${currentItem.title} (${currentItem.durationDays} days)`)
      
      // Skip to next working day (ignore weekends and exceptions)
      while (true) {
        const dayOfWeek = currentDate.getDay()
        const dateString = currentDate.toDateString()
        
        // Break if we found a working day
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !exceptionDates.has(dateString)) {
          break
        }
        
        // Skip this day
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      // Assignment starts on the next working day
      const assignmentStartDate = new Date(currentDate)
      
      // Calculate end date by counting working days (skip weekends and exceptions)
      let daysRemaining = currentItem.durationDays
      let assignmentEndDate = new Date(assignmentStartDate)
      
      // Count forward working days only
      while (daysRemaining > 0) {
        const dayOfWeek = assignmentEndDate.getDay()
        const dateString = assignmentEndDate.toDateString()
        
        // Count this day if it's not a weekend and not an exception
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !exceptionDates.has(dateString)) {
          daysRemaining--
          if (daysRemaining === 0) break // Found the last working day
        }
        
        // Move to next day
        assignmentEndDate.setDate(assignmentEndDate.getDate() + 1)
      }
      
      slots.push({
        id: `slot-assignment-${assignmentStartDate.getTime()}-${currentItem.id}`,
        date: new Date(assignmentStartDate),
        endDate: new Date(assignmentEndDate),
        dayOfWeek: assignmentStartDate.getDay(),
        timeSlot: 'Assignment',
        isManuallyAdded: false,
        itemIndex: itemIndex,
        item: currentItem,
        type: 'assignment',
        durationDays: currentItem.durationDays
      })
      
      // Move to next item and advance currentDate to day after assignment ends
      itemIndex++
      currentDate = new Date(assignmentEndDate)
      currentDate.setDate(currentDate.getDate() + 1)
      continue
    }
    
    // Check if we just completed a module (only apply gap before next MODULE, not assignments)
    const crossedBoundary = moduleBoundaries.find(
      boundary => boundary === itemIndex && boundary > lastModuleBoundaryIndex
    )
    
    if (crossedBoundary !== undefined && dayGapBetweenModules > 0) {
      console.log(`🎯 Completed module at item ${crossedBoundary}, adding ${dayGapBetweenModules} day gap before next module`)
      currentDate.setDate(currentDate.getDate() + dayGapBetweenModules)
      lastModuleBoundaryIndex = crossedBoundary
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
        
        // Check if we still have items to process
        if (itemIndex >= allItems.length) {
          break
        }
        
        const item = allItems[itemIndex]
        
        // Skip if current item is an assignment (assignments are handled separately)
        if (item && item.type === 'assignment') {
          break
        }
        
        const frequency = pattern.frequency || 1
        
        if (frequency === 1) {
          slots.push({
            id: `slot-${currentDate.getTime()}-${pattern.timeSlot}`,
            date: new Date(currentDate),
            dayOfWeek: dayOfWeek,
            timeSlot: pattern.timeSlot,
            isManuallyAdded: false,
            itemIndex: itemIndex,
            item: item,
            type: 'lesson',
            // Legacy fields for backward compatibility
            lessonIndex: itemIndex,
            lesson: item
          })
          itemIndex++
        } else if (frequency > 1) {
          const weeksSinceStart = Math.floor((currentDate - startDateObj) / (7 * 24 * 60 * 60 * 1000))
          
          if (weeksSinceStart % frequency === 0) {
            slots.push({
              id: `slot-${currentDate.getTime()}-${pattern.timeSlot}`,
              date: new Date(currentDate),
              dayOfWeek: dayOfWeek,
              timeSlot: pattern.timeSlot,
              isManuallyAdded: false,
              itemIndex: itemIndex,
              item: item,
              type: 'lesson',
              // Legacy fields for backward compatibility
              lessonIndex: itemIndex,
              lesson: item
            })
            itemIndex++
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
