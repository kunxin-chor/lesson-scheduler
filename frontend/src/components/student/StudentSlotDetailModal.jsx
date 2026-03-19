import { Modal, Button, Badge } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

function StudentSlotDetailModal({ slot, show, onHide }) {
  if (!slot) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{slot.title || 'Class Slot Details'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Date:</strong> {new Date(slot.start).toLocaleDateString()}</p>
        <p><strong>Time:</strong> {`${new Date(slot.start).toLocaleTimeString()} - ${new Date(slot.end).toLocaleTimeString()}`}</p>
        {slot.lesson ? (
          <>
            <hr />
            <h6>Lesson Details</h6>
            {slot.lesson.moduleName && (
              <p><strong>Module:</strong> {slot.lesson.moduleName}</p>
            )}
            {slot.lesson.prelearningMaterials && (
              <div className="mb-3">
                <strong>Pre-learning Materials:</strong>
                <div className="p-2 border rounded bg-light" style={{ marginTop: '0.5rem' }}>
                  <ReactMarkdown>{slot.lesson.prelearningMaterials}</ReactMarkdown>
                </div>
              </div>
            )}
            {slot.lesson.guidedInstructions && (
              <div className="mb-3">
                <strong>Guided Instructions:</strong>
                <div className="p-2 border rounded bg-light" style={{ marginTop: '0.5rem' }}>
                  <ReactMarkdown>{slot.lesson.guidedInstructions}</ReactMarkdown>
                </div>
              </div>
            )}
            {slot.lesson.handsOnActivities && (
              <div className="mb-3">
                <strong>Hands-On Activities:</strong>
                <div className="p-2 border rounded bg-light" style={{ marginTop: '0.5rem' }}>
                  <ReactMarkdown>{slot.lesson.handsOnActivities}</ReactMarkdown>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted">No lesson assigned to this slot.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default StudentSlotDetailModal;
