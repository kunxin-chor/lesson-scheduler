import { useState } from 'react'
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap'

function IntakesPage() {
  const [intakes, setIntakes] = useState([])
  const [lessonPlans, setLessonPlans] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const handleCreateIntake = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newIntake = {
      id: `intake-${Date.now()}`,
      name: formData.get('name'),
      lessonPlanId: formData.get('lessonPlanId'),
      startDate: formData.get('startDate'),
      lessonDays: formData.getAll('lessonDays'),
      status: 'active'
    }
    
    setIntakes([...intakes, newIntake])
    setShowCreateForm(false)
    e.target.reset()
    console.log('New intake created:', newIntake)
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

      {showCreateForm && (
        <Row className="mb-4">
          <Col lg={8} className="mx-auto">
            <Card>
              <Card.Header as="h5">Create New Intake</Card.Header>
              <Card.Body>
                <Form onSubmit={handleCreateIntake}>
                  <Form.Group className="mb-3">
                    <Form.Label>Intake Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="e.g., January 2024 Intake"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Lesson Plan</Form.Label>
                    <Form.Select name="lessonPlanId" required>
                      <option value="">Select a lesson plan</option>
                      {lessonPlans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </Form.Select>
                    {lessonPlans.length === 0 && (
                      <Form.Text className="text-warning">
                        No lesson plans available. Create a lesson plan first.
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Lesson Days</Form.Label>
                    <div>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                        <Form.Check
                          key={day}
                          type="checkbox"
                          name="lessonDays"
                          value={day}
                          label={day}
                          inline
                        />
                      ))}
                    </div>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary">
                      Create Intake
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
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
                  <p><strong>Lesson Days:</strong> {intake.lessonDays.join(', ')}</p>
                  <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm">
                      📅 View Schedule
                    </Button>
                    <Button variant="outline-secondary" size="sm">
                      ⚙️ Manage
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
