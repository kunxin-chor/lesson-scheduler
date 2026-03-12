import { useState, useRef, useEffect } from 'react'
import { Card, Button, Form, Badge } from 'react-bootstrap'
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

function SortableLesson({ lesson, onEdit, onDelete, onMove, modules, moduleId, onUpdateField }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const [showMenu, setShowMenu] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [fieldValue, setFieldValue] = useState('')
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
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const startEditField = (field) => {
    setEditingField(field)
    setFieldValue(lesson[field] || '')
  }

  const saveField = () => {
    onUpdateField(lesson.id, editingField, fieldValue)
    setEditingField(null)
  }

  const cancelEdit = () => {
    setEditingField(null)
    setFieldValue('')
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="lesson-card"
    >
      <div className="card-header">
        {editingField === 'title' ? (
          <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Form.Control
              type="text"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              autoFocus
              size="sm"
              style={{ flex: 1 }}
            />
            <Button size="sm" onClick={saveField}>Save</Button>
            <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
          </div>
        ) : (
          <>
            <h4 {...attributes} {...listeners} style={{ cursor: 'grab', flex: 1 }}>
              ☰ {lesson.title}
            </h4>
            <Button
              variant="link"
              size="sm"
              className="p-0 me-2"
              onClick={() => startEditField('title')}
              title="Edit title"
            >
              ✎
            </Button>
            <Button
              variant="link"
              size="sm"
              className="p-0 me-2"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? '▾' : '▴'}
            </Button>
          </>
        )}
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
              {modules.map(m => (
                <button
                  key={m.id}
                  onClick={() => { onMove(lesson.id, m.id); setShowMenu(false); }}
                  className={m.id === moduleId ? 'current' : ''}
                >
                  Move to {m.name}
                </button>
              ))}
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
        <div className="card-content">
          {/* Prelearning Materials */}
          <div className="material-section">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Prelearning:</strong>
              <Button
                variant="link"
                size="sm"
                className="p-0"
                onClick={() => startEditField('prelearningMaterials')}
                title="Edit prelearning materials"
              >
                ✎
              </Button>
            </div>
            {editingField === 'prelearningMaterials' ? (
              <div>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder="Add links (one per line)"
                  autoFocus
                  size="sm"
                />
                <div className="d-flex gap-1 mt-1">
                  <Button size="sm" onClick={saveField}>Save</Button>
                  <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="links">
                {lesson.prelearningMaterials?.split('\n').filter(link => link.trim()).map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                ))}
                {!lesson.prelearningMaterials && <span className="text-muted">No materials added</span>}
              </div>
            )}
          </div>

          {/* Guided Instructions */}
          <div className="material-section">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Instructions:</strong>
              <Button
                variant="link"
                size="sm"
                className="p-0"
                onClick={() => startEditField('guidedInstructions')}
                title="Edit guided instructions"
              >
                ✎
              </Button>
            </div>
            {editingField === 'guidedInstructions' ? (
              <div>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder="Add links (one per line)"
                  autoFocus
                  size="sm"
                />
                <div className="d-flex gap-1 mt-1">
                  <Button size="sm" onClick={saveField}>Save</Button>
                  <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="links">
                {lesson.guidedInstructions?.split('\n').filter(link => link.trim()).map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                ))}
                {!lesson.guidedInstructions && <span className="text-muted">No instructions added</span>}
              </div>
            )}
          </div>

          {/* Hands-on Activities */}
          <div className="material-section">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <strong>Activities:</strong>
              <Button
                variant="link"
                size="sm"
                className="p-0"
                onClick={() => startEditField('handsOnActivities')}
                title="Edit hands-on activities"
              >
                ✎
              </Button>
            </div>
            {editingField === 'handsOnActivities' ? (
              <div>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder="Add links (one per line)"
                  autoFocus
                  size="sm"
                />
                <div className="d-flex gap-1 mt-1">
                  <Button size="sm" onClick={saveField}>Save</Button>
                  <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="links">
                {lesson.handsOnActivities?.split('\n').filter(link => link.trim()).map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                ))}
                {!lesson.handsOnActivities && <span className="text-muted">No activities added</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function LessonBoard({ lessons = [], modules = [], onLessonsUpdate, onModulesUpdate, editable = true }) {
  const [editingLesson, setEditingLesson] = useState(null)
  const [editingModule, setEditingModule] = useState(null)
  const [activeId, setActiveId] = useState(null)

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
        onModulesUpdate(arrayMove(modules, oldIndex, newIndex))
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
        const updatedLessons = arrayMove(lessons, activeIndex, overIndex).map(lesson =>
          lesson.id === activeLesson.id
            ? { ...lesson, moduleId: overLesson.moduleId }
            : lesson
        )
        
        onLessonsUpdate(updatedLessons)
      }
      // Check if dropped over a module (empty area)
      else {
        const overModule = modules.find(m => m.id === over.id)
        
        if (overModule && activeLesson.moduleId !== overModule.id) {
          // Move lesson to the end of the target module
          onLessonsUpdate(lessons.map(lesson =>
            lesson.id === activeLesson.id
              ? { ...lesson, moduleId: overModule.id }
              : lesson
          ))
        }
      }
    }

    setActiveId(null)
  }

  const addModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      name: 'New Module',
      collapsed: false
    }
    onModulesUpdate([...modules, newModule])
  }

  const updateModuleName = (moduleId, name) => {
    onModulesUpdate(modules.map(module =>
      module.id === moduleId ? { ...module, name } : module
    ))
    setEditingModule(null)
  }

  const toggleModuleCollapse = (moduleId) => {
    onModulesUpdate(modules.map(module =>
      module.id === moduleId ? { ...module, collapsed: !module.collapsed } : module
    ))
  }

  const deleteModule = (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module? Lessons will be moved to the first module.')) {
      const firstModuleId = modules[0]?.id
      const updatedLessons = lessons.map(lesson =>
        lesson.moduleId === moduleId ? { ...lesson, moduleId: firstModuleId } : lesson
      )

      onModulesUpdate(modules.filter(m => m.id !== moduleId))
      onLessonsUpdate(updatedLessons)
    }
  }

  const addLesson = (moduleId) => {
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: 'New Lesson',
      prelearningMaterials: '',
      guidedInstructions: '',
      handsOnActivities: '',
      moduleId
    }
    onLessonsUpdate([...lessons, newLesson])
  }

  const updateLesson = (lessonId, updates) => {
    onLessonsUpdate(lessons.map(lesson =>
      lesson.id === lessonId ? { ...lesson, ...updates } : lesson
    ))
  }

  const updateLessonField = (lessonId, field, value) => {
    onLessonsUpdate(lessons.map(lesson =>
      lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
    ))
  }

  const deleteLesson = (lessonId) => {
    onLessonsUpdate(lessons.filter(lesson => lesson.id !== lessonId))
  }

  const moveLesson = (lessonId, targetModuleId) => {
    updateLesson(lessonId, { moduleId: targetModuleId })
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
                            value={module.name}
                            onChange={(e) => updateModuleName(module.id, e.target.value)}
                            onBlur={() => setEditingModule(null)}
                            onKeyPress={(e) => e.key === 'Enter' && setEditingModule(null)}
                            autoFocus
                            size="sm"
                            style={{ flex: 1 }}
                          />
                        ) : (
                          <h3 
                            onDoubleClick={() => editable && setEditingModule(module.id)}
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
                              onEdit={setEditingLesson}
                              onDelete={deleteLesson}
                              onMove={moveLesson}
                              onUpdateField={updateLessonField}
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

      {/* Edit Modal Overlay */}
      {editingLesson && (
        <div className="edit-overlay" onClick={() => setEditingLesson(null)} />
      )}
    </div>
  )
}

export default LessonBoard
