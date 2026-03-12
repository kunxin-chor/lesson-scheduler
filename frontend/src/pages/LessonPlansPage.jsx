import { useState } from 'react'
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap'
import LessonBoard from '../LessonBoard'

function LessonPlansPage() {
  const [lessonPlans, setLessonPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleLessonsUpdate = (updatedLessons) => {
    setLessons(updatedLessons)
    console.log('Lessons updated:', updatedLessons)
  }

  const handleModulesUpdate = (updatedModules) => {
    setModules(updatedModules)
    console.log('Modules updated:', updatedModules)
  }

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

  const handleSavePlan = () => {
    if (selectedPlan) {
      const updatedPlan = {
        ...selectedPlan,
        modules,
        lessons,
        updatedAt: new Date()
      }
      
      setLessonPlans(lessonPlans.map(p => 
        p.id === selectedPlan.id ? updatedPlan : p
      ))
      setSelectedPlan(updatedPlan)
      console.log('Lesson plan saved:', updatedPlan)
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
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={handleBackToList}
                  className="mb-2"
                >
                  ← Back to Lesson Plans
                </Button>
                <h1 className="display-5 fw-bold">{selectedPlan.name}</h1>
                <p className="text-muted">{selectedPlan.description}</p>
              </div>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => handleDuplicatePlan(selectedPlan)}>
                  📋 Duplicate
                </Button>
                <Button variant="primary" onClick={handleSavePlan}>
                  💾 Save Plan
                </Button>
              </div>
            </div>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col>
            <Card bg="light">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Created: {selectedPlan.createdAt.toLocaleDateString()} | 
                    Updated: {selectedPlan.updatedAt.toLocaleDateString()}
                  </small>
                </div>
                <Badge bg="info">{modules.length} modules, {lessons.length} lessons</Badge>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <LessonBoard 
          lessons={lessons}
          modules={modules}
          onLessonsUpdate={handleLessonsUpdate}
          onModulesUpdate={handleModulesUpdate}
          editable={true}
        />
      </Container>
    )
  }

  // Show list of lesson plans
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-5 fw-bold">Lesson Plans</h1>
              <p className="lead text-muted">
                Create and manage your lesson plans
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowCreateForm(true)}
            >
              ➕ Create New Plan
            </Button>
          </div>
        </Col>
      </Row>

      {showCreateForm && (
        <Row className="mb-4">
          <Col lg={8} className="mx-auto">
            <Card>
              <Card.Header as="h5">Create New Lesson Plan</Card.Header>
              <Card.Body>
                <Form onSubmit={handleCreatePlan}>
                  <Form.Group className="mb-3">
                    <Form.Label>Plan Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="e.g., Web Development Bootcamp"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      rows={3}
                      placeholder="Brief description of this lesson plan"
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary">
                      Create Plan
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
        {lessonPlans.length === 0 ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <div className="display-1 mb-3">📋</div>
                <h4>No Lesson Plans Yet</h4>
                <p className="text-muted">
                  Create your first lesson plan to start organizing your course content.
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => setShowCreateForm(true)}
                >
                  Create First Plan
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          lessonPlans.map(plan => (
            <Col lg={6} className="mb-4" key={plan.id}>
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{plan.name}</h5>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    🗑️
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Card.Text className="text-muted">
                    {plan.description || 'No description'}
                  </Card.Text>
                  <div className="mb-3">
                    <Badge bg="secondary" className="me-2">
                      {plan.modules?.length || 0} modules
                    </Badge>
                    <Badge bg="secondary">
                      {plan.lessons?.length || 0} lessons
                    </Badge>
                  </div>
                  <small className="text-muted d-block mb-3">
                    Last updated: {plan.updatedAt.toLocaleDateString()}
                  </small>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      onClick={() => handleSelectPlan(plan)}
                    >
                      ✏️ Edit Plan
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => handleDuplicatePlan(plan)}
                    >
                      📋 Duplicate
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

export default LessonPlansPage
