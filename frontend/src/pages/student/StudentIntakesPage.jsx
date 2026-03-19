import { useState, useEffect } from 'react';
import { Link } from 'wouter';

function StudentIntakesPage() {
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchIntakes() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/students/intakes`);
        if (!response.ok) {
          throw new Error('Failed to fetch intakes');
        }
        const data = await response.json();
        setIntakes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchIntakes();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Intakes</h2>
      <div className="list-group">
        {intakes.map((intake) => (
          <Link key={intake.id} href={`/students/intakes/${intake.id}`} className="list-group-item list-group-item-action">
            {intake.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default StudentIntakesPage;
