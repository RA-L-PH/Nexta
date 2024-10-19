import { Routes, Route, Navigate } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import { FaUser, FaBriefcase, FaFileAlt } from 'react-icons/fa';
import UserProfile from "./UserProfile"; // Import the UserProfile component

function ProfilePage() {
  return (
    <div className="flex h-screen">
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
      <div className="flex-grow p-4">
        <Routes>
          <Route path="Profile" element={<UserProfile />} />
          <Route path="myJobs" element={<div>Hello Job</div>} />
          <Route path="myResume" element={<div>Hello Resume</div>} />
          {/* Add other nested routes here */}
        </Routes>
      </div>
    </div>
  );
}

export default ProfilePage;