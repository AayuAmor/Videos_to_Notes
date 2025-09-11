import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PlannerCard = () => {
  const [plans, setPlans] = useState([]);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/study-plans");
        if (!response.ok) {
          throw new Error("Failed to fetch study plans");
        }
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching study plans:", error);
      }
    };

    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => {
    if (filter === "All") return true;
    if (filter === "Planned") return plan.status === "Planned";
    if (filter === "Unplanned") return plan.status === "Not Started";
    return true;
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg w-full">
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
          className={`${
            filter === "Unplanned" ? "bg-blue-600" : "bg-gray-700"
          } px-4 py-2 rounded-md`}
        >
          Unplanned
        </button>
        <button
          onClick={() => setFilter("Planned")}
          className={`${
            filter === "Planned" ? "bg-blue-600" : "bg-gray-700"
          } px-4 py-2 rounded-md`}
        >
          Planned
        </button>
        <button
          onClick={() => setFilter("All")}
          className={`${
            filter === "All" ? "bg-blue-600" : "bg-gray-700"
          } px-4 py-2 rounded-md`}
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
                className="bg-gray-700 p-3 rounded-md flex justify-between items-center"
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
