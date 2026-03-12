import { Container, Row, Col, Card } from 'react-bootstrap'
import TemplateForm from '../TemplateForm'

function TemplatesPage() {
  const handleTemplateCreated = (template) => {
    console.log('Template created:', template)
    // TODO: Save template to backend
  }

  return (
    <Container className="py-4">
      <Row className="text-center mb-4">
        <Col>
          <h1 className="display-5 fw-bold">Lesson Templates</h1>
          <p className="lead text-muted">
            Create reusable templates for your courses
          </p>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Body>
              <TemplateForm onTemplateCreated={handleTemplateCreated} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default TemplatesPage
