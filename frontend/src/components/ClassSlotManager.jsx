import { useState, useEffect } from 'react'
import { Modal, Button, Form, Table, Badge, Row, Col, ButtonGroup } from 'react-bootstrap'
import { addManualSlot, deleteSlot } from '../utils/classSlotGenerator'
import ClassSlotCalendarView from './ClassSlotCalendarView'

function ClassSlotManager({ show, onHide, intake, classSlots, onSlotsUpdate }) {
  const [slots, setSlots] = useState(classSlots || [])
  const [newSlotDate, setNewSlotDate] = useState('')
  const [newSlotTimeSlot, setNewSlotTimeSlot] = useState('morning')
  const [filterTimeSlot, setFilterTimeSlot] = useState('all')
  const [viewMode, setViewMode] = useState('list')

  // Update local slots state when classSlots prop changes (e.g., after regeneration)
  useEffect(() => {
    setSlots(classSlots || [])
  }, [classSlots])

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
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <h6>Class Slots ({slots.length})</h6>
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
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No class slots found
                      </td>
                    </tr>
                  ) : (
                    filteredSlots.map((slot) => (
                      <tr key={slot.id}>
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
                          {slot.isManuallyAdded ? (
                            <Badge bg="success">Manual</Badge>
                          ) : (
                            <Badge bg="secondary">Generated</Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteSlot(slot.id)}
                          >
                            Delete
                          </Button>
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
    </Modal>
  )
}

export default ClassSlotManager
