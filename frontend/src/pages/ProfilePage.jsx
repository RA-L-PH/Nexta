import { Routes, Route, Navigate } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import { FaUser, FaUsers, FaTasks, FaBriefcase, FaFileAlt } from 'react-icons/fa';
import { IoPeopleSharp, IoDocuments } from "react-icons/io5";
import UserProfile from "./UserProfile"; // Import the UserProfile component
import UserJobs from "./UserJobs"; // Import the UserProfile component
import CompanyProfile from "./CompanyProfile";
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import ManageJobs from "./ManageJobs";
import MyResume from "./MyResume";
import UserHires from "./UserHires";
import CompanyHires from "./CompanyHires";
import Applications from "./Applications";

function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('User is not authenticated!');
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar for different roles */}
      <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
        <h1 className="text-2xl font-bold p-4">Dashboard</h1>
        <nav className="flex flex-col p-4 space-y-2">
          {userData.role === 'User' ? (
            <>
              {/* User Role Sidebar */}
              <NavLink
                to="/myProfile/Profile"
                className={({ isActive }) =>
                  isActive ? 'bg-gray-700 p-3 rounded-lg flex items-center' : 'p-3 rounded-lg flex items-center hover:bg-gray-700'
                }
              >
                <FaUser className="mr-2" /> Profile
              </NavLink>
              <NavLink
                to="/myProfile/myJobs"
                className={({ isActive }) =>
                  isActive ? 'bg-gray-700 p-3 rounded-lg flex items-center' : 'p-3 rounded-lg flex items-center hover:bg-gray-700'
                }
              >
                <FaBriefcase className="mr-2" /> My Jobs
              </NavLink>
              <NavLink
                to="/myProfile/myResume"
                className={({ isActive }) =>
                  isActive ? 'bg-gray-700 p-3 rounded-lg flex items-center' : 'p-3 rounded-lg flex items-center hover:bg-gray-700'
                }
              >
                <FaFileAlt className="mr-2" /> My Resume
              </NavLink>
              <NavLink
                to="/myProfile/myHires"
                className={({ isActive }) =>
                  isActive ? 'bg-gray-700 p-3 rounded-lg flex items-center' : 'p-3 rounded-lg flex items-center hover:bg-gray-700'
                }
              >
                <IoPeopleSharp className="mr-2" /> My Hires
              </NavLink>
            </>
          ) : userData.role === 'Company' ? (
            <>
              {/* Admin Role Sidebar */}
              <NavLink
                to="/myProfile/Profile"
                className={({ isActive }) =>
                  isActive ? 'bg-gray-700 p-3 rounded-lg flex items-center' : 'p-3 rounded-lg flex items-center hover:bg-gray-700'
                }
              >
                <FaUsers className="mr-2" /> Company Profile
              </NavLink>
              <NavLink
                to="/myProfile/manageJobs"
                className={({ isActive }) =>
                  isActive ? 'bg-gray-700 p-3 rounded-lg flex items-center' : 'p-3 rounded-lg flex items-center hover:bg-gray-700'
                }
              >
                <FaTasks className="mr-2" /> Manage Jobs
              </NavLink>
              <NavLink
                to="/myProfile/applications"
                className={({ isActive }) =>
                  isActive ? 'bg-gray-700 p-3 rounded-lg flex items-center' : 'p-3 rounded-lg flex items-center hover:bg-gray-700'
                }
              >
                <IoDocuments className="mr-2" /> Applications
              </NavLink>
              <NavLink
                to="/myProfile/myHires"
                className={({ isActive }) =>
                  isActive ? 'bg-gray-700 p-3 rounded-lg flex items-center' : 'p-3 rounded-lg flex items-center hover:bg-gray-700'
                }
              >
                <IoPeopleSharp className="mr-2" /> My Hires
              </NavLink>
            </>
          ) : (
            <div className="text-red-500 p-4">No Sidebar Available</div>
          )}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-grow p-4">
        <Routes>
          {userData.role === 'User' ? (
            <>
              <Route path="Profile" element={<UserProfile />} />
              <Route path="myJobs" element={<UserJobs />} />
              <Route path="myResume" element={<MyResume />} />
              <Route path="myHires" element={<UserHires />} />
              {/* Redirect in case of invalid route */}
            </>
          ) : userData.role === 'Company' ? (
            <>
              <Route path="Profile" element={<CompanyProfile />} />
              <Route path="manageJobs" element={<ManageJobs />} />
              <Route path="applications" element={<Applications/>} />
              <Route path="myHires" element={<CompanyHires/>} />
              {/* Redirect in case of invalid route */}
            </>
          ) : (
            <Route path="*" element={<div>No Routes Available</div>} />
          )}
        </Routes>
      </div>
    </div>
  );
}

export default ProfilePage;