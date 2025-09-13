import React, { useState } from "react";
import CreateStudyPlanModal from "../components/CreateStudyPlanModal";
import { useLocalTasks } from "../useLocalTasks";

const Planner = () => {
  const { tasks, addTask, updateTask, deleteTask } = useLocalTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSavePlan = (planData) => {
    if (planData.id) {
      updateTask(planData.id, planData);
    } else {
      // Assign a unique id
      const newId = Date.now().toString();
      addTask({ ...planData, id: newId });
    }
    setIsModalOpen(false);
  };

  const handleDeletePlan = (planId) => {
    if (!window.confirm("Are you sure you want to delete this study plan?"))
      return;
    deleteTask(planId);
  };

  const openModalForNew = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  // Helper: open modal for editing a plan
  const openModalForEdit = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  // Unplanned: no video_url and no process_time
  const unplannedPlans = tasks.filter(
    (task) => !task.video_url && !task.process_time
  );

  // Planned: has video_url or process_time
  const plannedPlans = tasks.filter(
    (task) => task.video_url || task.process_time
  );

  // Incomplete: planned tasks that are not completed
  const incompletePlans = tasks.filter(
    (task) =>
      (task.video_url || task.process_time) && task.status !== "Completed"
  );

  // Complete: planned tasks with status "Completed"
  const completedPlans = tasks.filter(
    (task) =>
      (task.video_url || task.process_time) && task.status === "Completed"
  );

  // Example usage for API calls:
  // fetch(`${import.meta.env.VITE_API_URL}/api/study-plans`)

  // Mark complete/incomplete handlers
  const markComplete = (id) => {
    updateTask(id, { status: "Completed" });
  };
  const markIncomplete = (id) => {
    updateTask(id, { status: "Pending" });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Study Planner</h1>
      <div className="p-6 rounded-lg shadow border border-gray-200 dark:border-none mb-8 flex justify-between items-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <h2 className="text-xl font-bold">Manage Your Study Plans</h2>
        <button
          onClick={openModalForNew}
          className="bg-blue-600 px-6 py-3 rounded-md font-bold hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      <CreateStudyPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlan}
        existingPlan={selectedPlan}
      />

      {/* Unplanned Tasks Section */}
      <div className="p-6 rounded-lg shadow border border-gray-200 dark:border-none mb-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <h2 className="text-xl font-bold mb-4">Unplanned Tasks</h2>
        <div className="space-y-4">
          {unplannedPlans.length > 0 ? (
            unplannedPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <div className="flex-grow mb-4 sm:mb-0">
                  <p className="font-bold text-lg">{plan.title}</p>
                  {plan.video_url && (
                    <a
                      href={plan.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline truncate block"
                    >
                      {plan.video_url}
                    </a>
                  )}
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <button
                    onClick={() => openModalForEdit(plan)}
                    className="text-sm bg-green-600 px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openModalForEdit(plan)}
                    className="text-sm bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Plan Task
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              You have no unplanned tasks.
            </p>
          )}
        </div>
      </div>
      {/* Planned Tasks Section */}
      <div className="p-6 rounded-lg shadow border border-gray-200 dark:border-none mb-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <h2 className="text-xl font-bold mb-4">Planned Tasks</h2>
        <div className="space-y-4">
          {plannedPlans.length > 0 ? (
            plannedPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <div className="flex-grow mb-4 sm:mb-0">
                  <p className="font-bold text-lg">{plan.title}</p>
                  {plan.video_url && (
                    <a
                      href={plan.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline truncate block"
                    >
                      {plan.video_url}
                    </a>
                  )}
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <button
                    onClick={() => openModalForEdit(plan)}
                    className="text-sm bg-yellow-600 px-4 py-2 rounded-md hover:bg-yellow-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => markComplete(plan.id)}
                    className="text-sm bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => markIncomplete(plan.id)}
                    className="text-sm bg-yellow-600 px-4 py-2 rounded-md hover:bg-yellow-700"
                  >
                    Mark Incomplete
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              You have no planned tasks.
            </p>
          )}
        </div>
      </div>
      {/* Incomplete Tasks Section */}
      <div className="p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-900 mb-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <h2 className="text-xl font-bold mb-4">Incomplete Tasks</h2>
        <div className="space-y-4">
          {incompletePlans.length > 0 ? (
            incompletePlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm mb-2"
              >
                <div className="flex-grow mb-4 sm:mb-0">
                  <p className="font-bold text-lg">{plan.title}</p>
                  {plan.video_url && (
                    <a
                      href={plan.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-300 hover:underline truncate block"
                    >
                      {plan.video_url}
                    </a>
                  )}
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => openModalForEdit(plan)}
                    className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => markComplete(plan.id)}
                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => markIncomplete(plan.id)}
                    className="text-sm bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow transition-colors"
                  >
                    Mark Incomplete
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-sm bg-red-100 text-red-600 px-4 py-2 rounded-lg shadow hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">
              You have no incomplete tasks.
            </p>
          )}
        </div>
      </div>
      {/* Completed Tasks Section */}
      <div className="p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <h2 className="text-xl font-bold mb-4">Completed Tasks</h2>
        <div className="space-y-4">
          {completedPlans.length > 0 ? (
            completedPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm mb-2"
              >
                <div className="flex-grow mb-4 sm:mb-0">
                  <p className="font-bold text-lg">{plan.title}</p>
                  {plan.video_url && (
                    <a
                      href={plan.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-300 hover:underline truncate block"
                    >
                      {plan.video_url}
                    </a>
                  )}
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => openModalForEdit(plan)}
                    className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => markIncomplete(plan.id)}
                    className="text-sm bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow transition-colors"
                  >
                    Mark Incomplete
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-sm bg-red-100 text-red-600 px-4 py-2 rounded-lg shadow hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">
              You have no completed tasks.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Planner;
