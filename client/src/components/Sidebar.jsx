import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";
import { Home, Calendar, BarChart2, User, Clock, Settings } from "lucide-react";

const Sidebar = () => {
  const { theme } = useTheme();
  const bgClass =
    theme === "dark" ? "bg-gray-900" : "bg-white border-r border-gray-200";
  const iconColor =
    theme === "dark"
      ? "text-gray-400 hover:text-white"
      : "text-gray-500 hover:text-blue-600";
  return (
    <div
      className={`w-20 h-screen p-4 flex flex-col items-center fixed top-0 left-0 z-30 ${bgClass}`}
    >
      <div className="mb-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
      </div>
      <nav className="flex flex-col space-y-8 w-full">
        <Link to="/" className={iconColor + " flex justify-center"}>
          <Home />
        </Link>
        <Link to="/planner" className={iconColor + " flex justify-center"}>
          <Calendar />
        </Link>
        <Link to="/stats" className={iconColor + " flex justify-center"}>
          <BarChart2 />
        </Link>
        <Link to="/user" className={iconColor + " flex justify-center"}>
          <User />
        </Link>
        <Link to="/history" className={iconColor + " flex justify-center"}>
          <Clock />
        </Link>
        <Link to="/settings" className={iconColor + " flex justify-center"}>
          <Settings />
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
