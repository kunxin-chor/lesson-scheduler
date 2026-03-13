import { useState } from 'react'
import { Modal, Button, Form, ListGroup, Badge, Row, Col } from 'react-bootstrap'

function RegenerateCalendarModal({ show, onHide, intake, onRegenerate }) {
  const [classSlotPatterns, setClassSlotPatterns] = useState(() => {
    if (!intake?.classSlotPatterns) return {}
    const patterns = {}
    intake.classSlotPatterns.forEach(p => {
      patterns[`${p.dayOfWeek}-${p.timeSlot}`] = p.frequency || 1
    })
    return patterns
  })
  const [exceptions, setExceptions] = useState(intake?.exceptions || [])
  const [exceptionInput, setExceptionInput] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ]

  const timeSlots = ['morning', 'afternoon', 'evening']

  const toggleFrequency = (dayOfWeek, timeSlot) => {
    const key = `${dayOfWeek}-${timeSlot}`
    const currentFreq = classSlotPatterns[key] || 0
    const newFreq = currentFreq === 0 ? 1 : currentFreq === 1 ? 2 : 0
    
    const updated = { ...classSlotPatterns }
    if (newFreq === 0) {
      delete updated[key]
    } else {
      updated[key] = newFreq
    }
    setClassSlotPatterns(updated)
  }

  const getFrequencyLabel = (freq) => {
    switch(freq) {
      case 0: return '✗'
      case 1: return 'Every week'
      case 2: return 'Every 2 weeks'
      default: return '✗'
    }
  }

  const getFrequencyColor = (freq) => {
    switch(freq) {
      case 0: return 'light'
      case 1: return 'primary'
      case 2: return 'info'
      default: return 'light'
    }
  }

  const addExceptionFromPicker = () => {
    if (selectedDate && !exceptions.includes(selectedDate)) {
      setExceptions([...exceptions, selectedDate])
      setSelectedDate('')
    }
  }

  const parseExceptionDates = (input) => {
    const dateStrings = input.split(/[,\s]+/).filter(s => s.trim())
    const validDates = []
    
    for (const dateStr of dateStrings) {
      const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)
      if (match) {
        const [, day, month, year] = match
        const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`
        const isoDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        if (!exceptions.includes(isoDate)) {
          validDates.push(isoDate)
        }
      }
    }
    
    return validDates
  }

  const addExceptionsFromText = () => {
    const newDates = parseExceptionDates(exceptionInput)
    if (newDates.length > 0) {
      setExceptions([...exceptions, ...newDates])
      setExceptionInput('')
    }
  }

  const removeException = (index) => {
    setExceptions(exceptions.filter((_, i) => i !== index))
  }

  const handleRegenerate = () => {
    const patternsArray = Object.entries(classSlotPatterns).map(([key, frequency]) => {
      const [dayOfWeek, timeSlot] = key.split('-')
      return {
        dayOfWeek: parseInt(dayOfWeek),
        timeSlot,
        frequency
      }
    })
    
    onRegenerate({
      classSlotPatterns: patternsArray,
      exceptions
    })
    onHide()
  }

  const getDayName = (dayOfWeek) => {
    return daysOfWeek.find(d => d.value === dayOfWeek)?.label || ''
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Regenerate Calendar - {intake?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="alert alert-warning">
          <strong>Warning:</strong> Regenerating the calendar will replace all existing class slots with new ones based on the updated pattern and exceptions.
        </div>

        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">Class Slot Pattern</Form.Label>
          <p className="text-muted small">Update which days and timeslots have classes</p>
          
          <div className="table-responsive">
            <table className="table table-bordered text-center">
              <thead>
                <tr>
                  <th style={{ width: '120px' }}>Time Slot</th>
                  {daysOfWeek.map(day => (
                    <th key={day.value}>{day.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot}>
                    <td className="align-middle">
                      <strong>{slot.charAt(0).toUpperCase() + slot.slice(1)}</strong>
                    </td>
                    {daysOfWeek.map(day => {
                      const key = `${day.value}-${slot}`
                      const frequency = classSlotPatterns[key] || 0
                      return (
                        <td key={key}>
                          <Button
                            size="sm"
                            variant={getFrequencyColor(frequency)}
                            onClick={() => toggleFrequency(day.value, slot)}
                            style={{ minWidth: '100px', fontSize: '0.85rem' }}
                          >
                            {getFrequencyLabel(frequency)}
                          </Button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {Object.keys(classSlotPatterns).length > 0 && (
            <p className="text-muted small">
              <strong>{Object.keys(classSlotPatterns).length}</strong> class slot pattern(s) configured
            </p>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Exceptions (Public Holidays & Skip Dates)</Form.Label>
          <p className="text-muted small">Update dates where there are no lessons</p>
          
          <Row className="mb-2">
            <Col md={8}>
              <Form.Label>Pick a Date</Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="outline-primary"
                onClick={addExceptionFromPicker}
                disabled={!selectedDate}
              >
                Add Date
              </Button>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={8}>
              <Form.Label>Or Enter Dates (DD/MM/YY or DD/M/YY)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., 25/12/24, 1/1/25, 10/2/25"
                value={exceptionInput}
                onChange={(e) => setExceptionInput(e.target.value)}
              />
              <Form.Text className="text-muted">
                Separate multiple dates with commas or spaces
              </Form.Text>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="outline-primary"
                onClick={addExceptionsFromText}
                disabled={!exceptionInput.trim()}
              >
                Add Dates
              </Button>
            </Col>
          </Row>

          {exceptions.length > 0 && (
            <div>
              <p className="mb-2"><strong>Exception Dates:</strong></p>
              <div className="d-flex flex-wrap gap-2">
                {exceptions.map((date, index) => (
                  <Badge
                    key={index}
                    bg="secondary"
                    className="d-flex align-items-center gap-2"
                  >
                    {formatDate(date)}
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() => removeException(index)}
                    >
                      ×
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="warning" 
          onClick={handleRegenerate}
          disabled={classSlotPatterns.length === 0}
        >
          Regenerate Calendar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default RegenerateCalendarModal
