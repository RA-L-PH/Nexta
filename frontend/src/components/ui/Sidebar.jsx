import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaUser, FaBriefcase, FaFileAlt } from 'react-icons/fa';

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      <h1 className="text-2xl font-bold p-4">Dashboard</h1>
      <nav className="flex flex-col p-4 space-y-2">
        {/* Profile Link */}
        <NavLink
          to="/myProfile/Profile"
          className={({ isActive }) =>
            isActive ? 'bg-gray-700 p-3 rounded-lg flex items-center' : 'p-3 rounded-lg flex items-center hover:bg-gray-700'
          }
        >
          <FaUser className="mr-2" /> Profile
        </NavLink>

        {/* My Jobs Link */}
        <NavLink
          to="/myProfile/myJobs"
          className={({ isActive }) =>
            isActive ? 'bg-gray-700 p-3 rounded-lg flex items-center' : 'p-3 rounded-lg flex items-center hover:bg-gray-700'
          }
        >
          <FaBriefcase className="mr-2" /> My Jobs
        </NavLink>

        {/* My Resume Link */}
        <NavLink
          to="/myProfile/myResume"
          className={({ isActive }) =>
            isActive ? 'bg-gray-700 p-3 rounded-lg flex items-center' : 'p-3 rounded-lg flex items-center hover:bg-gray-700'
          }
        >
          <FaFileAlt className="mr-2" /> My Resume
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
