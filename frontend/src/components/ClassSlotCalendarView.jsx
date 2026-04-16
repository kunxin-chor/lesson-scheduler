import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import enUS from 'date-fns/locale/en-US'
import { Modal, Button, Form, Badge } from 'react-bootstrap'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import ReactMarkdown from 'react-markdown'
import ClassSlotDetailModal from './ClassSlotDetailModal'

const locales = {
  'en-US': enUS
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

function ClassSlotCalendarView({ slots, onAddSlot, onDeleteSlot, intake, lessonPlans }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('morning')
  const [currentDate, setCurrentDate] = useState(new Date())

  const timeSlots = ['morning', 'afternoon', 'evening']

  const events = useMemo(() => {
    return slots.map(slot => {
      // Handle assignment slots differently - they span multiple days
      if (slot.type === 'assignment') {
        const start = new Date(slot.date)
        start.setHours(0, 0, 0)
        
        const end = new Date(slot.endDate)
        end.setHours(23, 59, 59)
        
        return {
          id: slot.id,
          title: `📋 ${slot.item.title} (${slot.durationDays} days)`,
          start,
          end,
          resource: slot,
          allDay: true
        }
      }
      
      // Handle regular lesson slots
      const date = new Date(slot.date)
      let startHour, endHour
      
      switch(slot.timeSlot) {
        case 'morning':
          startHour = 9
          endHour = 12
          break
        case 'afternoon':
          startHour = 14
          endHour = 17
          break
        case 'evening':
          startHour = 19
          endHour = 22
          break
        default:
          startHour = 9
          endHour = 12
      }

      const start = new Date(date)
      start.setHours(startHour, 0, 0)
      
      const end = new Date(date)
      end.setHours(endHour, 0, 0)

      const lessonTitle = slot.lesson?.title || slot.item?.title || 'No Lesson'
      
      // Show slot number for multi-slot lessons
      let slotInfo = ''
      if (slot.totalSlots && slot.totalSlots > 1) {
        slotInfo = ` [${slot.slotNumber}/${slot.totalSlots}]`
      }
      
      const title = (slot.lesson || slot.item)
        ? `${lessonTitle}${slotInfo}${slot.isManuallyAdded ? ' (Manual)' : ''}`
        : `${slot.timeSlot.charAt(0).toUpperCase() + slot.timeSlot.slice(1)}${slot.isManuallyAdded ? ' (Manual)' : ''}`
      
      return {
        id: slot.id,
        title,
        start,
        end,
        resource: slot
      }
    })
  }, [slots])

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start)
    setShowAddModal(true)
  }

  const handleSelectEvent = (event) => {
    setSelectedSlot(event.resource)
    setShowEventModal(true)
  }

  const handleAddSlot = () => {
    if (selectedDate) {
      onAddSlot(selectedDate, selectedTimeSlot)
      setShowAddModal(false)
      setSelectedDate(null)
    }
  }

  const handleDeleteSlot = () => {
    if (selectedSlot) {
      onDeleteSlot(selectedSlot.id)
      setShowEventModal(false)
      setSelectedSlot(null)
    }
  }

  const handleViewDetails = () => {
    setShowEventModal(false)
    setShowDetailModal(true)
  }

  const eventStyleGetter = (event) => {
    const slot = event.resource
    let backgroundColor = '#3174ad'
    
    // Assignments get a distinct purple color
    if (slot.type === 'assignment') {
      backgroundColor = '#6f42c1'
      return {
        style: {
          backgroundColor,
          borderRadius: '5px',
          opacity: 0.9,
          color: 'white',
          border: '2px solid #5a32a3',
          display: 'block',
          fontWeight: 'bold'
        }
      }
    }
    
    switch(slot.timeSlot) {
      case 'morning':
        backgroundColor = '#17a2b8'
        break
      case 'afternoon':
        backgroundColor = '#ffc107'
        break
      case 'evening':
        backgroundColor = '#343a40'
        break
    }

    if (slot.isManuallyAdded) {
      backgroundColor = '#28a745'
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  return (
    <>
      <div className="mb-3">
        <div className="d-flex gap-2 flex-wrap">
          <Badge bg="info">Morning (9am-12pm)</Badge>
          <Badge bg="warning" text="dark">Afternoon (2pm-5pm)</Badge>
          <Badge bg="dark">Evening (7pm-10pm)</Badge>
          <Badge bg="success">Manual Slot</Badge>
          <Badge style={{ backgroundColor: '#6f42c1' }}>📋 Assignment</Badge>
        </div>
      </div>

      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          popup
          toolbar
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          defaultView="month"
          step={60}
          showMultiDayTimes
        />
      </div>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Class Slot</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="text"
              value={selectedDate ? format(selectedDate, 'PPP') : ''}
              disabled
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Time Slot</Form.Label>
            <Form.Select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
            >
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot.charAt(0).toUpperCase() + slot.slice(1)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSlot}>
            Add Slot
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEventModal} onHide={() => setShowEventModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Class Slot Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSlot && (
            <>
              <p><strong>Date:</strong> {format(new Date(selectedSlot.date), 'PPP')}</p>
              {selectedSlot.type === 'assignment' && selectedSlot.endDate && (
                <p><strong>End Date:</strong> {format(new Date(selectedSlot.endDate), 'PPP')}</p>
              )}
              <p>
                <strong>Time Slot:</strong>{' '}
                <Badge bg={
                  selectedSlot.type === 'assignment' ? 'purple' :
                  selectedSlot.timeSlot === 'morning' ? 'info' :
                  selectedSlot.timeSlot === 'afternoon' ? 'warning' : 'dark'
                } style={selectedSlot.type === 'assignment' ? { backgroundColor: '#6f42c1' } : {}}>
                  {selectedSlot.type === 'assignment' ? 'Assignment' : selectedSlot.timeSlot}
                </Badge>
              </p>
              <p>
                <strong>Type:</strong>{' '}
                {selectedSlot.type === 'assignment' ? (
                  <Badge style={{ backgroundColor: '#6f42c1' }}>Assignment ({selectedSlot.durationDays} days)</Badge>
                ) : selectedSlot.isManuallyAdded ? (
                  <Badge bg="success">Manual</Badge>
                ) : (
                  <Badge bg="secondary">Generated</Badge>
                )}
              </p>
              {selectedSlot.type === 'assignment' && selectedSlot.item ? (
                <>
                  <hr />
                  <h6>Assignment Details</h6>
                  <p><strong>Title:</strong> {selectedSlot.item.title}</p>
                  <p><strong>Duration:</strong> {selectedSlot.item.durationDays} day{selectedSlot.item.durationDays !== 1 ? 's' : ''}</p>
                  {selectedSlot.item.description && (
                    <div className="mb-3">
                      <strong>Description:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <ReactMarkdown>{selectedSlot.item.description}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </>
              ) : selectedSlot.lesson ? (
                <>
                  <hr />
                  <h6>Lesson Details</h6>
                  {selectedSlot.lesson.moduleName && (
                    <p><strong>Module:</strong> {selectedSlot.lesson.moduleName}</p>
                  )}
                  <p><strong>Title:</strong> {selectedSlot.lesson.title}</p>
                  
                  {selectedSlot.lesson.prelearningMaterials && (
                    <div className="mb-3">
                      <strong>Pre-learning Materials:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <ReactMarkdown>{selectedSlot.lesson.prelearningMaterials}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  
                  {selectedSlot.lesson.guidedInstructions && (
                    <div className="mb-3">
                      <strong>Guided Instructions:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <ReactMarkdown>{selectedSlot.lesson.guidedInstructions}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  
                  {selectedSlot.lesson.handsOnActivities && (
                    <div className="mb-3">
                      <strong>Hands-On Activities:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        <ReactMarkdown>{selectedSlot.lesson.handsOnActivities}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted">No lesson assigned to this slot.</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleDeleteSlot}>
            Delete Slot
          </Button>
        </Modal.Footer>
      </Modal>

      <ClassSlotDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        slot={selectedSlot}
      />
    </>
  )
}

export default ClassSlotCalendarView
