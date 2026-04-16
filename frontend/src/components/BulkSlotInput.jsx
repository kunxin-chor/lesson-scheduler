import { useState } from 'react'
import { Form, Button, Row, Col, Alert } from 'react-bootstrap'

function BulkSlotInput({ onAddBulkSlots }) {
  const [bulkInput, setBulkInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const parseBulkSlotString = (bulkString) => {
    const entries = bulkString.split(',').map(s => s.trim()).filter(s => s)
    const slots = []
    const errors = []
    
    for (const entry of entries) {
      const match = entry.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s*([MAE])$/i)
      if (match) {
        const [, day, month, year] = match
        const timeSlotCode = match[4].toUpperCase()
        
        const timeSlotMap = {
          'M': 'morning',
          'A': 'afternoon',
          'E': 'evening'
        }
        
        const timeSlot = timeSlotMap[timeSlotCode]
        if (!timeSlot) {
          errors.push(`Invalid time slot code: ${timeSlotCode}`)
          continue
        }
        
        const date = new Date(year, parseInt(month) - 1, parseInt(day))
        
        if (isNaN(date.getTime())) {
          errors.push(`Invalid date: ${entry}`)
          continue
        }
        
        slots.push({
          id: `slot-${date.getTime()}-${timeSlot}-bulk`,
          date: date,
          dayOfWeek: date.getDay(),
          timeSlot: timeSlot,
          isManuallyAdded: true
        })
      } else {
        errors.push(`Invalid format: ${entry}`)
      }
    }
    
    return { slots: slots.sort((a, b) => a.date - b.date), errors }
  }

  const handleAddBulkSlots = () => {
    setError('')
    setSuccess(false)
    
    if (!bulkInput.trim()) {
      setError('Please enter slot dates')
      return
    }
    
    const { slots, errors } = parseBulkSlotString(bulkInput)
    
    if (errors.length > 0) {
      setError(`Errors found: ${errors.join(', ')}`)
    }
    
    if (slots.length > 0) {
      onAddBulkSlots(slots)
      setSuccess(true)
      setBulkInput('')
      setTimeout(() => setSuccess(false), 3000)
    } else if (errors.length === 0) {
      setError('No valid slots found')
    }
  }

  return (
    <div className="mb-4 p-3 bg-light rounded">
      <h6 className="mb-3">Add Bulk Class Slots</h6>
      <p className="text-muted small mb-2">
        Enter comma-separated dates in format: <strong>DD/MM/YYYY M/A/E</strong>
        <br />
        <em>M = Morning, A = Afternoon, E = Evening</em>
        <br />
        Example: <code>01/12/2026 M, 03/12/2026 A, 05/12/2026 E</code>
      </p>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
          ✅ Slots added successfully!
        </Alert>
      )}
      
      <Row>
        <Col md={9}>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="e.g., 01/12/2026 M, 03/12/2026 A, 05/12/2026 E"
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
          />
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button
            variant="success"
            onClick={handleAddBulkSlots}
            disabled={!bulkInput.trim()}
            className="w-100"
          >
            Add Bulk Slots
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default BulkSlotInput
