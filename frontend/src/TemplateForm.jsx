import { useState } from 'react'
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap'
import LessonDetailsForm from './LessonDetailsForm'

function TemplateForm({ onTemplateCreated }) {
  const [step, setStep] = useState(1)
  const [template, setTemplate] = useState({
    name: '',
    lessonDays: [],
    totalLessons: 1
  })
  const [lessons, setLessons] = useState([])

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const handleDayToggle = (day) => {
    setTemplate(prev => ({
      ...prev,
      lessonDays: prev.lessonDays.includes(day)
        ? prev.lessonDays.filter(d => d !== day)
        : [...prev.lessonDays, day]
    }))
  }

  const handleTemplateSubmit = (e) => {
    e.preventDefault()
    setStep(2) // Move to lesson details
  }

  const handleLessonsSubmit = (lessonData) => {
    setLessons(lessonData)
    const finalTemplate = { ...template, lessons: lessonData }
    console.log('Complete template data:', finalTemplate)
    onTemplateCreated(finalTemplate)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleReset = () => {
    setTemplate({
      name: '',
      lessonDays: [],
      totalLessons: 1
    })
    setLessons([])
    setStep(1)
  }

  if (step === 2) {
    return (
      <LessonDetailsForm
        totalLessons={template.totalLessons}
        onLessonsSubmit={handleLessonsSubmit}
        onCancel={handleBack}
      />
    )
  }

  return (
    <Form onSubmit={handleTemplateSubmit}>
      <Card className="mb-4">
        <Card.Header as="h3">Create Schedule Template - Step 1</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Template Name</Form.Label>
            <Form.Control
              type="text"
              value={template.name}
              onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Standard 3-day Course"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Lesson Days</Form.Label>
            <Row>
              {daysOfWeek.map(day => (
                <Col xs={6} md={4} lg={3} key={day} className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id={day}
                    label={day}
                    checked={template.lessonDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                  />
                </Col>
              ))}
            </Row>
            {template.lessonDays.length === 0 && (
              <Alert variant="warning" className="mt-2">
                Please select at least one lesson day
              </Alert>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Total Lessons</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="52"
              value={template.totalLessons}
              onChange={(e) => setTemplate(prev => ({ ...prev, totalLessons: parseInt(e.target.value) || 1 }))}
              required
            />
            <Form.Text className="text-muted">
              Number of lessons in the course
            </Form.Text>
          </Form.Group>

          <Card bg="light" className="mb-4">
            <Card.Header>Preview</Card.Header>
            <Card.Body>
              <p><strong>Name:</strong> {template.name || 'Untitled Template'}</p>
              <p><strong>Lesson Days:</strong> {template.lessonDays.length > 0 ? template.lessonDays.join(', ') : 'None selected'}</p>
              <p><strong>Total Lessons:</strong> {template.totalLessons}</p>
              {template.lessonDays.length > 0 && (
                <p><strong>Duration:</strong> Approximately {Math.ceil(template.totalLessons / template.lessonDays.length)} weeks</p>
              )}
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
            <Button 
              type="submit"
              disabled={template.lessonDays.length === 0 || !template.name.trim()}
            >
              Next: Add Lesson Details
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Form>
  )
}

export default TemplateForm
