import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import enUS from 'date-fns/locale/en-US'
import { Modal, Button, Form, Badge } from 'react-bootstrap'
import 'react-big-calendar/lib/css/react-big-calendar.css'

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

function ClassSlotCalendarView({ slots, onAddSlot, onDeleteSlot }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('morning')
  const [currentDate, setCurrentDate] = useState(new Date())

  const timeSlots = ['morning', 'afternoon', 'evening']

  const events = useMemo(() => {
    return slots.map(slot => {
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

      return {
        id: slot.id,
        title: `${slot.timeSlot.charAt(0).toUpperCase() + slot.timeSlot.slice(1)}${slot.isManuallyAdded ? ' (Manual)' : ''}`,
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

  const eventStyleGetter = (event) => {
    const slot = event.resource
    let backgroundColor = '#3174ad'
    
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

      <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Class Slot Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSlot && (
            <>
              <p><strong>Date:</strong> {format(new Date(selectedSlot.date), 'PPP')}</p>
              <p><strong>Time Slot:</strong> {selectedSlot.timeSlot}</p>
              <p><strong>Type:</strong> {selectedSlot.isManuallyAdded ? 'Manual' : 'Generated'}</p>
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
    </>
  )
}

export default ClassSlotCalendarView
