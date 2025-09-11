import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, BarChart2, User, Clock, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-20 bg-gray-900 h-screen p-4 flex flex-col items-center">
      <div className="mb-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
      </div>
      <nav className="flex flex-col space-y-8">
        <Link to="/" className="text-gray-400 hover:text-white"><Home /></Link>
        <Link to="/planner" className="text-gray-400 hover:text-white"><Calendar /></Link>
        <Link to="/stats" className="text-gray-400 hover:text-white"><BarChart2 /></Link>
        <Link to="/user" className="text-gray-400 hover:text-white"><User /></Link>
        <Link to="/history" className="text-gray-400 hover:text-white"><Clock /></Link>
        <Link to="/settings" className="text-gray-400 hover:text-white"><Settings /></Link>
      </nav>
    </div>
  );
};

export default Sidebar;
