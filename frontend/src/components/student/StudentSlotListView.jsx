import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import StudentSlotDetailModal from './StudentSlotDetailModal';

function StudentSlotListView({ slots }) {
  if (!slots || slots.length === 0) {
    return <p>No class slots available.</p>;
  }

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setShowDetailModal(true);
  };

  const transformedSlots = useMemo(() => {
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

  return (
    <>
      <ul className="list-group">
        {transformedSlots.map((slot) => (
          <li key={slot.id} className="list-group-item list-group-item-action" onClick={() => handleSelectSlot(slot)} style={{ cursor: 'pointer' }}>
            <h5>{slot.title}</h5>
            <p><strong>Start:</strong> {new Date(slot.start).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(slot.end).toLocaleString()}</p>
            {slot.lesson && (
              <div>
                <h6>Lesson Details:</h6>
                <p>Module: {slot.lesson.moduleName}</p>
                {slot.lesson.prelearningMaterials && (
                  <div className="mb-2">
                    <strong>Pre-learning Materials:</strong>
                    <div className="p-2 border rounded bg-light mt-1">
                      <ReactMarkdown>{slot.lesson.prelearningMaterials}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {slot.lesson.guidedInstructions && (
                  <div className="mb-2">
                    <strong>Guided Instructions:</strong>
                    <div className="p-2 border rounded bg-light mt-1">
                      <ReactMarkdown>{slot.lesson.guidedInstructions}</ReactMarkdown>
                    </div>
                  </div>
                )}
                {slot.lesson.handsOnActivities && (
                  <div className="mb-2">
                    <strong>Hands-On Activities:</strong>
                    <div className="p-2 border rounded bg-light mt-1">
                      <ReactMarkdown>{slot.lesson.handsOnActivities}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      <StudentSlotDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        slot={selectedSlot}
      />
    </>
  );
}

export default StudentSlotListView;
