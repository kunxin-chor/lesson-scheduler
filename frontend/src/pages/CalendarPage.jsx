import { Container, Row, Col, Card } from 'react-bootstrap'

function CalendarPage() {
  return (
    <Container className="py-4">
      <Row className="text-center mb-4">
        <Col>
          <h1 className="display-5 fw-bold">Calendar View</h1>
          <p className="lead text-muted">
            View and export your course schedules
          </p>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="text-center py-5">
            <Card.Body>
              <div className="display-1 mb-3">📅</div>
              <Card.Title as="h2">Calendar Coming Soon</Card.Title>
              <Card.Text className="text-muted">
                Generate and export calendar views from your lesson boards
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default CalendarPage
