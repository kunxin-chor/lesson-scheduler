import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import StudentSlotListView from '../../components/student/StudentSlotListView';
import StudentSlotCalendarView from '../../components/student/StudentSlotCalendarView';

function StudentSlotsPage() {
  const [match, params] = useRoute('/students/intakes/:id');
  const [intake, setIntake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'calendar'

  useEffect(() => {
    async function fetchIntake() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/students/intakes/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch intake details');
        }
        const data = await response.json();
        setIntake(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (params?.id) {
      fetchIntake();
    }
  }, [params?.id]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!intake) {
    return <div>Intake not found.</div>;
  }

  return (
    <div className="container mt-4">
      <h2>{intake.name} - Class Slots</h2>
      <div className="mb-3">
        <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('list')}>List View</button>
        <button className={`btn btn-sm ml-2 ${view === 'calendar' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setView('calendar')}>Calendar View</button>
      </div>
      {view === 'list' ? (
        <StudentSlotListView slots={intake.classSlots} />
      ) : (
        <StudentSlotCalendarView slots={intake.classSlots} />
      )}
    </div>
  );
}

export default StudentSlotsPage;
