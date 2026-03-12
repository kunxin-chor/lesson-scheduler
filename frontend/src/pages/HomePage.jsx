import { Link } from 'wouter'
import { Container, Row, Col, Card } from 'react-bootstrap'

function HomePage() {
  return (
    <Container className="py-5">
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-4 fw-bold">Lesson Material Scheduler</h1>
          <p className="lead text-muted">
            Create and manage lesson plans for your courses
          </p>
        </Col>
      </Row>
      
      <Row xs={1} md={2} lg={3} className="g-4">
        <Col>
          <Card as={Link} href="/lesson-plans" className="text-decoration-none h-100 action-card">
            <Card.Body className="text-center">
              <div className="display-1 mb-3">📋</div>
              <Card.Title>Lesson Plans</Card.Title>
              <Card.Text className="text-muted">
                Create and organize your lesson plans with modules
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col>
          <Card as={Link} href="/intakes" className="text-decoration-none h-100 action-card">
            <Card.Body className="text-center">
              <div className="display-1 mb-3">📝</div>
              <Card.Title>Intakes</Card.Title>
              <Card.Text className="text-muted">
                Manage course intakes and apply lesson plans
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default HomePage
