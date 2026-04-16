import { useState, useEffect } from 'react'
import { Modal, Button, Form, ListGroup, Badge, Row, Col } from 'react-bootstrap'

function RegenerateCalendarModal({ show, onHide, intake, onRegenerate, lessonPlans }) {
  const [classSlotPatterns, setClassSlotPatterns] = useState({})
  const [exceptions, setExceptions] = useState([])
  const [exceptionInput, setExceptionInput] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [dayGapBetweenModules, setDayGapBetweenModules] = useState(0)
  const [lessonSlotMap, setLessonSlotMap] = useState({})
  const [showLessonSlotConfig, setShowLessonSlotConfig] = useState(false)

  // Reset state whenever intake changes
  useEffect(() => {
    if (intake) {
      // Reset class slot patterns
      const patterns = {}
      if (intake.classSlotPatterns) {
        intake.classSlotPatterns.forEach(p => {
          patterns[`${p.dayOfWeek}-${p.timeSlot}`] = p.frequency || 1
        })
      }
      setClassSlotPatterns(patterns)
      
      // Reset exceptions
      setExceptions(intake.exceptions || [])
      
      // Reset day gap
      setDayGapBetweenModules(intake.dayGapBetweenModules || 0)
      
      // Reset lesson slot map
      setLessonSlotMap(intake.lessonSlotMap || {})
      
      // Clear input fields
      setExceptionInput('')
      setSelectedDate('')
      setShowLessonSlotConfig(false)
    }
  }, [intake])

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
      exceptions,
      dayGapBetweenModules: parseInt(dayGapBetweenModules) || 0,
      lessonSlotMap
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

        {intake?.lessonPlanId && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Day Gap Between Modules</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={dayGapBetweenModules}
                onChange={(e) => setDayGapBetweenModules(e.target.value)}
                placeholder="0"
              />
              <Form.Text className="text-muted">
                Number of days to skip between modules (0 = no gap)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">Lesson Slot Configuration (Optional)</Form.Label>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowLessonSlotConfig(!showLessonSlotConfig)}
                >
                  {showLessonSlotConfig ? 'Hide' : 'Configure Slots Per Lesson'}
                </Button>
              </div>
              <Form.Text className="text-muted d-block mb-2">
                By default, each lesson takes 1 slot. Configure specific lessons to span multiple slots.
              </Form.Text>
              
              {showLessonSlotConfig && (() => {
                const selectedPlan = lessonPlans?.find(p => p.id === intake.lessonPlanId)
                console.log('🎨 Modal: Selected plan ID:', intake.lessonPlanId)
                console.log('🎨 Modal: Found plan:', selectedPlan?.name)
                console.log('🎨 Modal: First 3 lesson IDs:', selectedPlan?.lessons?.slice(0, 3).map(l => ({ id: l.id, title: l.title })))
                if (!selectedPlan || !selectedPlan.lessons) return null
                
                return (
                  <div className="border rounded p-3 mt-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedPlan.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="border rounded p-2 mb-2">
                        <Row className="align-items-start">
                          <Col md={8}>
                            <small className="text-muted d-block mb-1">Lesson {index + 1}:</small>
                            <div className="fw-medium">{lesson.title}</div>
                          </Col>
                          <Col md={4} className="text-end">
                            <small className="text-muted d-block mb-1">Slots:</small>
                            <Form.Control
                              type="number"
                              size="sm"
                              min="1"
                              max="10"
                              value={lessonSlotMap[lesson.id] || 1}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1
                                setLessonSlotMap({
                                  ...lessonSlotMap,
                                  [lesson.id]: value
                                })
                              }}
                              placeholder="1"
                              style={{ width: '80px', display: 'inline-block' }}
                            />
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </Form.Group>
          </>
        )}

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
