/**
 * NEW CLEAN VERSION - Uses ONLY flat lessons array
 * This ensures lesson IDs match between modal configuration and generation
 */
export function generateClassSlotsV2(startDate, classSlotPatterns, exceptions, numberOfWeeks = 52, numberOfLessons = null, endDate = null, lessonPlan = null, dayGapBetweenModules = 0, lessonSlotMap = {}) {
  console.log('🎯 generateClassSlotsV2 (CLEAN VERSION) called with:', {
    startDate,
    classSlotPatterns,
    exceptions,
    numberOfWeeks,
    numberOfLessons,
    endDate,
    lessonPlan: lessonPlan ? lessonPlan.name : 'none',
    dayGapBetweenModules,
    lessonSlotMap
  })
  
  const slots = []
  const startDateObj = new Date(startDate)
  
  // Build items list from FLAT arrays only
  let allItems = []
  let moduleBoundaries = []
  
  if (lessonPlan) {
    // Use ONLY the flat lessons array - this matches what the modal shows
    const lessons = lessonPlan.lessons || []
    const assignments = lessonPlan.assignments || []
    const modules = lessonPlan.modules || []
    
    console.log('📋 Using FLAT arrays:', {
      lessons: lessons.length,
      assignments: assignments.length,
      modules: modules.length
    })
    console.log('📋 Assignment details:', assignments.map(a => ({ title: a.title, order: a.order })))
    console.log('📋 Module orders:', modules.map(m => ({ name: m.name, order: m.order })))
    
    // Build timeline from unified order (same model as LessonBoard)
    const lessonsByModule = new Map()
    lessons.forEach((lesson) => {
      if (!lessonsByModule.has(lesson.moduleId)) {
        lessonsByModule.set(lesson.moduleId, [])
      }
      lessonsByModule.get(lesson.moduleId).push(lesson)
    })

    // Keep lesson order within each module stable
    for (const [moduleId, moduleLessons] of lessonsByModule.entries()) {
      lessonsByModule.set(
        moduleId,
        moduleLessons.sort((a, b) => (a.order || 0) - (b.order || 0))
      )
    }

    const unifiedItems = [
      ...modules.map(m => ({ ...m, type: 'module' })),
      ...assignments.map(a => ({ ...a, type: 'assignment' }))
    ].sort((a, b) => (a.order || 0) - (b.order || 0))

    let hasAddedFirstModule = false
    unifiedItems.forEach((item) => {
      if (item.type === 'module') {
        // Add gap before every module after the first module
        if (hasAddedFirstModule) {
          moduleBoundaries.push(allItems.length)
        }

        const moduleLessons = lessonsByModule.get(item.id) || []
        allItems.push(
          ...moduleLessons.map(lesson => ({
            ...lesson,
            type: 'lesson',
            moduleName: item.name
          }))
        )
        hasAddedFirstModule = true
        console.log(`📚 Module "${item.name}" (order ${item.order}): ${moduleLessons.length} lessons`)
        return
      }

      allItems.push({ ...item, type: 'assignment' })
      console.log(`📋 Assignment "${item.title}" (order ${item.order})`)
    })
    
    console.log('📋 Total items:', allItems.length)
    console.log('📋 Module boundaries:', moduleBoundaries)
    console.log('📋 First 3 item IDs:', allItems.slice(0, 3).map(i => ({ id: i.id, title: i.title })))
  }
  
  // Convert exceptions to date strings for comparison
  const exceptionDates = exceptions.map(e => new Date(e).toDateString())
  console.log('🎯 Exception dates:', exceptionDates.length)
  
  // Determine end date
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
  
  // Generate slots
  let currentDate = new Date(startDateObj)
  let lastModuleBoundaryIndex = -1
  let itemIndex = 0
  let lessonSlotRemaining = 0
  let lessonSlotNumber = 0
  let currentLessonTotalSlots = 0
  
  while (currentDate <= finalEndDate && itemIndex < allItems.length) {
    if (numberOfLessons && slots.length >= numberOfLessons) {
      break
    }
    
    const currentItem = allItems[itemIndex]
    
    // Handle assignments - they span multiple days and skip weekends/exceptions
    if (currentItem && currentItem.type === 'assignment') {
      console.log(`📋 Processing assignment: ${currentItem.title} (${currentItem.durationDays} days)`)
      
      // Skip to next working day (ignore weekends and exceptions)
      while (true) {
        const dayOfWeek = currentDate.getDay()
        const dateString = currentDate.toDateString()
        
        // Break if we found a working day
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !exceptionDates.includes(dateString)) {
          break
        }
        
        // Skip this day
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      // Assignment starts on the next working day
      const assignmentStartDate = new Date(currentDate)
      
      // Calculate end date by counting working days (skip weekends and exceptions)
      let daysRemaining = currentItem.durationDays || 1
      let assignmentEndDate = new Date(assignmentStartDate)
      
      // Count forward working days only
      while (daysRemaining > 0) {
        const dayOfWeek = assignmentEndDate.getDay()
        const dateString = assignmentEndDate.toDateString()
        
        // Count this day if it's not a weekend and not an exception
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !exceptionDates.includes(dateString)) {
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
        assignmentIndex: itemIndex,
        assignment: currentItem,
        durationDays: currentItem.durationDays || 1
      })
      
      // Move current date to day after assignment ends
      currentDate = new Date(assignmentEndDate)
      currentDate.setDate(currentDate.getDate() + 1)
      itemIndex++
      continue
    }
    
    // Check for module boundaries and add gap
    if (moduleBoundaries.includes(itemIndex) && itemIndex !== lastModuleBoundaryIndex) {
      console.log(`🎯 Completed module at item ${itemIndex}, adding ${dayGapBetweenModules} day gap`)
      currentDate.setDate(currentDate.getDate() + dayGapBetweenModules)
      lastModuleBoundaryIndex = itemIndex
    }
    
    const dayOfWeek = currentDate.getDay()
    const dateString = currentDate.toDateString()
    
    // Skip exceptions
    if (exceptionDates.includes(dateString)) {
      currentDate.setDate(currentDate.getDate() + 1)
      continue
    }
    
    // Check for matching slot patterns - process ALL patterns for this day
    for (const pattern of classSlotPatterns) {
      if (pattern.dayOfWeek === dayOfWeek) {
        const frequency = pattern.frequency || 1
        
        // Check if we still have items to process
        if (itemIndex >= allItems.length) break
        
        const item = allItems[itemIndex]
        
        // Initialize slot tracking for new lesson if needed
        if (item && item.type === 'lesson' && lessonSlotRemaining === 0) {
          const lessonId = item.id
          const configuredSlots = lessonSlotMap[lessonId]
          currentLessonTotalSlots = configuredSlots || 1
          lessonSlotRemaining = currentLessonTotalSlots
          lessonSlotNumber = 1
          console.log(`📚 ========================================`)
          console.log(`📚 Starting lesson "${item.title}"`)
          console.log(`📚 Lesson ID: ${lessonId}`)
          console.log(`📚 lessonSlotMap has this ID? ${lessonId in lessonSlotMap}`)
          console.log(`📚 Configured slots: ${configuredSlots}`)
          console.log(`📚 Will use: ${currentLessonTotalSlots} slot(s)`)
          console.log(`📚 ========================================`)
        }
        
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
            slotNumber: lessonSlotNumber,
            totalSlots: currentLessonTotalSlots,
            lessonIndex: itemIndex,
            lesson: item
          })
          
          lessonSlotRemaining--
          lessonSlotNumber++
          console.log(`  ✓ Slot ${lessonSlotNumber - 1}/${currentLessonTotalSlots} for "${item.title}", remaining: ${lessonSlotRemaining}`)
          
          if (lessonSlotRemaining <= 0) {
            console.log(`  ➡️ All slots consumed, advancing to next item`)
            itemIndex++
            lessonSlotRemaining = 0 // Reset for next lesson
          }
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
              slotNumber: lessonSlotNumber,
              totalSlots: currentLessonTotalSlots,
              lessonIndex: itemIndex,
              lesson: item
            })
            
            lessonSlotRemaining--
            lessonSlotNumber++
            console.log(`  ✓ Slot ${lessonSlotNumber - 1}/${currentLessonTotalSlots} for "${item.title}", remaining: ${lessonSlotRemaining}`)
            
            if (lessonSlotRemaining <= 0) {
              console.log(`  ➡️ All slots consumed, advancing to next item`)
              itemIndex++
            }

            break
          }
        }
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  console.log(`✅ Generated ${slots.length} total slots`)
  return slots
}

export function generateClassSlots(startDate, classSlotPatterns, exceptions, numberOfWeeks = 52, numberOfLessons = null, endDate = null, lessonPlan = null, dayGapBetweenModules = 0, lessonSlotMap = {}) {
  console.log('🎯 generateClassSlots called with:', {
    startDate,
    classSlotPatterns,
    exceptions,
    numberOfWeeks,
    numberOfLessons,
    endDate,
    lessonPlan: lessonPlan ? lessonPlan.name : 'none',
    dayGapBetweenModules,
    lessonSlotMap
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
        
        console.log(`🔍 Processing module "${item.name}" (ID: ${item.id})`)
        console.log(`🔍 lessonPlan.lessons exists?`, !!lessonPlan.lessons)
        console.log(`🔍 lessonPlan.lessons is array?`, Array.isArray(lessonPlan.lessons))
        console.log(`🔍 lessonPlan.lessons.length:`, lessonPlan.lessons?.length)
        console.log(`🔍 item.lessons exists?`, !!item.lessons)
        console.log(`🔍 item.lessons length:`, item.lessons?.length)
        
        if (lessonPlan.lessons && Array.isArray(lessonPlan.lessons) && lessonPlan.lessons.length > 0) {
          // Flat lessons array - ALWAYS use this if available (matches modal)
          const filteredLessons = lessonPlan.lessons.filter(l => l.moduleId === item.id)
          console.log(`📋 Found ${filteredLessons.length} lessons in FLAT array for module "${item.name}"`)
          console.log(`📋 First lesson ID from flat:`, filteredLessons[0]?.id)
          
          moduleLessons = filteredLessons
            .sort((a, b) => a.order - b.order)
            .map(lesson => ({
              ...lesson,
              moduleName: item.name,
              type: 'lesson'
            }))
          console.log(`✅ Using FLAT lessons for module "${item.name}":`, moduleLessons.length, 'lessons')
        } else if (item.lessons) {
          // Nested lessons - fallback only if flat array doesn't exist
          console.log(`⚠️ WARNING: Using NESTED lessons for module "${item.name}" - this may cause ID mismatches!`)
          console.log(`⚠️ First nested lesson ID:`, item.lessons[0]?.id)
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
  let lessonSlotRemaining = 0 // Track remaining slots for current lesson
  let lessonSlotNumber = 0 // Track current slot number for the lesson
  let currentLessonTotalSlots = 0 // Total slots for current lesson
  
  while (currentDate <= finalEndDate && itemIndex < allItems.length) {
    // Stop if we've reached the numberOfLessons limit
    if (numberOfLessons && slots.length >= numberOfLessons) {
      console.log(`⚠️ Stopping: slots.length (${slots.length}) >= numberOfLessons (${numberOfLessons}), itemIndex: ${itemIndex}`)
      break
    }
    
    const currentItem = allItems[itemIndex]
    
    // Initialize slot tracking when starting a new lesson
    if (currentItem && currentItem.type === 'lesson' && lessonSlotRemaining === 0) {
      const lessonId = currentItem.id
      currentLessonTotalSlots = lessonSlotMap[lessonId] || 1
      lessonSlotRemaining = currentLessonTotalSlots
      lessonSlotNumber = 1
      console.log(`📚 Starting lesson "${currentItem.title}" (ID: ${lessonId})`)
      console.log(`📚 lessonSlotMap[${lessonId}] =`, lessonSlotMap[lessonId])
      console.log(`📚 Will use ${currentLessonTotalSlots} slot(s)`)
      console.log(`📚 Full lessonSlotMap:`, lessonSlotMap)
    }
    
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
            // Slot position metadata for multi-slot lessons
            slotNumber: lessonSlotNumber,
            totalSlots: currentLessonTotalSlots,
            // Legacy fields for backward compatibility
            lessonIndex: itemIndex,
            lesson: item
          })
          
          // Track multi-slot lesson progress
          lessonSlotRemaining--
          lessonSlotNumber++
          console.log(`  ✓ Created slot ${lessonSlotNumber - 1}/${currentLessonTotalSlots} for "${item.title}", remaining: ${lessonSlotRemaining}`)
          
          // Only advance to next lesson when all slots are consumed
          if (lessonSlotRemaining <= 0) {
            console.log(`  ➡️ All slots consumed for "${item.title}", advancing to next item`)
            itemIndex++
          }
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
              // Slot position metadata for multi-slot lessons
              slotNumber: lessonSlotNumber,
              totalSlots: currentLessonTotalSlots,
              // Legacy fields for backward compatibility
              lessonIndex: itemIndex,
              lesson: item
            })
            
            // Track multi-slot lesson progress
            lessonSlotRemaining--
            lessonSlotNumber++
            console.log(`  ✓ Created slot ${lessonSlotNumber - 1}/${currentLessonTotalSlots} for "${item.title}", remaining: ${lessonSlotRemaining}`)
            
            // Only advance to next lesson when all slots are consumed
            if (lessonSlotRemaining <= 0) {
              console.log(`  ➡️ All slots consumed for "${item.title}", advancing to next item`)
              itemIndex++
            }
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
