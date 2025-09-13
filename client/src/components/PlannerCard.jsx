import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalTasks } from "../useLocalTasks";

const PlannerCard = () => {
  const { tasks } = useLocalTasks();
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const filteredPlans = tasks.filter((plan) => {
    if (filter === "All") return true;
    if (filter === "Unplanned") {
      // Unplanned: no url and no process_time
      return !plan.video_url && !plan.process_time;
    }
    if (filter === "Planned") {
      // Planned: has url or process_time
      return plan.video_url || plan.process_time;
    }
    return true;
  });

  return (
    <div className="p-6 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-none shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Planner</h2>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>
      <div className="flex space-x-4 text-sm">
        <button
          onClick={() => setFilter("Unplanned")}
          className={`px-4 py-2 rounded-md font-semibold transition-colors ${
            filter === "Unplanned"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
          }`}
        >
          Unplanned
        </button>
        <button
          onClick={() => setFilter("Planned")}
          className={`px-4 py-2 rounded-md font-semibold transition-colors ${
            filter === "Planned"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
          }`}
        >
          Planned
        </button>
        <button
          onClick={() => setFilter("All")}
          className={`px-4 py-2 rounded-md font-semibold transition-colors ${
            filter === "All"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
          }`}
        >
          All
        </button>
      </div>
      <div className="mt-4">
        {filteredPlans.length > 0 ? (
          <ul className="space-y-2">
            {filteredPlans.slice(0, 5).map((plan) => (
              <li
                key={plan.id}
                className="p-3 rounded-md flex justify-between items-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <span className="font-semibold">{plan.title}</span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    plan.status === "Completed"
                      ? "bg-green-500 text-white"
                      : plan.status === "In Progress"
                      ? "bg-yellow-500 text-black"
                      : plan.status === "Planned"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {plan.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 mt-4">No study plans found.</p>
        )}
        {filteredPlans.length > 5 && (
          <button
            onClick={() => navigate("/planner")}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            View All
          </button>
        )}
      </div>
    </div>
  );
};

export default PlannerCard;
