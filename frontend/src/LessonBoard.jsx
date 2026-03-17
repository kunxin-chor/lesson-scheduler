import { useState, useRef, useEffect } from 'react'
import { Card, Button, Form, Badge } from 'react-bootstrap'
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
import './LessonBoard.css'

function SortableModule({ module, children, editable }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="module-lane">
      {children({ attributes, listeners })}
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

function LessonBoard({ lessons = [], modules = [], onLessonsUpdate, onModulesUpdate, editable = true }) {
  const [editingLesson, setEditingLesson] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [editingModuleName, setEditingModuleName] = useState('')
  const [editingModuleRef, setEditingModuleRef] = useState(null)
  const [showModuleRefModal, setShowModuleRefModal] = useState(false)
  const [activeId, setActiveId] = useState(null)

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
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getLessonsByModule = (moduleId) => {
    return lessons.filter(lesson => lesson.moduleId === moduleId)
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return

    // Handle module reordering
    if (modules.find(m => m.id === active.id)) {
      const oldIndex = modules.findIndex(m => m.id === active.id)
      const newIndex = modules.findIndex(m => m.id === over.id)
      
      if (oldIndex !== newIndex) {
        const reorderedModules = arrayMove(modules, oldIndex, newIndex)
          .map((module, index) => ({ ...module, order: index }))
        onModulesUpdate(reorderedModules, true) // Structural change
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

  const addModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      name: 'New Module',
      collapsed: false,
      order: modules.length,
      referenceMaterials: ''
    }
    onModulesUpdate([...modules, newModule], true) // Structural change
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

  return (
    <div className="lesson-board">
      <div className="board-header">
        <h2>Lesson Organization Board</h2>
        {editable && (
          <Button onClick={addModule} variant="primary" size="sm">
            + Add Module
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="modules-container">
          <SortableContext
            items={modules.map(m => m.id)}
            strategy={horizontalListSortingStrategy}
          >
            {modules.map((module) => (
              <SortableModule key={module.id} module={module} editable={editable}>
                {({ attributes, listeners }) => (
                  <>
                    <div className="module-header">
                      <div className="module-title">
                        {editable && (
                          <span 
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
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleEditModuleRef(module)}
                            title="Edit reference materials"
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            📚
                          </Button>
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
            ))}
          </SortableContext>
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="lesson-card" style={{ opacity: 0.8, cursor: 'grabbing' }}>
              <div className="card-header">
                <h4>
                  {lessons.find(l => l.id === activeId)?.title || 
                   modules.find(m => m.id === activeId)?.name || 
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

      {/* Edit Modal Overlay */}
      {editingLesson && (
        <div className="edit-overlay" onClick={() => setEditingLesson(null)} />
      )}
    </div>
  )
}

export default LessonBoard
