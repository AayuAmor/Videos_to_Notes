import React from "react";
import { Link } from "react-router-dom";
import { Calendar, BarChart2, User, Clock, Settings } from "lucide-react";

const features = [
  {
    name: "Planner",
    description: "Organize your study schedule.",
    icon: Calendar,
    path: "/planner",
  },
  {
    name: "Stats",
    description: "View your generation statistics.",
    icon: BarChart2,
    path: "/stats",
  },
  {
    name: "User",
    description: "Manage your profile settings.",
    icon: User,
    path: "/user",
  },
  {
    name: "History",
    description: "Review past generated notes.",
    icon: Clock,
    path: "/history",
  },
  {
    name: "Settings",
    description: "Configure application settings.",
    icon: Settings,
    path: "/settings",
  },
];

const FeaturesSection = () => {
  // Example usage for API calls:
  // fetch(`${import.meta.env.VITE_API_URL}/api/feature`)
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Features
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500 dark:text-gray-400">
            All the tools you need to stay productive
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => (
              <Link to={feature.path} key={feature.name} className="group">
                <div className="rounded-lg shadow-lg p-6 h-full flex flex-col justify-center items-center text-center transform transition-transform duration-300 ease-in-out hover:scale-105 bg-gray-800 dark:bg-gray-800 bg-white text-gray-900 dark:text-white border border-gray-200 dark:border-none hover:bg-gray-700 dark:hover:bg-gray-700 hover:bg-gray-100">
                  <feature.icon
                    className="h-12 w-12 text-blue-400"
                    aria-hidden="true"
                  />
                  <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-white">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
