import { useMemo, useState } from 'react';
import StudentSlotDetailModal from './StudentSlotDetailModal';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function StudentSlotCalendarView({ slots }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const events = useMemo(() => {
    if (!slots) return [];
    return slots.map(slot => {
      const date = new Date(slot.date);
      let start, end;

      if (slot.timeSlot === 'morning') {
        start = new Date(new Date(date).setHours(9, 0, 0, 0));
        end = new Date(new Date(date).setHours(12, 30, 0, 0));
      } else { // afternoon
        start = new Date(new Date(date).setHours(13, 30, 0, 0));
        end = new Date(new Date(date).setHours(17, 0, 0, 0));
      }

      return {
        ...slot,
        title: slot.lesson?.title || 'No Title',
        start: start,
        end: end,
      };
    });
  }, [slots]);

  const handleSelectEvent = (event) => {
    setSelectedSlot(event);
    setShowDetailModal(true);
  };

  return (
    <>
      <div style={{ height: '600px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        onSelectEvent={handleSelectEvent}
        selectable
        popup
        toolbar
        views={['month', 'week', 'day']}
        defaultView="month"
        step={60}
        showMultiDayTimes
      />
    </div>
    <StudentSlotDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        slot={selectedSlot}
      />
    </>
  );
}

export default StudentSlotCalendarView;
