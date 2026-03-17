import { useState, useEffect, useRef } from 'react'
import { Modal, Button, Form, Tabs, Tab } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import SmartLinkButton from './SmartLinkButton'

function LessonEditModal({ show, lesson, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [prelearningMaterials, setPrelearningMaterials] = useState('')
  const [guidedInstructions, setGuidedInstructions] = useState('')
  const [handsOnActivities, setHandsOnActivities] = useState('')
  const [activeTab, setActiveTab] = useState('prelearning')
  const prelearningEditorRef = useRef(null)
  const guidedEditorRef = useRef(null)
  const handsOnEditorRef = useRef(null)

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

  const handleInsertLink = (linkText, editorType) => {
    if (editorType === 'prelearning') {
      setPrelearningMaterials(prev => prev + (prev ? '\n' : '') + linkText)
    } else if (editorType === 'guided') {
      setGuidedInstructions(prev => prev + (prev ? '\n' : '') + linkText)
    } else if (editorType === 'handson') {
      setHandsOnActivities(prev => prev + (prev ? '\n' : '') + linkText)
    }
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
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                  Pre-learning Materials
                </Form.Label>
                <SmartLinkButton onInsertLink={(linkText) => handleInsertLink(linkText, 'prelearning')} />
              </div>
              <MdEditor
                ref={prelearningEditorRef}
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
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                  Guided Instructions
                </Form.Label>
                <SmartLinkButton onInsertLink={(linkText) => handleInsertLink(linkText, 'guided')} />
              </div>
              <MdEditor
                ref={guidedEditorRef}
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
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                  Hands-on Activities
                </Form.Label>
                <SmartLinkButton onInsertLink={(linkText) => handleInsertLink(linkText, 'handson')} />
              </div>
              <MdEditor
                ref={handsOnEditorRef}
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
