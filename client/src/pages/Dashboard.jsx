import React from "react";
import PlannerCard from "../components/PlannerCard";
import GenerateNotesCard from "../components/GenerateNotesCard";

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <PlannerCard />
        </div>
        <div>
          <GenerateNotesCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
