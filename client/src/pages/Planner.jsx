import React, { useState, useEffect } from 'react';
import CreateStudyPlanModal from '../components/CreateStudyPlanModal';

const Planner = () => {
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/study-plans');
      if (!response.ok) throw new Error('Failed to fetch study plans');
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSavePlan = async (planData) => {
    const isEditing = !!planData.id;
    const url = isEditing ? `http://localhost:8080/api/study-plans/${planData.id}` : 'http://localhost:8080/api/study-plans';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });
      if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} plan`);
      fetchPlans(); // Refetch to show the new/updated plan
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this study plan?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/study-plans/${planId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete plan');
      fetchPlans(); // Refetch to remove the deleted plan
    } catch (err) {
      setError(err.message);
    }
  };

  const openModalForNew = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/30 text-green-300';
      case 'Processing':
        return 'bg-blue-500/30 text-blue-300';
      case 'Failed':
        return 'bg-red-500/30 text-red-300';
      case 'Pending':
      default:
        return 'bg-yellow-500/30 text-yellow-300';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Study Planner</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Your Study Plans</h2>
        <button onClick={openModalForNew} className="bg-blue-600 px-6 py-3 rounded-md font-bold hover:bg-blue-700">
          Create New Plan
        </button>
      </div>

      <CreateStudyPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlan}
        existingPlan={selectedPlan}
      />

      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Your Plans</h2>
        {loading && <p>Loading plans...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="space-y-4">
            {plans.length > 0 ? plans.map(plan => (
              <div key={plan.id} className="bg-gray-700 p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-grow mb-4 sm:mb-0">
                  <p className="font-bold text-lg">{plan.title}</p>
                  <a href={plan.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline truncate block">{plan.video_url}</a>
                  <p className="text-xs text-gray-400 mt-1">
                    Scheduled for: {new Date(plan.process_time).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                   <span className={`px-3 py-1 text-xs rounded-full ${getStatusChip(plan.status)}`}>
                    {plan.status}
                  </span>
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded-md">{plan.note_format}</span>
                  <button onClick={() => openModalForEdit(plan)} className="text-sm text-blue-400 hover:underline">Edit</button>
                  <button onClick={() => handleDeletePlan(plan.id)} className="text-sm text-red-400 hover:underline">Delete</button>
                </div>
              </div>
            )) : <p className="text-gray-500 text-center py-4">You have no study plans yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Planner;
