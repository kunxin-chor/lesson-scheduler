import { Modal, Button, Badge, Card } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'

function ClassSlotDetailModal({ show, onHide, slot }) {
  if (!slot) return null

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const hasLessonContent = slot.lesson && (
    slot.lesson.title ||
    slot.lesson.prelearningMaterials ||
    slot.lesson.guidedInstructions ||
    slot.lesson.handsOnActivities
  )

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Class Slot Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <h5>Slot Information</h5>
          <p><strong>Date:</strong> {formatDate(slot.date)}</p>
          <p>
            <strong>Time Slot:</strong>{' '}
            <Badge bg={
              slot.timeSlot === 'morning' ? 'info' :
              slot.timeSlot === 'afternoon' ? 'warning' : 'dark'
            }>
              {slot.timeSlot}
            </Badge>
          </p>
          <p>
            <strong>Type:</strong>{' '}
            {slot.isManuallyAdded ? (
              <Badge bg="success">Manual</Badge>
            ) : (
              <Badge bg="secondary">Generated</Badge>
            )}
          </p>
          {slot.lessonIndex !== undefined && (
            <p><strong>Lesson Number:</strong> {slot.lessonIndex + 1}</p>
          )}
        </div>

        {hasLessonContent ? (
          <div>
            <h5 className="mb-3">Lesson Plan Details</h5>
            
            {slot.lesson.moduleName && (
              <div className="mb-3">
                <Badge bg="primary" className="mb-2">Module: {slot.lesson.moduleName}</Badge>
              </div>
            )}

            {slot.lesson.title && (
              <Card className="mb-3">
                <Card.Header className="bg-primary text-white">
                  <h6 className="mb-0">📚 Lesson Title</h6>
                </Card.Header>
                <Card.Body>
                  <h5>{slot.lesson.title}</h5>
                </Card.Body>
              </Card>
            )}

            {slot.lesson.prelearningMaterials && (
              <Card className="mb-3">
                <Card.Header className="bg-info text-white">
                  <h6 className="mb-0">📖 Pre-learning Materials</h6>
                </Card.Header>
                <Card.Body>
                  <ReactMarkdown>{slot.lesson.prelearningMaterials}</ReactMarkdown>
                </Card.Body>
              </Card>
            )}

            {slot.lesson.guidedInstructions && (
              <Card className="mb-3">
                <Card.Header className="bg-success text-white">
                  <h6 className="mb-0">🎯 Guided Instructions</h6>
                </Card.Header>
                <Card.Body>
                  <ReactMarkdown>{slot.lesson.guidedInstructions}</ReactMarkdown>
                </Card.Body>
              </Card>
            )}

            {slot.lesson.handsOnActivities && (
              <Card className="mb-3">
                <Card.Header className="bg-warning text-dark">
                  <h6 className="mb-0">✋ Hands-On Activities</h6>
                </Card.Header>
                <Card.Body>
                  <ReactMarkdown>{slot.lesson.handsOnActivities}</ReactMarkdown>
                </Card.Body>
              </Card>
            )}
          </div>
        ) : (
          <div className="alert alert-info">
            <p className="mb-0">No lesson plan assigned to this slot.</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ClassSlotDetailModal
