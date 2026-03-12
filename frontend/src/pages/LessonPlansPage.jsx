import { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap'
import LessonBoard from '../LessonBoard'

function LessonPlansPage() {
  const [lessonPlans, setLessonPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved', 'saving', 'unsaved'
  const [lastSaved, setLastSaved] = useState(null)
  const debounceTimerRef = useRef(null)

  const performSave = () => {
    if (!selectedPlan) return

    setSaveStatus('saving')
    const updatedPlan = {
      ...selectedPlan,
      modules,
      lessons,
      updatedAt: new Date()
    }
    
    // Generate database-compatible JSON
    const dbJSON = generateLessonPlanJSON(selectedPlan, modules, lessons)
    
    setLessonPlans(lessonPlans.map(p => 
      p.id === selectedPlan.id ? updatedPlan : p
    ))
    setSelectedPlan(updatedPlan)
    
    console.log('=== LESSON PLAN JSON FOR DATABASE ===')
    console.log(JSON.stringify(dbJSON, null, 2))
    console.log('=====================================')
    
    setSaveStatus('saved')
    setLastSaved(new Date())
  }

  const debouncedSave = () => {
    setSaveStatus('unsaved')
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      performSave()
    }, 2000) // 2 second debounce
  }

  const immediateSave = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    performSave()
  }

  const handleLessonsUpdate = (updatedLessons, isStructuralChange = false) => {
    setLessons(updatedLessons)
    if (selectedPlan) {
      if (isStructuralChange) {
        immediateSave()
      } else {
        debouncedSave()
      }
    }
  }

  const handleModulesUpdate = (updatedModules, isStructuralChange = false) => {
    setModules(updatedModules)
    if (selectedPlan) {
      if (isStructuralChange) {
        immediateSave()
      } else {
        debouncedSave()
      }
    }
  }

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleCreatePlan = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newPlan = {
      id: `plan-${Date.now()}`,
      name: formData.get('name'),
      description: formData.get('description'),
      modules: [],
      lessons: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setLessonPlans([...lessonPlans, newPlan])
    setShowCreateForm(false)
    e.target.reset()
    console.log('New lesson plan created:', newPlan)
  }

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan)
    setModules(plan.modules || [])
    setLessons(plan.lessons || [])
  }

  const handleBackToList = () => {
    setSelectedPlan(null)
    setModules([])
    setLessons([])
  }

  const generateLessonPlanJSON = (plan, modulesData, lessonsData) => {
    // Transform flat lessons array into nested structure within modules
    const modulesWithLessons = modulesData.map((module, moduleIndex) => ({
      id: module.id,
      name: module.name,
      order: moduleIndex, // Use array position for order
      lessons: lessonsData
        .filter(lesson => lesson.moduleId === module.id)
        .map((lesson, lessonIndex) => ({
          id: lesson.id,
          title: lesson.title,
          prelearningMaterials: lesson.prelearningMaterials || '',
          guidedInstructions: lesson.guidedInstructions || '',
          handsOnActivities: lesson.handsOnActivities || '',
          order: lessonIndex, // Use array position for order
          createdAt: lesson.createdAt || new Date(),
          updatedAt: new Date()
        }))
    }))

    return {
      name: plan.name,
      description: plan.description || '',
      modules: modulesWithLessons,
      createdAt: plan.createdAt || new Date(),
      updatedAt: new Date()
    }
  }


  const handleDuplicatePlan = (plan) => {
    const duplicatedPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      name: `${plan.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setLessonPlans([...lessonPlans, duplicatedPlan])
    console.log('Plan duplicated:', duplicatedPlan)
  }

  const handleDeletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this lesson plan?')) {
      setLessonPlans(lessonPlans.filter(p => p.id !== planId))
      if (selectedPlan?.id === planId) {
        handleBackToList()
      }
    }
  }

  // If a plan is selected, show the board editor
  if (selectedPlan) {
    return (
      <div style={{ background: '#fafbfc', minHeight: '100vh' }}>
        <div style={{ 
          background: 'white', 
          borderBottom: '1px solid #e1e4e8',
          padding: '0.75rem 1.5rem'
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <Button 
                variant="link" 
                size="sm"
                style={{ color: '#5e6c84', textDecoration: 'none', padding: '0.25rem 0.5rem' }} 
                onClick={handleBackToList}
              >
                ← Back
              </Button>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#172b4d' }}>
                  {selectedPlan.name}
                </h1>
                {selectedPlan.description && (
                  <p style={{ fontSize: '0.875rem', color: '#5e6c84', margin: 0 }}>
                    {selectedPlan.description}
                  </p>
                )}
              </div>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <span style={{ fontSize: '0.75rem', color: '#5e6c84' }}>
                {modules.length} modules · {lessons.length} lessons
              </span>
              {saveStatus === 'saving' && (
                <span style={{ fontSize: '0.75rem', color: '#0079bf', fontWeight: 500 }}>
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && lastSaved && (
                <span style={{ fontSize: '0.75rem', color: '#5e6c84' }}>
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
              {saveStatus === 'unsaved' && (
                <span style={{ fontSize: '0.75rem', color: '#f39c12', fontWeight: 500 }}>
                  Unsaved changes
                </span>
              )}
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => handleDuplicatePlan(selectedPlan)}
              >
                Duplicate
              </Button>
            </div>
          </div>
        </div>
        
        <LessonBoard 
          lessons={lessons}
          modules={modules}
          onLessonsUpdate={handleLessonsUpdate}
          onModulesUpdate={handleModulesUpdate}
          editable={true}
        />
      </div>
    )
  }

  // Show list of lesson plans
  return (
    <div style={{ background: '#fafbfc', minHeight: '100vh', padding: '1.5rem' }}>
      <div style={{ 
        background: 'white',
        borderRadius: '6px',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #e1e4e8'
      }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: '#172b4d' }}>
              Lesson Plans
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#5e6c84', margin: '0.25rem 0 0 0' }}>
              Create and manage your lesson plans
            </p>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowCreateForm(true)}
          >
            + New Plan
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <div style={{ 
          background: 'white',
          borderRadius: '6px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: '1px solid #e1e4e8',
          maxWidth: '600px'
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#172b4d' }}>
            Create New Lesson Plan
          </h2>
          <Form onSubmit={handleCreatePlan}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Plan Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="e.g., Web Development Bootcamp"
                required
                size="sm"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                placeholder="Brief description of this lesson plan"
                size="sm"
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" size="sm">
                Create Plan
              </Button>
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
        {lessonPlans.length === 0 && !showCreateForm ? (
          <div style={{ 
            background: 'white',
            borderRadius: '6px',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #e1e4e8',
            gridColumn: '1 / -1'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#172b4d', marginBottom: '0.5rem' }}>
              No Lesson Plans Yet
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#5e6c84', marginBottom: '1.5rem' }}>
              Create your first lesson plan to start organizing your course content.
            </p>
            <Button 
              variant="primary"
              size="sm"
              onClick={() => setShowCreateForm(true)}
            >
              Create First Plan
            </Button>
          </div>
        ) : (
          lessonPlans.map(plan => (
            <div 
              key={plan.id}
              style={{ 
                background: 'white',
                borderRadius: '6px',
                padding: '1rem',
                border: '1px solid #e1e4e8',
                transition: 'box-shadow 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(9, 30, 66, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#172b4d', margin: 0 }}>
                  {plan.name}
                </h3>
                <Button 
                  variant="link"
                  size="sm"
                  style={{ color: '#dc3545', padding: '0.25rem' }}
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  ×
                </Button>
              </div>
              
              <p style={{ fontSize: '0.875rem', color: '#5e6c84', marginBottom: '0.75rem' }}>
                {plan.description || 'No description'}
              </p>
              
              <div style={{ fontSize: '0.75rem', color: '#5e6c84', marginBottom: '0.75rem' }}>
                {plan.modules?.length || 0} modules · {plan.lessons?.length || 0} lessons
              </div>
              
              <div className="d-flex gap-2">
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => handleSelectPlan(plan)}
                  style={{ flex: 1 }}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleDuplicatePlan(plan)}
                >
                  Duplicate
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default LessonPlansPage
