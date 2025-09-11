import React, { useState, useEffect } from 'react';

const StatCard = ({ title, value }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center">
    <h3 className="text-lg font-medium text-gray-400 mb-2">{title}</h3>
    <p className="text-4xl font-bold text-white">{value}</p>
  </div>
);

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/stats');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Failed to fetch statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading statistics...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Activity Statistics</h1>
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Notes Generated" value={stats.notesGenerated} />
          <StatCard title="Tasks Created" value={stats.tasksCreated} />
          <StatCard title="Tasks Completed" value={stats.tasksCompleted} />
          <StatCard title="Tasks Pending" value={stats.tasksPending} />
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">No statistics available.</p>
      )}
    </div>
  );
};

export default Stats;
