import React, { useState, useRef, useEffect } from 'react'
import { Card, Button, Form, Badge, Dropdown } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import LessonEditModal from './components/LessonEditModal'
import ModuleEditModal from './components/ModuleEditModal'
import AssignmentEditModal from './components/AssignmentEditModal'
import './LessonBoard.css'

function SortableModule({ module, children, editable }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="module-lane">
      {children({ attributes, listeners, setActivatorNodeRef })}
    </div>
  )
}

function SortableAssignment({ assignment, children, editable }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id: assignment.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="assignment-lane">
      {children({ attributes, listeners, setActivatorNodeRef })}
    </div>
  )
}

function SortableLesson({ lesson, onEdit, onDelete, onMove, modules, moduleId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const [showMenu, setShowMenu] = useState(false)
  const [showMoveSelect, setShowMoveSelect] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const menuRef = useRef(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
        setShowMoveSelect(false)
      }
    }

    if (showMenu || showMoveSelect) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu, showMoveSelect])

  const handleMoveToModule = (targetModuleId) => {
    onMove(lesson.id, targetModuleId)
    setShowMoveSelect(false)
    setShowMenu(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="lesson-card"
    >
      <div className="card-header">
        <span 
          {...attributes} 
          {...listeners} 
          style={{ cursor: 'grab', marginRight: '8px' }}
          title="Drag to move"
        >
          ☰
        </span>
        <h4 
          style={{ cursor: 'pointer', flex: 1, margin: 0 }}
          onClick={() => onEdit(lesson)}
          title="Click to edit"
        >
          {lesson.title}
        </h4>
        <Button
          variant="link"
          size="sm"
          className="p-0 me-2"
          onClick={(e) => {
            e.stopPropagation()
            setIsCollapsed(!isCollapsed)
          }}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? '▾' : '▴'}
        </Button>
        <div className="card-menu" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="menu-btn"
          >
            ⋯
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              <div style={{ position: 'relative' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMoveSelect(!showMoveSelect)
                  }}
                >
                  Move To...
                </button>
                {showMoveSelect && (
                  <div style={{ 
                    position: 'absolute', 
                    left: '100%', 
                    top: 0, 
                    marginLeft: '4px',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    minWidth: '150px',
                    zIndex: 1000
                  }}>
                    {modules
                      .filter(m => m.id !== moduleId)
                      .map(m => (
                        <button
                          key={m.id}
                          onClick={() => handleMoveToModule(m.id)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'white',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                          onMouseLeave={(e) => e.target.style.background = 'white'}
                        >
                          {m.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => { onDelete(lesson.id); setShowMenu(false); }}
                className="delete-option"
              >
                Delete Lesson
              </button>
            </div>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="card-content" onClick={() => onEdit(lesson)} style={{ cursor: 'pointer' }}>
          {/* Prelearning Materials */}
          <div className="material-section">
            <strong>📚 Prelearning:</strong>
            <div className="markdown-content">
              {lesson.prelearningMaterials ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lesson.prelearningMaterials}
                </ReactMarkdown>
              ) : (
                <span className="text-muted">Click to add materials...</span>
              )}
            </div>
          </div>

          {/* Guided Instructions */}
          <div className="material-section">
            <strong>👨‍🏫 Instructions:</strong>
            <div className="markdown-content">
              {lesson.guidedInstructions ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lesson.guidedInstructions}
                </ReactMarkdown>
              ) : (
                <span className="text-muted">Click to add instructions...</span>
              )}
            </div>
          </div>

          {/* Hands-on Activities */}
          <div className="material-section">
            <strong>🛠️ Activities:</strong>
            <div className="markdown-content">
              {lesson.handsOnActivities ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lesson.handsOnActivities}
                </ReactMarkdown>
              ) : (
                <span className="text-muted">Click to add activities...</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LessonBoard({ lessons = [], modules = [], assignments = [], onLessonsUpdate, onModulesUpdate, onAssignmentsUpdate, editable = true }) {
  const [editingLesson, setEditingLesson] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [editingModuleName, setEditingModuleName] = useState('')
  const [editingModuleRef, setEditingModuleRef] = useState(null)
  const [showModuleRefModal, setShowModuleRefModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const modulesContainerRef = useRef(null)
  const stickyScrollbarRef = useRef(null)
  const [scrollWidth, setScrollWidth] = useState(0)
  const [hideSticky, setHideSticky] = useState(false)

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson)
    setShowEditModal(true)
  }

  const handleSaveLesson = (updates) => {
    if (editingLesson) {
      onLessonsUpdate(lessons.map(lesson =>
        lesson.id === editingLesson.id ? { ...lesson, ...updates } : lesson
      ), false)
    }
  }

  const handleCloseModal = () => {
    setShowEditModal(false)
    setEditingLesson(null)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getLessonsByModule = (moduleId) => {
    return lessons.filter(lesson => lesson.moduleId === moduleId)
  }

  const handleDragStart = (event) => {
    console.log('🚀 Drag start:', event.active.id)
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    console.log('🎯 Drag end:', { activeId: active.id, overId: over?.id })

    if (!over) {
      console.log('❌ No drop target')
      return
    }

    // Check if dragging a module or assignment (unified ordering)
    const activeModule = modules.find(m => m.id === active.id)
    const activeAssignment = assignments.find(a => a.id === active.id)

    console.log('🔍 Active item:', { 
      isModule: !!activeModule, 
      isAssignment: !!activeAssignment,
      unifiedItemsCount: unifiedItems.length 
    })

    if (activeModule || activeAssignment) {
      // Reordering modules/assignments in unified list
      const oldIndex = unifiedItems.findIndex(item => item.id === active.id)
      let newIndex = unifiedItems.findIndex(item => item.id === over.id)
      
      // If dropping onto a lesson, find its parent module
      if (newIndex === -1) {
        const overLesson = lessons.find(l => l.id === over.id)
        if (overLesson) {
          newIndex = unifiedItems.findIndex(item => item.type === 'module' && item.id === overLesson.moduleId)
          console.log('📦 Dropped on lesson, using parent module index:', newIndex)
        }
      }
      
      console.log('📍 Indices:', { oldIndex, newIndex })
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reorderedItems = arrayMove(unifiedItems, oldIndex, newIndex)
        
        // Split back into modules and assignments with updated orders
        const updatedModules = []
        const updatedAssignments = []
        
        reorderedItems.forEach((item, index) => {
          if (item.type === 'module') {
            updatedModules.push({ ...modules.find(m => m.id === item.id), order: index })
          } else if (item.type === 'assignment') {
            updatedAssignments.push({ ...assignments.find(a => a.id === item.id), order: index })
          }
        })
        
        console.log('✅ Updating:', { 
          modulesCount: updatedModules.length, 
          assignmentsCount: updatedAssignments.length 
        })
        
        onModulesUpdate(updatedModules, true)
        onAssignmentsUpdate(updatedAssignments, true)
      } else {
        console.log('⚠️ Invalid indices or no change')
      }
    }
    // Handle lesson reordering or moving between modules
    else {
      const activeLesson = lessons.find(l => l.id === active.id)
      
      if (!activeLesson) return

      // Check if dropped over another lesson
      const overLesson = lessons.find(l => l.id === over.id)
      
      if (overLesson) {
        // Moving within same module or to different module
        const activeIndex = lessons.indexOf(activeLesson)
        const overIndex = lessons.indexOf(overLesson)
        
        // Update the moduleId if moving to a different module
        let updatedLessons = arrayMove(lessons, activeIndex, overIndex).map(lesson =>
          lesson.id === activeLesson.id
            ? { ...lesson, moduleId: overLesson.moduleId, updatedAt: new Date() }
            : lesson
        )
        
        // Recalculate order for all lessons in affected modules
        const affectedModules = new Set([activeLesson.moduleId, overLesson.moduleId])
        affectedModules.forEach(moduleId => {
          const moduleLessons = updatedLessons.filter(l => l.moduleId === moduleId)
          moduleLessons.forEach((lesson, index) => {
            const lessonIndex = updatedLessons.findIndex(l => l.id === lesson.id)
            updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], order: index }
          })
        })
        
        onLessonsUpdate(updatedLessons, true) // Structural change
      }
      // Check if dropped over a module (empty area)
      else {
        const overModule = modules.find(m => m.id === over.id)
        
        if (overModule && activeLesson.moduleId !== overModule.id) {
          // Move lesson to the end of the target module
          const targetModuleLessons = lessons.filter(l => l.moduleId === overModule.id)
          const updatedLessons = lessons.map(lesson =>
            lesson.id === activeLesson.id
              ? { ...lesson, moduleId: overModule.id, order: targetModuleLessons.length, updatedAt: new Date() }
              : lesson
          )
          
          // Recalculate order for source module
          const sourceModuleLessons = updatedLessons.filter(l => l.moduleId === activeLesson.moduleId)
          sourceModuleLessons.forEach((lesson, index) => {
            const lessonIndex = updatedLessons.findIndex(l => l.id === lesson.id)
            updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], order: index }
          })
          
          onLessonsUpdate(updatedLessons, true) // Structural change
        }
      }
    }

    setActiveId(null)
  }

  const addModule = (afterId = null) => {
    const newModule = {
      id: `module-${Date.now()}`,
      name: 'New Module',
      collapsed: false,
      order: 0,
      referenceMaterials: ''
    }
    
    if (afterId === null) {
      // Add at the end
      newModule.order = unifiedItems.length
      onModulesUpdate([...modules, newModule], true)
    } else {
      // Insert after the specified item
      const afterIndex = unifiedItems.findIndex(item => item.id === afterId)
      if (afterIndex !== -1) {
        // Reorder all items after the insertion point
        const updatedModules = modules.map(m => ({
          ...m,
          order: m.order > unifiedItems[afterIndex].order ? m.order + 1 : m.order
        }))
        newModule.order = unifiedItems[afterIndex].order + 1
        onModulesUpdate([...updatedModules, newModule], true)
        
        // Also update assignments orders
        const updatedAssignments = assignments.map(a => ({
          ...a,
          order: a.order > unifiedItems[afterIndex].order ? a.order + 1 : a.order
        }))
        onAssignmentsUpdate(updatedAssignments, true)
      }
    }
  }

  const startEditingModule = (moduleId) => {
    const module = modules.find(m => m.id === moduleId)
    setEditingModule(moduleId)
    setEditingModuleName(module.name)
  }

  const saveModuleName = () => {
    if (editingModule) {
      onModulesUpdate(modules.map(module =>
        module.id === editingModule ? { ...module, name: editingModuleName } : module
      ), false) // Content change, not structural
      setEditingModule(null)
      setEditingModuleName('')
    }
  }

  const handleEditModuleRef = (module) => {
    setEditingModuleRef(module)
    setShowModuleRefModal(true)
  }

  const handleSaveModuleRef = (updates) => {
    if (editingModuleRef) {
      onModulesUpdate(modules.map(module =>
        module.id === editingModuleRef.id ? { ...module, ...updates } : module
      ), false) // Content change, not structural
    }
  }

  const handleCloseModuleRefModal = () => {
    setShowModuleRefModal(false)
    setEditingModuleRef(null)
  }

  const toggleModuleCollapse = (moduleId) => {
    // Don't trigger save for UI state changes
    onModulesUpdate(modules.map(module =>
      module.id === moduleId ? { ...module, collapsed: !module.collapsed } : module
    ), false)
  }

  const deleteModule = (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module? Lessons will be moved to the first module.')) {
      const firstModuleId = modules[0]?.id
      const updatedLessons = lessons.map(lesson =>
        lesson.moduleId === moduleId ? { ...lesson, moduleId: firstModuleId } : lesson
      )

      onModulesUpdate(modules.filter(m => m.id !== moduleId), true) // Structural change
      onLessonsUpdate(updatedLessons, true) // Structural change
    }
  }

  const addLesson = (moduleId) => {
    const moduleLessons = lessons.filter(l => l.moduleId === moduleId)
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: 'New Lesson',
      prelearningMaterials: '',
      guidedInstructions: '',
      handsOnActivities: '',
      moduleId,
      order: moduleLessons.length,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    onLessonsUpdate([...lessons, newLesson], true) // Structural change
  }

  const deleteLesson = (lessonId) => {
    onLessonsUpdate(lessons.filter(lesson => lesson.id !== lessonId), true) // Structural change
  }

  const moveLesson = (lessonId, targetModuleId) => {
    onLessonsUpdate(lessons.map(lesson =>
      lesson.id === lessonId ? { ...lesson, moduleId: targetModuleId } : lesson
    ), false)
  }

  const addAssignment = (afterId = null) => {
    const newAssignment = {
      id: `assignment-${Date.now()}`,
      title: 'New Assignment',
      description: '',
      durationDays: 1,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    if (afterId === null) {
      // Add at the end
      newAssignment.order = unifiedItems.length
      onAssignmentsUpdate([...assignments, newAssignment], true)
    } else {
      // Insert after the specified item
      const afterIndex = unifiedItems.findIndex(item => item.id === afterId)
      if (afterIndex !== -1) {
        // Reorder all items after the insertion point
        const updatedAssignments = assignments.map(a => ({
          ...a,
          order: a.order > unifiedItems[afterIndex].order ? a.order + 1 : a.order
        }))
        newAssignment.order = unifiedItems[afterIndex].order + 1
        onAssignmentsUpdate([...updatedAssignments, newAssignment], true)
        
        // Also update modules orders
        const updatedModules = modules.map(m => ({
          ...m,
          order: m.order > unifiedItems[afterIndex].order ? m.order + 1 : m.order
        }))
        onModulesUpdate(updatedModules, true)
      }
    }
  }

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment)
    setShowAssignmentModal(true)
  }

  const handleSaveAssignment = (assignmentData) => {
    if (editingAssignment) {
      onAssignmentsUpdate(assignments.map(a =>
        a.id === editingAssignment.id ? { ...a, ...assignmentData, updatedAt: new Date() } : a
      ), false)
    } else {
      onAssignmentsUpdate([...assignments, { ...assignmentData, createdAt: new Date(), updatedAt: new Date() }], true)
    }
  }

  const handleDeleteAssignment = (assignmentId) => {
    onAssignmentsUpdate(assignments.filter(a => a.id !== assignmentId), true)
  }

  const handleCloseAssignmentModal = () => {
    setShowAssignmentModal(false)
    setEditingAssignment(null)
  }

  useEffect(() => {
    const updateScrollWidth = () => {
      if (modulesContainerRef.current) {
        setScrollWidth(modulesContainerRef.current.scrollWidth)
      }
    }
    updateScrollWidth()
    window.addEventListener('resize', updateScrollWidth)
    return () => window.removeEventListener('resize', updateScrollWidth)
  }, [modules, lessons])

  useEffect(() => {
    const handlePageScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Hide sticky scrollbar when within 100px of bottom
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 100
      setHideSticky(isNearBottom)
    }

    window.addEventListener('scroll', handlePageScroll)
    handlePageScroll() // Check initial state
    
    return () => window.removeEventListener('scroll', handlePageScroll)
  }, [])

  const handleMainScroll = () => {
    if (modulesContainerRef.current && stickyScrollbarRef.current) {
      stickyScrollbarRef.current.scrollLeft = modulesContainerRef.current.scrollLeft
    }
  }

  const handleStickyScroll = () => {
    if (modulesContainerRef.current && stickyScrollbarRef.current) {
      modulesContainerRef.current.scrollLeft = stickyScrollbarRef.current.scrollLeft
    }
  }

  // Create a unified list of modules and assignments sorted by order
  const unifiedItems = React.useMemo(() => {
    const items = [
      ...modules.map(m => ({ ...m, type: 'module' })),
      ...assignments.map(a => ({ ...a, type: 'assignment' }))
    ]
    return items.sort((a, b) => a.order - b.order)
  }, [modules, assignments])

  return (
    <div className="lesson-board">
      <div className="board-header">
        <h2>Lesson Organization Board</h2>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="modules-scroll-wrapper">
          <div className="modules-container" ref={modulesContainerRef} onScroll={handleMainScroll}>
          <SortableContext
            items={unifiedItems.map(item => item.id)}
            strategy={horizontalListSortingStrategy}
          >
            {unifiedItems.map((item) => {
              if (item.type === 'assignment') {
                return (
                  <SortableAssignment key={item.id} assignment={item} editable={editable}>
                    {({ attributes, listeners, setActivatorNodeRef }) => (
                      <div className="assignment-lane-card">
                        <div className="assignment-lane-header">
                          {editable && (
                            <span 
                              ref={setActivatorNodeRef}
                              className="drag-handle" 
                              style={{ cursor: 'grab', marginRight: '8px' }}
                              title="Drag to reorder"
                              {...attributes}
                              {...listeners}
                            >
                              ⋮⋮
                            </span>
                          )}
                          <div className="assignment-lane-title" onClick={() => handleEditAssignment(item)}>
                            <strong>📋 {item.title}</strong>
                            <Badge bg="info" className="ms-2">{item.durationDays} day{item.durationDays !== 1 ? 's' : ''}</Badge>
                          </div>
                          {editable && (
                            <div className="d-flex gap-1">
                              <Dropdown onClick={(e) => e.stopPropagation()}>
                                <Dropdown.Toggle variant="link" size="sm" className="text-secondary" style={{ textDecoration: 'none' }}>
                                  +
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={(e) => {
                                    e.stopPropagation()
                                    addModule(item.id)
                                  }}>
                                    Add Module After
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={(e) => {
                                    e.stopPropagation()
                                    addAssignment(item.id)
                                  }}>
                                    Add Assignment After
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                              <Button
                                variant="link"
                                size="sm"
                                className="text-danger"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (window.confirm('Delete this assignment?')) {
                                    handleDeleteAssignment(item.id)
                                  }
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          )}
                        </div>
                        {item.description && (
                          <div className="assignment-lane-description" onClick={() => handleEditAssignment(item)}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {item.description}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </SortableAssignment>
                )
              }
              
              // Module rendering
              const module = item
              return (
              <SortableModule key={module.id} module={module} editable={editable}>
                {({ attributes, listeners, setActivatorNodeRef }) => (
                  <>
                    <div className="module-header">
                      <div className="module-title">
                        {editable && (
                          <span 
                            ref={setActivatorNodeRef}
                            className="drag-handle" 
                            style={{ cursor: 'grab', marginRight: '8px' }}
                            title="Drag to reorder modules"
                            {...attributes}
                            {...listeners}
                          >
                            ⋮⋮
                          </span>
                        )}
                        {editingModule === module.id ? (
                          <Form.Control
                            type="text"
                            value={editingModuleName}
                            onChange={(e) => setEditingModuleName(e.target.value)}
                            onBlur={saveModuleName}
                            onKeyPress={(e) => e.key === 'Enter' && saveModuleName()}
                            autoFocus
                            size="sm"
                            style={{ flex: 1 }}
                          />
                        ) : (
                          <h3 
                            onDoubleClick={() => editable && startEditingModule(module.id)}
                            style={{ cursor: editable ? 'pointer' : 'default', flex: 1 }}
                            title="Double-click to edit"
                          >
                            {module.name}
                          </h3>
                        )}
                        <Badge bg="secondary" className="ms-2">
                          {getLessonsByModule(module.id).length}
                        </Badge>
                      </div>
                      <div className="module-actions">
                        {editable && (
                          <>
                            <Dropdown>
                              <Dropdown.Toggle 
                                variant="link" 
                                size="sm" 
                                className="text-secondary"
                                title="Add item after this module"
                                style={{ padding: '0.25rem 0.5rem', textDecoration: 'none' }}
                              >
                                +
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => addModule(module.id)}>
                                  Add Module After
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => addAssignment(module.id)}>
                                  Add Assignment After
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleEditModuleRef(module)}
                              title="Edit reference materials"
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              📚
                            </Button>
                          </>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => toggleModuleCollapse(module.id)}
                          title={module.collapsed ? "Expand module" : "Collapse module"}
                        >
                          {module.collapsed ? '▾' : '▴'}
                        </Button>
                        {editable && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger"
                            onClick={() => deleteModule(module.id)}
                            title="Delete module"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>

                    {!module.collapsed && (
                      <>
                        {module.referenceMaterials && (
                          <div style={{
                            background: '#f8f9fa',
                            padding: '0.75rem',
                            margin: '0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            border: '1px solid #e1e4e8'
                          }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#172b4d' }}>
                              📚 Reference Materials
                            </div>
                            <div className="markdown-content" style={{ color: '#5e6c84' }}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {module.referenceMaterials}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                        <div className="lessons-container">
                          <SortableContext
                            items={getLessonsByModule(module.id).map(l => l.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {getLessonsByModule(module.id).map((lesson) => (
                              <SortableLesson
                                key={lesson.id}
                                lesson={lesson}
                                moduleId={module.id}
                                modules={modules}
                                onEdit={handleEditLesson}
                                onDelete={deleteLesson}
                                onMove={moveLesson}
                              />
                            ))}
                          </SortableContext>

                          {editable && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="w-100 mt-2"
                              onClick={() => addLesson(module.id)}
                            >
                              + Add Lesson
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </SortableModule>
              )
            })}
          </SortableContext>
          
          {editable && (
            <div className="add-item-lane">
              <div className="add-item-card">
                <Dropdown>
                  <Dropdown.Toggle variant="outline-primary" size="sm" className="w-100">
                    + Add Item
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => addModule(null)}>
                      Add Module
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => addAssignment(null)}>
                      Add Assignment
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          )}
          </div>
          
          {!hideSticky && (
            <div className="sticky-scrollbar" ref={stickyScrollbarRef} onScroll={handleStickyScroll}>
              <div className="sticky-scrollbar-content" style={{ width: scrollWidth }}></div>
            </div>
          )}
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="lesson-card" style={{ opacity: 0.8, cursor: 'grabbing' }}>
              <div className="card-header">
                <h4>
                  {lessons.find(l => l.id === activeId)?.title || 
                   modules.find(m => m.id === activeId)?.name ||
                   assignments.find(a => a.id === activeId)?.title || 
                   'Dragging...'}
                </h4>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <LessonEditModal
        show={showEditModal}
        lesson={editingLesson}
        onClose={handleCloseModal}
        onSave={handleSaveLesson}
      />

      <ModuleEditModal
        show={showModuleRefModal}
        module={editingModuleRef}
        onClose={handleCloseModuleRefModal}
        onSave={handleSaveModuleRef}
      />

      <AssignmentEditModal
        show={showAssignmentModal}
        assignment={editingAssignment}
        onHide={handleCloseAssignmentModal}
        onSave={handleSaveAssignment}
        onDelete={handleDeleteAssignment}
      />

      {/* Edit Modal Overlay */}
      {editingLesson && (
        <div className="edit-overlay" onClick={() => setEditingLesson(null)} />
      )}
    </div>
  )
}

export default LessonBoard
