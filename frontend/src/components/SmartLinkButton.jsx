import { useState } from 'react'
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap'

function SmartLinkButton({ onInsertLink }) {
  const [show, setShow] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [metadata, setMetadata] = useState(null)

  const handleShow = () => {
    setShow(true)
    setUrl('')
    setMetadata(null)
    setError(null)
  }

  const handleClose = () => {
    setShow(false)
    setUrl('')
    setMetadata(null)
    setError(null)
  }

  const handleFetchMetadata = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError(null)
    setMetadata(null)

    try {
      const response = await fetch(
        `http://localhost:5000/api/link-metadata?url=${encodeURIComponent(url)}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch link metadata')
      }

      const data = await response.json()
      setMetadata(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch link metadata')
    } finally {
      setLoading(false)
    }
  }

  const handleInsert = () => {
    if (!metadata) return

    // Format: [icon title](url) - type
    const linkText = `${metadata.icon} [${metadata.title}](${metadata.url})`
    const fullText = metadata.type !== 'web' 
      ? `${linkText} *(${metadata.type})*`
      : linkText

    onInsertLink(fullText)
    handleClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!metadata) {
        handleFetchMetadata()
      } else {
        handleInsert()
      }
    }
  }

  return (
    <>
      <Button
        variant="outline-primary"
        size="sm"
        onClick={handleShow}
        title="Insert smart link with auto-extracted title"
      >
        🔗 Smart Link
      </Button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Insert Smart Link</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Enter a URL to automatically extract its title and type
            </Form.Text>
          </Form.Group>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {metadata && (
            <div style={{
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Preview:</strong>
              </div>
              <div style={{ 
                fontSize: '0.95rem',
                fontFamily: 'monospace',
                background: 'white',
                padding: '0.5rem',
                borderRadius: '3px',
                border: '1px solid #dee2e6'
              }}>
                {metadata.icon} <a href={metadata.url} target="_blank" rel="noopener noreferrer">
                  {metadata.title}
                </a>
                {metadata.type !== 'web' && (
                  <span style={{ color: '#6c757d', fontStyle: 'italic' }}> ({metadata.type})</span>
                )}
              </div>
              {metadata.description && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: '#6c757d', 
                  marginTop: '0.5rem',
                  fontStyle: 'italic'
                }}>
                  {metadata.description}
                </div>
              )}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {!metadata ? (
            <Button 
              variant="primary" 
              onClick={handleFetchMetadata}
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Fetching...
                </>
              ) : (
                'Fetch Metadata'
              )}
            </Button>
          ) : (
            <Button variant="primary" onClick={handleInsert}>
              Insert Link
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default SmartLinkButton
