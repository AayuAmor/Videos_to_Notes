import React, { useState, useEffect } from "react";
import AddTaskModal from "../components/AddTaskModal";

const Planner = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all', 'planned', 'unplanned'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async (currentFilter) => {
    setLoading(true);
    try {
      const url =
        currentFilter === "all"
          ? "http://localhost:8080/api/planner"
          : `http://localhost:8080/api/planner?status=${currentFilter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(filter);
  }, [filter]);

  const handleAddTask = async ({ title, dueDate }) => {
    try {
      const response = await fetch("http://localhost:8080/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, status: "unplanned", dueDate }),
      });
      if (!response.ok) throw new Error("Failed to add task");
      fetchTasks(filter); // Refetch tasks to show the new one
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Planner</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Your Tasks</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 px-6 py-3 rounded-md font-bold hover:bg-blue-700"
        >
          Add New Task
        </button>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={handleAddTask}
      />

      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tasks</h2>
          <div className="flex space-x-2 text-sm">
            <button
              onClick={() => setFilter("unplanned")}
              className={`px-4 py-2 rounded-md ${
                filter === "unplanned" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              Unplanned
            </button>
            <button
              onClick={() => setFilter("planned")}
              className={`px-4 py-2 rounded-md ${
                filter === "planned" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              Planned
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md ${
                filter === "all" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              All
            </button>
          </div>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <ul className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className="bg-gray-700 p-4 rounded-md flex justify-between items-center"
                >
                  <div>
                    <span>{task.title}</span>
                    {task.dueDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      task.status === "planned"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {task.status}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No tasks found for this filter.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Planner;
