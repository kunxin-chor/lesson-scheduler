import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function AssignmentEditModal({ show, onHide, assignment, onSave, onDelete }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationDays, setDurationDays] = useState(1)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title || '')
      setDescription(assignment.description || '')
      setDurationDays(assignment.durationDays || 1)
    } else {
      setTitle('')
      setDescription('')
      setDurationDays(1)
    }
  }, [assignment, show])

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter an assignment title')
      return
    }

    const assignmentData = {
      id: assignment?.id || `assignment-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      durationDays: parseInt(durationDays) || 1,
    }

    onSave(assignmentData)
    onHide()
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      onDelete(assignment.id)
      onHide()
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{assignment ? 'Edit Assignment' : 'New Assignment'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Duration (Days)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="Number of days"
            />
            <Form.Text className="text-muted">
              How many days this assignment spans
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="mb-0">Description</Form.Label>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>
            {showPreview ? (
              <div className="border rounded p-3 bg-light" style={{ minHeight: '200px' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {description || '*No description*'}
                </ReactMarkdown>
              </div>
            ) : (
              <Form.Control
                as="textarea"
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Assignment description (Markdown supported)"
              />
            )}
            <Form.Text className="text-muted">
              Supports Markdown formatting
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {assignment && (
          <Button variant="danger" onClick={handleDelete} className="me-auto">
            Delete
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AssignmentEditModal
