import { useState } from 'react'
import { Modal, Button, Form, Row, Col, Badge, ListGroup } from 'react-bootstrap'

function IntakeFormModal({ show, onHide, onSubmit, lessonPlans }) {
  const [classSlotPatterns, setClassSlotPatterns] = useState({})
  const [exceptions, setExceptions] = useState([])
  const [exceptionInput, setExceptionInput] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [numberOfLessons, setNumberOfLessons] = useState('')
  const [selectedLessonPlanId, setSelectedLessonPlanId] = useState('')
  const [generationMethod, setGenerationMethod] = useState('auto') // 'auto', 'manual', 'endDate', 'bulk'
  const [endDate, setEndDate] = useState('')
  const [dayGapBetweenModules, setDayGapBetweenModules] = useState(0)
  const [bulkSlotInput, setBulkSlotInput] = useState('')
  const [lessonSlotMap, setLessonSlotMap] = useState({})
  const [showLessonSlotConfig, setShowLessonSlotConfig] = useState(false)

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

  const handleLessonPlanChange = (e) => {
    const planId = e.target.value
    console.log('📋 Lesson plan changed to:', planId)
    setSelectedLessonPlanId(planId)
    
    // When a lesson plan is selected, switch to 'auto' method and calculate lessons
    if (planId) {
      setGenerationMethod('auto')
      const selectedPlan = lessonPlans.find(p => p.id === planId)
      console.log('📋 Selected plan:', selectedPlan)
      if (selectedPlan && selectedPlan.lessons) {
        const totalLessons = selectedPlan.lessons.length
        console.log('📋 Calculated totalLessons:', totalLessons)
        setNumberOfLessons(totalLessons.toString())
      }
    } else {
      // If no plan selected, clear numberOfLessons
      setNumberOfLessons('')
    }
  }

  const parseBulkSlotString = (bulkString) => {
    const entries = bulkString.split(',').map(s => s.trim()).filter(s => s)
    const slots = []
    
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
        if (!timeSlot) continue
        
        const date = new Date(year, parseInt(month) - 1, parseInt(day))
        
        slots.push({
          id: `slot-${date.getTime()}-${timeSlot}-bulk`,
          date: date,
          dayOfWeek: date.getDay(),
          timeSlot: timeSlot,
          isManuallyAdded: true
        })
      }
    }
    
    return slots.sort((a, b) => a.date - b.date)
  }

  const handleGenerationMethodChange = (method) => {
    setGenerationMethod(method)
    
    // Auto-populate if switching to 'auto' and a plan is selected
    if (method === 'auto' && selectedLessonPlanId) {
      const selectedPlan = lessonPlans.find(p => p.id === selectedLessonPlanId)
      if (selectedPlan && selectedPlan.modules) {
        const totalLessons = selectedPlan.modules.reduce((total, module) => {
          return total + (module.lessons ? module.lessons.length : 0)
        }, 0)
        setNumberOfLessons(totalLessons.toString())
      }
    } else if (method === 'manual') {
      setNumberOfLessons('')
    } else if (method === 'endDate') {
      setNumberOfLessons('')
      setEndDate('')
    } else if (method === 'bulk') {
      setBulkSlotInput('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    console.log('📝 Form submit - numberOfLessons state:', numberOfLessons)
    console.log('📝 Form submit - generationMethod:', generationMethod)
    console.log('📝 Form submit - selectedLessonPlanId:', selectedLessonPlanId)
    
    const patternsArray = Object.entries(classSlotPatterns).map(([key, frequency]) => {
      const [dayOfWeek, timeSlot] = key.split('-')
      return {
        dayOfWeek: parseInt(dayOfWeek),
        timeSlot,
        frequency
      }
    })
    
    const intakeData = {
      name: formData.get('name'),
      lessonPlanId: formData.get('lessonPlanId'),
      startDate: formData.get('startDate'),
      classSlotPatterns: patternsArray,
      exceptions,
      generationMethod,
      numberOfLessons: (generationMethod === 'auto' || generationMethod === 'manual') && numberOfLessons ? parseInt(numberOfLessons) : null,
      endDate: generationMethod === 'endDate' ? endDate : null,
      dayGapBetweenModules: parseInt(dayGapBetweenModules) || 0,
      lessonSlotMap,
      bulkSlots: generationMethod === 'bulk' ? parseBulkSlotString(bulkSlotInput) : null
    }
    
    console.log('📝 Final intakeData.numberOfLessons:', intakeData.numberOfLessons)
    console.log('📝 Final intakeData.lessonSlotMap:', intakeData.lessonSlotMap)
    
    onSubmit(intakeData)
    resetForm()
  }

  const resetForm = () => {
    setClassSlotPatterns({})
    setExceptions([])
    setExceptionInput('')
    setSelectedDate('')
    setNumberOfLessons('')
    setSelectedLessonPlanId('')
    setGenerationMethod('auto')
    setEndDate('')
    setDayGapBetweenModules(0)
    setBulkSlotInput('')
    setLessonSlotMap({})
    setShowLessonSlotConfig(false)
  }

  const handleClose = () => {
    resetForm()
    onHide()
  }

  const getDayName = (dayOfWeek) => {
    return daysOfWeek.find(d => d.value === dayOfWeek)?.label || ''
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create New Intake</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} id="intakeForm">
          <Form.Group className="mb-3">
            <Form.Label>Intake Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="e.g., January 2024 Intake"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Lesson Plan (Optional)</Form.Label>
            <Form.Select 
              name="lessonPlanId"
              value={selectedLessonPlanId}
              onChange={handleLessonPlanChange}
            >
              <option value="">Select a lesson plan (optional)</option>
              {lessonPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {selectedLessonPlanId && (
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
                  const selectedPlan = lessonPlans.find(p => p.id === selectedLessonPlanId)
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

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Class Slot Generation Method</Form.Label>
            <div className="mb-2">
              <Form.Check
                type="radio"
                id="method-auto"
                label="Auto from Lesson Plan"
                checked={generationMethod === 'auto'}
                onChange={() => handleGenerationMethodChange('auto')}
                disabled={!selectedLessonPlanId}
              />
              <Form.Text className="text-muted d-block ms-4 mb-2">
                Generate slots based on the number of lessons in the selected lesson plan
              </Form.Text>
              
              <Form.Check
                type="radio"
                id="method-manual"
                label="Manual Number of Lessons"
                checked={generationMethod === 'manual'}
                onChange={() => handleGenerationMethodChange('manual')}
              />
              <Form.Text className="text-muted d-block ms-4 mb-2">
                Specify exactly how many class slots to generate
              </Form.Text>
              
              <Form.Check
                type="radio"
                id="method-endDate"
                label="Set End Date"
                checked={generationMethod === 'endDate'}
                onChange={() => handleGenerationMethodChange('endDate')}
              />
              <Form.Text className="text-muted d-block ms-4 mb-2">
                Generate slots until a specific end date
              </Form.Text>
              
              <Form.Check
                type="radio"
                id="method-bulk"
                label="Bulk Slot Input"
                checked={generationMethod === 'bulk'}
                onChange={() => handleGenerationMethodChange('bulk')}
              />
              <Form.Text className="text-muted d-block ms-4">
                Manually specify exact dates and time slots using comma-delimited format
              </Form.Text>
            </div>
          </Form.Group>

          {generationMethod === 'auto' && (
            <Form.Group className="mb-3">
              <Form.Label>Number of Lessons (Auto-populated)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={numberOfLessons}
                readOnly
                disabled
                placeholder="Select a lesson plan above"
              />
              <Form.Text className="text-muted">
                {selectedLessonPlanId && numberOfLessons
                  ? `${numberOfLessons} lessons from selected lesson plan`
                  : 'Please select a lesson plan to auto-populate'}
              </Form.Text>
            </Form.Group>
          )}

          {generationMethod === 'manual' && (
            <Form.Group className="mb-3">
              <Form.Label>Number of Lessons</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={numberOfLessons}
                onChange={(e) => setNumberOfLessons(e.target.value)}
                placeholder="Enter number of class slots to generate"
                required
              />
            </Form.Group>
          )}

          {generationMethod === 'endDate' && (
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Class slots will be generated from start date until this end date
              </Form.Text>
            </Form.Group>
          )}

          {generationMethod === 'bulk' && (
            <Form.Group className="mb-3">
              <Form.Label>Bulk Slot Input</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={bulkSlotInput}
                onChange={(e) => setBulkSlotInput(e.target.value)}
                placeholder="e.g., 01/12/2026 M, 03/12/2026 A, 05/12/2026 E"
                required
              />
              <Form.Text className="text-muted">
                Enter comma-separated dates in format: <strong>DD/MM/YYYY M/A/E</strong>
                <br />
                <em>M = Morning, A = Afternoon, E = Evening</em>
                <br />
                Example: <code>01/12/2026 M, 03/12/2026 A, 05/12/2026 E</code>
              </Form.Text>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              required={generationMethod !== 'bulk'}
            />
            <Form.Text className="text-muted">
              {generationMethod === 'bulk' ? 'Optional for bulk slot input' : 'Required'}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Class Slot Pattern</Form.Label>
            <p className="text-muted small">Select which days and timeslots have classes</p>
            
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
            <p className="text-muted small">Add dates where there are no lessons</p>
            
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit" 
          form="intakeForm"
          disabled={classSlotPatterns.length === 0}
        >
          Create Intake & Generate Slots
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default IntakeFormModal
