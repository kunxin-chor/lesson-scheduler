import { useState, useEffect } from 'react'
import { Modal, Button, Form, Tabs, Tab } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'

function LessonEditModal({ show, lesson, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [prelearningMaterials, setPrelearningMaterials] = useState('')
  const [guidedInstructions, setGuidedInstructions] = useState('')
  const [handsOnActivities, setHandsOnActivities] = useState('')
  const [activeTab, setActiveTab] = useState('prelearning')

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '')
      setPrelearningMaterials(lesson.prelearningMaterials || '')
      setGuidedInstructions(lesson.guidedInstructions || '')
      setHandsOnActivities(lesson.handsOnActivities || '')
    }
  }, [lesson])

  const handleSave = () => {
    onSave({
      title,
      prelearningMaterials,
      guidedInstructions,
      handsOnActivities,
    })
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  if (!lesson) return null

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson title"
            style={{ 
              border: 'none', 
              fontSize: '1.25rem', 
              fontWeight: 600,
              padding: '0.25rem 0.5rem'
            }}
          />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ minHeight: '400px' }}>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="prelearning" title="📚 Pre-learning">
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Pre-learning Materials
              </Form.Label>
              <MdEditor
                value={prelearningMaterials}
                style={{ height: '400px' }}
                renderHTML={(text) => <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>}
                onChange={({ text }) => setPrelearningMaterials(text)}
                placeholder="Add pre-learning materials (supports Markdown)..."
              />
            </Form.Group>
          </Tab>

          <Tab eventKey="guided" title="👨‍🏫 Guided Instructions">
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Guided Instructions
              </Form.Label>
              <MdEditor
                value={guidedInstructions}
                style={{ height: '400px' }}
                renderHTML={(text) => <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>}
                onChange={({ text }) => setGuidedInstructions(text)}
                placeholder="Add guided instructions (supports Markdown)..."
              />
            </Form.Group>
          </Tab>

          <Tab eventKey="handson" title="🛠️ Hands-on Activities">
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Hands-on Activities
              </Form.Label>
              <MdEditor
                value={handsOnActivities}
                style={{ height: '400px' }}
                renderHTML={(text) => <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>}
                onChange={({ text }) => setHandsOnActivities(text)}
                placeholder="Add hands-on activities (supports Markdown)..."
              />
            </Form.Group>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default LessonEditModal
