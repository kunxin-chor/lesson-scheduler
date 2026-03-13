import { useState } from 'react'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'
import IntakeFormModal from '../components/IntakeFormModal'
import ClassSlotManager from '../components/ClassSlotManager'
import RegenerateCalendarModal from '../components/RegenerateCalendarModal'
import { generateClassSlots, regenerateClassSlots } from '../utils/classSlotGenerator'

function IntakesPage() {
  const [intakes, setIntakes] = useState([])
  const [lessonPlans, setLessonPlans] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSlotManager, setShowSlotManager] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [selectedIntake, setSelectedIntake] = useState(null)

  const handleCreateIntake = (intakeData) => {
    const classSlots = generateClassSlots(
      intakeData.startDate,
      intakeData.classSlotPatterns,
      intakeData.exceptions
    )

    const newIntake = {
      id: `intake-${Date.now()}`,
      name: intakeData.name,
      lessonPlanId: intakeData.lessonPlanId,
      startDate: intakeData.startDate,
      classSlotPatterns: intakeData.classSlotPatterns,
      exceptions: intakeData.exceptions,
      classSlots: classSlots,
      status: 'active',
      createdAt: new Date()
    }
    
    setIntakes([...intakes, newIntake])
    setShowCreateForm(false)
  }

  const handleDeleteIntake = (intakeId) => {
    if (window.confirm('Are you sure you want to delete this intake?')) {
      setIntakes(intakes.filter(i => i.id !== intakeId))
    }
  }

  const getLessonPlanName = (planId) => {
    const plan = lessonPlans.find(p => p.id === planId)
    return plan ? plan.name : 'Unknown Plan'
  }

  const handleManageSlots = (intake) => {
    setSelectedIntake(intake)
    setShowSlotManager(true)
  }

  const handleRegenerateCalendar = (intake) => {
    setSelectedIntake(intake)
    setShowRegenerateModal(true)
  }

  const handleSlotsUpdate = (updatedSlots) => {
    setIntakes(intakes.map(intake => 
      intake.id === selectedIntake.id
        ? { ...intake, classSlots: updatedSlots }
        : intake
    ))
    setShowSlotManager(false)
  }

  const handleRegenerateSubmit = (updatedConfig) => {
    const updatedIntake = {
      ...selectedIntake,
      classSlotPatterns: updatedConfig.classSlotPatterns,
      exceptions: updatedConfig.exceptions
    }

    const newClassSlots = regenerateClassSlots(updatedIntake)

    setIntakes(intakes.map(intake => 
      intake.id === selectedIntake.id
        ? { ...updatedIntake, classSlots: newClassSlots }
        : intake
    ))
    setShowRegenerateModal(false)
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
              onClick={() => setShowCreateForm(true)}
            >
              ➕ Create New Intake
            </Button>
          </div>
        </Col>
      </Row>

      <IntakeFormModal
        show={showCreateForm}
        onHide={() => setShowCreateForm(false)}
        onSubmit={handleCreateIntake}
        lessonPlans={lessonPlans}
      />

      {selectedIntake && (
        <>
          <ClassSlotManager
            show={showSlotManager}
            onHide={() => setShowSlotManager(false)}
            intake={selectedIntake}
            classSlots={selectedIntake.classSlots}
            onSlotsUpdate={handleSlotsUpdate}
          />

          <RegenerateCalendarModal
            show={showRegenerateModal}
            onHide={() => setShowRegenerateModal(false)}
            intake={selectedIntake}
            onRegenerate={handleRegenerateSubmit}
          />
        </>
      )}

      <Row>
        {intakes.length === 0 ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <h4>No Intakes Created</h4>
                <p className="text-muted">
                  Create your first intake to get started with course management.
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => setShowCreateForm(true)}
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
