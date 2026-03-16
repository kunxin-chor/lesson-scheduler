import { useReducer, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap'
import IntakeFormModal from '../components/IntakeFormModal'
import ClassSlotManager from '../components/ClassSlotManager'
import RegenerateCalendarModal from '../components/RegenerateCalendarModal'
import { generateClassSlots, regenerateClassSlots } from '../utils/classSlotGenerator'
import { intakeReducer, initialState, INTAKE_ACTIONS } from '../reducers/intakeReducer'
import { intakeService } from '../services/intakeService'
import { lessonPlanService } from '../services/lessonPlanService'
import { transformFromBackend } from '../utils/lessonPlanTransform'
function IntakesPage() {
  const [state, dispatch] = useReducer(intakeReducer, initialState)
  const { intakes, lessonPlans, selectedIntake, showCreateForm, showSlotManager, showRegenerateModal, loading, error } = state
  // Fetch intakes and lesson plans on mount
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: INTAKE_ACTIONS.SET_LOADING, payload: true })
      try {
        const [intakesData, plansData] = await Promise.all([
          intakeService.getAll(),
          lessonPlanService.getAll()
        ])
        console.log('📥 Fetched intakes:', intakesData)
        console.log('📥 First intake structure:', intakesData[0])
        dispatch({ type: INTAKE_ACTIONS.SET_INTAKES, payload: intakesData })
        dispatch({ type: INTAKE_ACTIONS.SET_LESSON_PLANS, payload: plansData.map(transformFromBackend) })
        dispatch({ type: INTAKE_ACTIONS.SET_ERROR, payload: null })
      } catch (error) {
        console.error('Failed to fetch data:', error)
        dispatch({ type: INTAKE_ACTIONS.SET_ERROR, payload: 'Failed to load intakes' })
      } finally {
        dispatch({ type: INTAKE_ACTIONS.SET_LOADING, payload: false })
      }
    }
    fetchData()
  }, [])
  const handleCreateIntake = async (intakeData) => {
    console.log('🔍 Creating intake with data:', intakeData)
    console.log('🔍 numberOfLessons:', intakeData.numberOfLessons)
    console.log('🔍 generationMethod:', intakeData.generationMethod)
    // Generate class slots based on the selected method
    const classSlots = generateClassSlots(
      intakeData.startDate,
      intakeData.classSlotPatterns,
      intakeData.exceptions,
      52, // numberOfWeeks (used only if no endDate or numberOfLessons)
      intakeData.numberOfLessons, // numberOfLessons (for 'auto' or 'manual' methods)
      intakeData.endDate // endDate (for 'endDate' method)
    )
    console.log('🔍 Generated slots count:', classSlots.length)
    const newIntakeData = {
      name: intakeData.name,
      lessonPlanId: intakeData.lessonPlanId,
      startDate: intakeData.startDate,
      classSlotPatterns: intakeData.classSlotPatterns,
      exceptions: intakeData.exceptions,
      classSlots: classSlots,
      status: 'active',
    }
    dispatch({ type: INTAKE_ACTIONS.SET_LOADING, payload: true })
    try {
      const createdIntake = await intakeService.create(newIntakeData)
      console.log('✅ Created intake from API:', createdIntake)
      console.log('✅ Created intake.id:', createdIntake?.id)
      console.log('✅ Created intake._id:', createdIntake?._id)
      dispatch({ type: INTAKE_ACTIONS.CREATE_INTAKE, payload: createdIntake })
      dispatch({ type: INTAKE_ACTIONS.SET_ERROR, payload: null })
    } catch (error) {
      console.error('Failed to create intake:', error)
      dispatch({ type: INTAKE_ACTIONS.SET_ERROR, payload: 'Failed to create intake' })
    } finally {
      dispatch({ type: INTAKE_ACTIONS.SET_LOADING, payload: false })
    }
  }
  const handleDeleteIntake = async (intakeId) => {
    if (!window.confirm('Are you sure you want to delete this intake?')) return
    dispatch({ type: INTAKE_ACTIONS.SET_LOADING, payload: true })
    try {
      await intakeService.delete(intakeId)
      dispatch({ type: INTAKE_ACTIONS.DELETE_INTAKE, payload: intakeId })
      dispatch({ type: INTAKE_ACTIONS.SET_ERROR, payload: null })
    } catch (error) {
      console.error('Failed to delete intake:', error)
      dispatch({ type: INTAKE_ACTIONS.SET_ERROR, payload: 'Failed to delete intake' })
    } finally {
      dispatch({ type: INTAKE_ACTIONS.SET_LOADING, payload: false })
    }
  }
  const getLessonPlanName = (planId) => {
    const plan = lessonPlans.find(p => p.id === planId)
    return plan ? plan.name : 'Unknown Plan'
  }
  const handleManageSlots = (intake) => {
    console.log('🎯 handleManageSlots - intake:', intake)
    console.log('🎯 handleManageSlots - intake.id:', intake?.id)
    console.log('🎯 handleManageSlots - intake._id:', intake?._id)
    dispatch({ type: INTAKE_ACTIONS.SELECT_INTAKE, payload: intake })
    dispatch({ type: INTAKE_ACTIONS.TOGGLE_SLOT_MANAGER, payload: true })
  }
  const handleRegenerateCalendar = (intake) => {
    dispatch({ type: INTAKE_ACTIONS.SELECT_INTAKE, payload: intake })
    dispatch({ type: INTAKE_ACTIONS.TOGGLE_REGENERATE_MODAL, payload: true })
  }
  const handleSlotsUpdate = async (updatedSlots) => {
    console.log('🔍 selectedIntake:', selectedIntake)
    console.log('🔍 selectedIntake.id:', selectedIntake?.id)
    console.log('🔍 selectedIntake._id:', selectedIntake?._id)
    dispatch({ type: INTAKE_ACTIONS.SET_LOADING, payload: true })
    try {
      const updatedIntake = await intakeService.updateClassSlots(selectedIntake.id, updatedSlots)
      dispatch({ type: INTAKE_ACTIONS.UPDATE_INTAKE, payload: updatedIntake })
      dispatch({ type: INTAKE_ACTIONS.TOGGLE_SLOT_MANAGER, payload: false })
      dispatch({ type: INTAKE_ACTIONS.SET_ERROR, payload: null })
    } catch (error) {
      console.error('Failed to update class slots:', error)
      dispatch({ type: INTAKE_ACTIONS.SET_ERROR, payload: 'Failed to update class slots' })
    } finally {
      dispatch({ type: INTAKE_ACTIONS.SET_LOADING, payload: false })
    }
  }
  const handleRegenerateSubmit = async (updatedConfig) => {
    dispatch({ type: INTAKE_ACTIONS.SET_LOADING, payload: true })
    try {
      console.log('🔄 Regenerating with config:', updatedConfig)
      console.log('🔄 Selected intake:', selectedIntake)
      
      // Calculate numberOfLessons from lesson plan
      let numberOfLessons = null
      if (selectedIntake.lessonPlanId) {
        const lessonPlan = lessonPlans.find(p => p.id === selectedIntake.lessonPlanId)
        console.log('🔄 Found lesson plan:', lessonPlan)
        if (lessonPlan?.lessons) {
          numberOfLessons = lessonPlan.lessons.length
          console.log('🔄 Lessons from plan:', numberOfLessons)
        }
      }
      
      // Fallback to original slot count
      if (!numberOfLessons && selectedIntake.classSlots?.length) {
        numberOfLessons = selectedIntake.classSlots.length
        console.log('🔄 Using original slot count:', numberOfLessons)
      }
      
      // Generate class slots using the SAME function as create intake
      const classSlots = generateClassSlots(
        selectedIntake.startDate,
        updatedConfig.classSlotPatterns,
        updatedConfig.exceptions,
        52, // numberOfWeeks (default)
        numberOfLessons, // Use calculated lesson count
        null // endDate (null = use weeks)
      )
      console.log('🔄 Generated slots count:', classSlots.length)
      // Send the generated slots along with patterns and exceptions
      const regeneratedIntake = await intakeService.regenerate(selectedIntake.id, {
        ...updatedConfig,
        classSlots
      })
      dispatch({ type: INTAKE_ACTIONS.UPDATE_INTAKE, payload: regeneratedIntake })
      dispatch({ type: INTAKE_ACTIONS.TOGGLE_REGENERATE_MODAL, payload: false })
      dispatch({ type: INTAKE_ACTIONS.SET_ERROR, payload: null })
    } catch (error) {
      console.error('Failed to regenerate intake:', error)
      dispatch({ type: INTAKE_ACTIONS.SET_ERROR, payload: 'Failed to regenerate intake' })
    } finally {
      dispatch({ type: INTAKE_ACTIONS.SET_LOADING, payload: false })
    }
  }
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-5 fw-bold">Intakes</h1>
              <p className="lead text-muted">
                Manage course intakes and apply lesson plans
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => dispatch({ type: INTAKE_ACTIONS.TOGGLE_CREATE_FORM, payload: true })}
            >
              ➕ Create New Intake
            </Button>
          </div>
        </Col>
      </Row>
      {error && (
        <Alert variant="danger" dismissible onClose={() => dispatch({ type: INTAKE_ACTIONS.SET_ERROR, payload: null })}>
          {error}
        </Alert>
      )}
      <IntakeFormModal
        show={showCreateForm}
        onHide={() => dispatch({ type: INTAKE_ACTIONS.TOGGLE_CREATE_FORM, payload: false })}
        onSubmit={handleCreateIntake}
        lessonPlans={lessonPlans}
      />
      {selectedIntake && (
        <>
          <ClassSlotManager
            show={showSlotManager}
            onHide={() => dispatch({ type: INTAKE_ACTIONS.TOGGLE_SLOT_MANAGER, payload: false })}
            intake={selectedIntake}
            classSlots={selectedIntake.classSlots}
            onSlotsUpdate={handleSlotsUpdate}
          />
          <RegenerateCalendarModal
            show={showRegenerateModal}
            onHide={() => dispatch({ type: INTAKE_ACTIONS.TOGGLE_REGENERATE_MODAL, payload: false })}
            intake={selectedIntake}
            onRegenerate={handleRegenerateSubmit}
          />
        </>
      )}
      {loading && !intakes.length && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3" style={{ color: '#5e6c84' }}>Loading intakes...</p>
        </div>
      )}
      <Row>
        {!loading && intakes.length === 0 ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <h4>No Intakes Created</h4>
                <p className="text-muted">
                  Create your first intake to get started with course management.
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => dispatch({ type: INTAKE_ACTIONS.TOGGLE_CREATE_FORM, payload: true })}
                >
                  Create First Intake
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          intakes.map(intake => (
            <Col lg={6} className="mb-4" key={intake.id}>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{intake.name}</h5>
                  <div className="d-flex gap-2">
                    <Badge bg="success">{intake.status}</Badge>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteIntake(intake.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p><strong>Lesson Plan:</strong> {getLessonPlanName(intake.lessonPlanId)}</p>
                  <p><strong>Start Date:</strong> {new Date(intake.startDate).toLocaleDateString()}</p>
                  <p><strong>Class Slots:</strong> {intake.classSlots?.length || 0} slots generated</p>
                  <p><strong>Patterns:</strong> {intake.classSlotPatterns?.length || 0} configured</p>
                  <p><strong>Exceptions:</strong> {intake.exceptions?.length || 0} dates</p>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleManageSlots(intake)}
                    >
                      📅 Manage Slots
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      size="sm"
                      onClick={() => handleRegenerateCalendar(intake)}
                    >
                      🔄 Regenerate Calendar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  )
}
export default IntakesPage
