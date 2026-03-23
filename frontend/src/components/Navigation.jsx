import { Link, useLocation } from 'wouter'
import { Navbar, Container, Nav } from 'react-bootstrap'

function Navigation() {
  const [location] = useLocation()

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} href="/">
          📚 Lesson Scheduler
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto" activeKey={location}>
            <Nav.Link as={Link} href="/" eventKey="/">
              🏠 Home
            </Nav.Link>
            <Nav.Link as={Link} href="/lesson-plans" eventKey="/lesson-plans">
              � Lesson Plans
            </Nav.Link>
            <Nav.Link as={Link} href="/intakes" eventKey="/intakes">
              � Intakes
            </Nav.Link>
            <Nav.Link as={Link} href="/students/intakes" eventKey="/students/intakes">
              Student View
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation
