import { useState, useEffect } from 'react'
import { Modal, Button, Form, Table, Badge, Row, Col, ButtonGroup, Alert } from 'react-bootstrap'
import { addManualSlot, deleteSlot } from '../utils/classSlotGenerator'
import ClassSlotCalendarView from './ClassSlotCalendarView'
import ClassSlotDetailModal from './ClassSlotDetailModal'
import { generateCalendarMarkdown } from '../utils/calendarMarkdownGenerator'
import { exportCalendarToExcel } from '../utils/calendarExcelExporter'

function ClassSlotManager({ show, onHide, intake, classSlots, onSlotsUpdate, lessonPlans }) {
  const [slots, setSlots] = useState(classSlots || [])
  const [newSlotDate, setNewSlotDate] = useState('')
  const [newSlotTimeSlot, setNewSlotTimeSlot] = useState('morning')
  const [filterTimeSlot, setFilterTimeSlot] = useState('all')
  const [viewMode, setViewMode] = useState('list')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSlotForDetail, setSelectedSlotForDetail] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // Update local slots state when classSlots prop changes (e.g., after regeneration)
  // Re-hydrate lesson data if missing
  useEffect(() => {
    console.log('🔧 ClassSlotManager useEffect triggered')
    console.log('🔧 classSlots:', classSlots)
    console.log('🔧 intake:', intake)
    console.log('🔧 lessonPlans:', lessonPlans)
    
    if (!classSlots || classSlots.length === 0) {
      console.log('🔧 No class slots, setting empty array')
      setSlots([])
      return
    }

    // Check if slots already have lesson data
    const hasLessonData = classSlots.some(slot => slot.lesson)
    console.log('🔧 hasLessonData:', hasLessonData)
    
    if (hasLessonData) {
      // Slots already have lesson data
      console.log('🔧 Slots already have lesson data, using as-is')
      setSlots(classSlots)
    } else {
      console.log('🔧 Need to re-hydrate lesson data')
      console.log('🔧 intake.lessonPlanId:', intake?.lessonPlanId)
      
      // Re-hydrate lesson data from lesson plan
      const lessonPlan = intake?.lessonPlanId 
        ? lessonPlans?.find(p => p.id === intake.lessonPlanId)
        : null
      
      console.log('🔧 Found lessonPlan:', lessonPlan)
      
      if (lessonPlan) {
        // Check if lessons are in flat array or nested in modules
        let allLessons = []
        
        if (lessonPlan.lessons && Array.isArray(lessonPlan.lessons)) {
          // Flat lessons array (from backend transformation)
          allLessons = lessonPlan.lessons
        } else if (lessonPlan.modules) {
          // Nested in modules
          lessonPlan.modules.forEach(module => {
            if (module.lessons) {
              allLessons = allLessons.concat(module.lessons.map(lesson => ({
                ...lesson,
                moduleName: module.name
              })))
            }
          })
        }
        
        // Sort by order
        allLessons.sort((a, b) => a.order - b.order)
        
        console.log('🔧 Total lessons found:', allLessons.length)
        console.log('🔧 First lesson:', allLessons[0])
        
        // Re-attach lesson data to slots
        const hydratedSlots = classSlots.map((slot, index) => ({
          ...slot,
          lessonIndex: index,
          lesson: allLessons[index] || null
        }))
        
        console.log('🔧 Hydrated slots:', hydratedSlots)
        console.log('🔧 First hydrated slot:', hydratedSlots[0])
        setSlots(hydratedSlots)
      } else {
        console.log('🔧 No lesson plan or modules found, using slots as-is')
        setSlots(classSlots)
      }
    }
  }, [classSlots, intake, lessonPlans])

  const timeSlots = ['morning', 'afternoon', 'evening']

  const handleAddSlot = (date, timeSlot) => {
    const dateToUse = date || newSlotDate
    const slotToUse = timeSlot || newSlotTimeSlot
    
    if (dateToUse) {
      const updatedSlots = addManualSlot(slots, dateToUse, slotToUse)
      setSlots(updatedSlots)
      setNewSlotDate('')
    }
  }

  const handleDeleteSlot = (slotId) => {
    if (window.confirm('Are you sure you want to delete this class slot?')) {
      const updatedSlots = deleteSlot(slots, slotId)
      setSlots(updatedSlots)
    }
  }

  const handleSave = () => {
    onSlotsUpdate(slots)
    onHide()
  }

  const handleViewDetails = (slot) => {
    setSelectedSlotForDetail(slot)
    setShowDetailModal(true)
  }

  const handleCopyAsMarkdown = async () => {
    const markdown = generateCalendarMarkdown(intake, slots)
    try {
      await navigator.clipboard.writeText(markdown)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 3000)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    }
  }

  const handleExportToExcel = () => {
    exportCalendarToExcel(intake, slots)
  }

  const filteredSlots = filterTimeSlot === 'all' 
    ? slots 
    : slots.filter(s => s.timeSlot === filterTimeSlot)

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Manage Class Slots - {intake?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {copySuccess && (
          <Alert variant="success" dismissible onClose={() => setCopySuccess(false)}>
            ✅ Calendar copied to clipboard as Markdown!
          </Alert>
        )}
        
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <h6>Class Slots ({slots.length})</h6>
          <div className="d-flex gap-2">
            <Button
              variant="outline-success"
              size="sm"
              onClick={handleCopyAsMarkdown}
            >
              📋 Copy as Markdown
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleExportToExcel}
            >
              📊 Export to Excel
            </Button>
            <ButtonGroup>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('list')}
              >
                📋 List View
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'outline-primary'}
                onClick={() => setViewMode('calendar')}
              >
                📅 Calendar View
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {viewMode === 'list' && (
          <>
            <div className="mb-4 p-3 bg-light rounded">
              <h6 className="mb-3">Add Manual Class Slot</h6>
              <Row>
                <Col md={5}>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={newSlotDate}
                    onChange={(e) => setNewSlotDate(e.target.value)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Label>Time Slot</Form.Label>
                  <Form.Select
                    value={newSlotTimeSlot}
                    onChange={(e) => setNewSlotTimeSlot(e.target.value)}
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>
                        {slot.charAt(0).toUpperCase() + slot.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button
                    variant="primary"
                    onClick={() => handleAddSlot()}
                    disabled={!newSlotDate}
                  >
                    Add Slot
                  </Button>
                </Col>
              </Row>
            </div>

            <div className="mb-3 d-flex justify-content-between align-items-center">
              <h6>Slots ({filteredSlots.length})</h6>
              <Form.Select
                style={{ width: '200px' }}
                value={filterTimeSlot}
                onChange={(e) => setFilterTimeSlot(e.target.value)}
              >
                <option value="all">All Time Slots</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>
                    {slot.charAt(0).toUpperCase() + slot.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Lesson</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        No class slots found
                      </td>
                    </tr>
                  ) : (
                    filteredSlots.map((slot, index) => (
                      <tr key={slot.id}>
                        <td>{index + 1}</td>
                        <td>{formatDate(slot.date)}</td>
                        <td>
                          <Badge bg={
                            slot.timeSlot === 'morning' ? 'info' :
                            slot.timeSlot === 'afternoon' ? 'warning' : 'dark'
                          }>
                            {slot.timeSlot}
                          </Badge>
                        </td>
                        <td>
                          {slot.lesson ? (
                            <div>
                              <strong>{slot.lesson.title}</strong>
                              {slot.lesson.moduleName && (
                                <div className="text-muted small">{slot.lesson.moduleName}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">No lesson assigned</span>
                          )}
                        </td>
                        <td>
                          {slot.isManuallyAdded ? (
                            <Badge bg="success">Manual</Badge>
                          ) : (
                            <Badge bg="secondary">Generated</Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            {slot.lesson && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewDetails(slot)}
                              >
                                View Details
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteSlot(slot.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}

        {viewMode === 'calendar' && (
          <ClassSlotCalendarView
            slots={slots}
            onAddSlot={handleAddSlot}
            onDeleteSlot={handleDeleteSlot}
            intake={intake}
            lessonPlans={lessonPlans}
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
      
      <ClassSlotDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        slot={selectedSlotForDetail}
      />
    </Modal>
  )
}

export default ClassSlotManager
