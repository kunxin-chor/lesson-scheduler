import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import SmartLinkButton from './SmartLinkButton'

function ModuleEditModal({ show, module, onClose, onSave }) {
  const [referenceMaterials, setReferenceMaterials] = useState('')

  useEffect(() => {
    if (module) {
      setReferenceMaterials(module.referenceMaterials || '')
    }
  }, [module])

  const handleSave = () => {
    onSave({
      referenceMaterials,
    })
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  const handleInsertLink = (linkText) => {
    setReferenceMaterials(prev => prev + (prev ? '\n' : '') + linkText)
  }

  if (!module) return null

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          📚 Reference Materials - {module.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ minHeight: '400px' }}>
        <Form.Group className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
              Module Reference Materials
            </Form.Label>
            <SmartLinkButton onInsertLink={handleInsertLink} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#5e6c84', marginBottom: '1rem' }}>
            Add reference materials, documentation links, or resources for this module. Supports Markdown formatting.
          </p>
          <MdEditor
            value={referenceMaterials}
            style={{ height: '400px' }}
            renderHTML={(text) => <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>}
            onChange={({ text }) => setReferenceMaterials(text)}
            placeholder="Add reference materials (supports Markdown)..."
          />
        </Form.Group>
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

export default ModuleEditModal
