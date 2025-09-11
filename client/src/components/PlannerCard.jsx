import React from 'react';

const PlannerCard = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Planner</h2>
        <div className="text-sm text-gray-400">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>
      <div className="flex space-x-4 text-sm">
        <button className="bg-blue-600 px-4 py-2 rounded-md">Unplanned</button>
        <button className="bg-gray-700 px-4 py-2 rounded-md">Planned</button>
        <button className="bg-gray-700 px-4 py-2 rounded-md">All</button>
      </div>
    </div>
  );
};

export default PlannerCard;
