import { useReducer, useEffect, useRef, useCallback } from 'react'
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Spinner } from 'react-bootstrap'
import { useLocation, useRoute } from 'wouter'
import LessonBoard from '../LessonBoard'
import { lessonPlanReducer, initialState, LESSON_PLAN_ACTIONS } from '../reducers/lessonPlanReducer'
import { lessonPlanService } from '../services/lessonPlanService'
import { transformFromBackend, transformToBackend } from '../utils/lessonPlanTransform'

function LessonPlansPage() {
  const [state, dispatch] = useReducer(lessonPlanReducer, initialState)
  const debounceTimerRef = useRef(null)
  const [location, setLocation] = useLocation()
  const [match, params] = useRoute('/lesson-plans/:planId')
  
  const { lessonPlans, selectedPlan, modules, lessons, assignments, showCreateForm, saveStatus, lastSaved, loading, error } = state

  const performSave = useCallback(async () => {
    if (!selectedPlan) return

    dispatch({ type: LESSON_PLAN_ACTIONS.SET_SAVE_STATUS, payload: 'saving' })
    
    try {
      // Generate database-compatible JSON
      console.log('📊 Before transform:', {
        modulesCount: modules.length,
        lessonsCount: lessons.length,
        assignmentsCount: assignments.length,
        assignments: assignments
      })
      
      const dbJSON = transformToBackend(selectedPlan, modules, lessons, assignments)
      
      console.log('=== LESSON PLAN JSON FOR DATABASE ===')
      console.log(JSON.stringify(dbJSON, null, 2))
      console.log('=====================================')
      
      // Update in backend
      await lessonPlanService.update(selectedPlan.id, dbJSON)
      
      dispatch({ type: LESSON_PLAN_ACTIONS.UPDATE_LESSON_PLAN })
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_SAVE_STATUS, payload: 'saved' })
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_LAST_SAVED, payload: new Date() })
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_ERROR, payload: null })
    } catch (error) {
      console.error('Failed to save lesson plan:', error)
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_SAVE_STATUS, payload: 'unsaved' })
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_ERROR, payload: 'Failed to save changes' })
    }
  }, [selectedPlan, modules, lessons, assignments])

  const debouncedSave = () => {
    dispatch({ type: LESSON_PLAN_ACTIONS.SET_SAVE_STATUS, payload: 'unsaved' })
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(performSave, 2000) // 2 second debounce
  }

  const immediateSave = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    performSave()
  }

  const handleLessonsUpdate = (updatedLessons, isStructuralChange = false) => {
    dispatch({ type: LESSON_PLAN_ACTIONS.UPDATE_LESSONS, payload: updatedLessons })
    dispatch({ type: LESSON_PLAN_ACTIONS.SET_SAVE_STATUS, payload: 'unsaved' })
  }

  const handleModulesUpdate = (updatedModules, isStructuralChange = false) => {
    dispatch({ type: LESSON_PLAN_ACTIONS.UPDATE_MODULES, payload: updatedModules })
    dispatch({ type: LESSON_PLAN_ACTIONS.SET_SAVE_STATUS, payload: 'unsaved' })
  }

  const handleAssignmentsUpdate = (updatedAssignments, isStructuralChange = false) => {
    dispatch({ type: LESSON_PLAN_ACTIONS.UPDATE_ASSIGNMENTS, payload: updatedAssignments })
    dispatch({ type: LESSON_PLAN_ACTIONS.SET_SAVE_STATUS, payload: 'unsaved' })
  }

  // Auto-save when lessons, modules, or assignments change
  useEffect(() => {
    if (!selectedPlan || saveStatus === 'saved' || saveStatus === 'saving') return
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSave()
    }, 2000)
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [lessons, modules, assignments, selectedPlan, saveStatus, performSave])

  // Fetch lesson plans on mount
  useEffect(() => {
    const fetchLessonPlans = async () => {
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_LOADING, payload: true })
      try {
        const plans = await lessonPlanService.getAll()
        const transformedPlans = plans.map(transformFromBackend)
        dispatch({ type: LESSON_PLAN_ACTIONS.SET_LESSON_PLANS, payload: transformedPlans })
        dispatch({ type: LESSON_PLAN_ACTIONS.SET_ERROR, payload: null })
      } catch (error) {
        console.error('Failed to fetch lesson plans:', error)
        dispatch({ type: LESSON_PLAN_ACTIONS.SET_ERROR, payload: 'Failed to load lesson plans' })
      } finally {
        dispatch({ type: LESSON_PLAN_ACTIONS.SET_LOADING, payload: false })
      }
    }
    
    fetchLessonPlans()
  }, [])

  // Select plan from URL parameter when plans are loaded
  useEffect(() => {
    if (params?.planId && lessonPlans.length > 0 && !selectedPlan) {
      const planToSelect = lessonPlans.find(p => p.id === params.planId)
      if (planToSelect) {
        dispatch({ type: LESSON_PLAN_ACTIONS.SELECT_LESSON_PLAN, payload: planToSelect })
      }
    }
  }, [params?.planId, lessonPlans, selectedPlan])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleCreatePlan = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    const newPlanData = {
      name: formData.get('name'),
      description: formData.get('description'),
      modules: [],
    }
    
    dispatch({ type: LESSON_PLAN_ACTIONS.SET_LOADING, payload: true })
    try {
      const createdPlan = await lessonPlanService.create(newPlanData)
      const transformedPlan = transformFromBackend(createdPlan)
      
      dispatch({
        type: LESSON_PLAN_ACTIONS.SET_LESSON_PLANS,
        payload: [...lessonPlans, transformedPlan]
      })
      dispatch({ type: LESSON_PLAN_ACTIONS.TOGGLE_CREATE_FORM, payload: false })
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_ERROR, payload: null })
      
      e.target.reset()
      console.log('New lesson plan created:', transformedPlan)
    } catch (error) {
      console.error('Failed to create lesson plan:', error)
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_ERROR, payload: 'Failed to create lesson plan' })
    } finally {
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_LOADING, payload: false })
    }
  }

  const handleSelectPlan = (plan) => {
    dispatch({ type: LESSON_PLAN_ACTIONS.SELECT_LESSON_PLAN, payload: plan })
    setLocation(`/lesson-plans/${plan.id}`)
  }

  const handleBackToList = () => {
    dispatch({ type: LESSON_PLAN_ACTIONS.DESELECT_LESSON_PLAN })
    setLocation('/lesson-plans')
  }


  const handleDuplicatePlan = async (plan) => {
    const duplicateData = {
      name: `${plan.name} (Copy)`,
      description: plan.description,
      modules: plan.modules || [],
    }
    
    dispatch({ type: LESSON_PLAN_ACTIONS.SET_LOADING, payload: true })
    try {
      const createdPlan = await lessonPlanService.create(duplicateData)
      const transformedPlan = transformFromBackend(createdPlan)
      
      dispatch({
        type: LESSON_PLAN_ACTIONS.SET_LESSON_PLANS,
        payload: [...lessonPlans, transformedPlan]
      })
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_ERROR, payload: null })
      console.log('Plan duplicated:', transformedPlan)
    } catch (error) {
      console.error('Failed to duplicate lesson plan:', error)
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_ERROR, payload: 'Failed to duplicate lesson plan' })
    } finally {
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_LOADING, payload: false })
    }
  }

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this lesson plan?')) {
      return
    }
    
    dispatch({ type: LESSON_PLAN_ACTIONS.SET_LOADING, payload: true })
    try {
      await lessonPlanService.delete(planId)
      dispatch({ type: LESSON_PLAN_ACTIONS.DELETE_LESSON_PLAN, payload: planId })
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_ERROR, payload: null })
      console.log('Plan deleted:', planId)
    } catch (error) {
      console.error('Failed to delete lesson plan:', error)
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_ERROR, payload: 'Failed to delete lesson plan' })
    } finally {
      dispatch({ type: LESSON_PLAN_ACTIONS.SET_LOADING, payload: false })
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
                {modules.length} modules · {lessons.length} lessons · {assignments.length} assignments
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
          assignments={assignments}
          onLessonsUpdate={handleLessonsUpdate}
          onModulesUpdate={handleModulesUpdate}
          onAssignmentsUpdate={handleAssignmentsUpdate}
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
            onClick={() => dispatch({ type: LESSON_PLAN_ACTIONS.TOGGLE_CREATE_FORM, payload: true })}
            disabled={loading}
          >
            + New Plan
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => dispatch({ type: LESSON_PLAN_ACTIONS.SET_ERROR, payload: null })}>
          {error}
        </Alert>
      )}

      {loading && !lessonPlans.length && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3" style={{ color: '#5e6c84' }}>Loading lesson plans...</p>
        </div>
      )}

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
                onClick={() => dispatch({ type: LESSON_PLAN_ACTIONS.TOGGLE_CREATE_FORM, payload: false })}
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
              onClick={() => dispatch({ type: LESSON_PLAN_ACTIONS.TOGGLE_CREATE_FORM, payload: true })}
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
