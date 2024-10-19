import React, { useState, useEffect, useRef, Suspense, lazy, useContext } from "react";
import { Button } from "./components/ui/button";
import { BrowserRouter, Link, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UserAppointment from "./pages/UserAppointment";
import DoctorPage from "./pages/FreelancerPage";
import LoginPage from "./pages/LoginPage";
import CompanyForm from "./pages/CompanyForm";
import ProfilePage from "./pages/ProfilePage";
import { Home, LogIn } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa6";
import { CiViewList } from "react-icons/ci";
import { MdAdminPanelSettings } from "react-icons/md";
import { signOutUser } from "./firebase/auth";
import { AuthContext } from "./contexts/authContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoOrganization } from "react-icons/go";
import CompanyPage from './pages/CompanyPage'
import logo from "../public/logo.png";
import FreelancerForm from "./pages/FreelancerForm";
import Checkout from "./pages/Checkout";
import JobPage from "./pages/JobPage";

// PrivateRoute Component
const PrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

const App = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useContext(AuthContext);


  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsAuthenticated(false);
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <BrowserRouter>
    <ToastContainer />
      <header className="flex justify-between items-center bg-gradient-to-r from-deep-blue to-soft-gray p-4 shadow-lg">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold cursor-pointer">
            <img src={logo} className="h-20 w-20 mr-2" alt="Logo"/>
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link
                to="/"
                className="flex items-center text-black hover:text-blue-300 transition-colors font-semibold"
              >
                <Home className="mr-2 stroke-2" size={22} />
                <span className="text-sm uppercase tracking-wide">Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/JobPage"
                className="flex items-center text-black hover:text-blue-300 transition-colors font-semibold"
              >
                <FaBriefcase className="mr-2 stroke-2" size={22} />
                <span className="text-sm uppercase tracking-wide">Job</span>
              </Link>
            </li>
            <li>
              <Link
                to="/People"
                className="flex items-center text-black hover:text-blue-300 transition-colors font-semibold"
              >
                <FaUserTie className="mr-2" size={22} />
                <span className="text-sm uppercase tracking-wide">People</span>
              </Link>
            </li>
            <li>
              <Link
                to="/Company"
                className="flex items-center text-black hover:text-blue-300 transition-colors font-semibold"
              >
                <GoOrganization className="mr-2" size={22} />
                <span className="text-sm uppercase tracking-wide">Company</span>
              </Link>
            </li>
            <li>
              <Link
                to="/HireList"
                className="flex items-center text-black hover:text-blue-300 transition-colors font-semibold"
              >
                <CiViewList className="mr-2 stroke-1" size={22} />
                <span className="text-sm uppercase tracking-wide">My HireList</span>
              </Link>
            </li>
            {user ? (
              <li className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center text-black hover:text-blue-300 transition-colors font-semibold"
                >
                  <FaUserCircle className="mr-2" size={22} />
                  <span className="text-sm uppercase tracking-wide">{user.displayName}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                    <ul className="py-2">
                      <li>
                        <Link
                          to="/myProfile/Profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 transition-colors"
                        >
                          View Full Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/HireList"
                          className="block px-4 py-2 text-gray-700 hover:bg-indigo-100 transition-colors"
                        >
                          My HireList
                        </Link>
                      </li>
                      <li>
                        <Link to="/auth/login" className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100 transition-colors" onClick={handleLogout}>
                          Logout
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <Link to="/auth/login">
                  <Button className="flex items-center bg-blue-400 hover:bg-blue-500 text-indigo-900 font-bold py-2 px-4 rounded-full transition-colors">
                    <LogIn className="mr-2 stroke-2" size={20} />
                    <span className="text-sm uppercase tracking-wide text-black">Login</span>
                  </Button>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/HireList" element={<UserAppointment />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/People" element={<DoctorPage />} />
          <Route path="/Company" element={<CompanyPage />} />
          <Route path="/JobPage" element={<JobPage />} />


          <Route path="/myProfile/*" element={<ProfilePage />} />
          <Route path="/RegistrationCompany" element={<CompanyForm />} />
          <Route path="/RegistrationUser" element={<FreelancerForm />} /> 
          <Route path= "/checkout" element={<Checkout/>} />

        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;