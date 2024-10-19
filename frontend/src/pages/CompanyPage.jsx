import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faGlobe, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { GiPaperClip } from "react-icons/gi";
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { MdOutlineMiscellaneousServices } from "react-icons/md";
import { db } from '../firebase/firebase'; // Adjust the import path if needed
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const currentUser = auth.currentUser;

const storage = getStorage();

const DoctorPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [moreInfoPopup, setMoreInfoPopup] = useState({ isOpen: false, doctor: null });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const doctorsList = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const userData = { id: doc.id, ...doc.data() };
          const freelancerSnapshot = await getDocs(collection(db, 'users', doc.id, 'Companies'));
          const freelancerDetails = await Promise.all(freelancerSnapshot.docs.map(async (freelancerDoc) => {
            const data = freelancerDoc.data();
            const photoRef = ref(storage, data.logoFile);
            const photoURL = await getDownloadURL(photoRef);
            return { ...data, photoURL };
          }));
          return { ...userData, freelancerDetails };
        }));
        setDoctors(doctorsList);
        setFilteredDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors: ", error);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = doctors.filter(doctor => 
      (doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doctor.freelancerDetails.some(freelancer => 
        freelancer.qualification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        freelancer.skills?.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );

    filtered = filtered.filter(doctor => doctor.role === 'Company');
  
    if (sortOption === 'alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } 
    else if (sortOption === 'experience') {
      filtered.sort((a, b) => {
        const aExperience = Math.max(...a.freelancerDetails.map(f => f.experience));
        const bExperience = Math.max(...b.freelancerDetails.map(f => f.experience));
        return bExperience - aExperience;
      });
    }
    else if (sortOption === 'fee'){
      filtered.sort((a, b) => {
        const aFee = Math.min(...a.freelancerDetails.map(f => f.hourlyRate));
        const bFee = Math.min(...b.freelancerDetails.map(f => f.hourlyRate));
        return aFee - bFee;
      });
    }
  
    setFilteredDoctors(filtered);
  }, [searchQuery, sortOption, doctors]);

  const handleInfoPopup = (doctor) => {
    setMoreInfoPopup({ isOpen: true, doctor });
  };

  const closeInfoPopup = () => {
    setMoreInfoPopup({ isOpen: false, doctor: null });
  };

  const handleApply = async (freelancer) => {
    const userId = currentUser ? currentUser.uid : null; // Get current user ID
    
    if (!userId) {
      alert('Please log in to apply.');
      return;
    }
  
    const applicationData = {
      companyName: freelancer.companyName,
      ID: freelancer.id,
      appliedAt: new Date(),
    };
  
    try {
      await setDoc(doc(collection(db, 'users', userId, 'applications'), freelancer.companyName), applicationData);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error("Error submitting application: ", error);
      alert('Failed to submit application. Please try again later.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white py-8 font-sans">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl text-purple-900 font-extrabold mb-8 text-center"
        >
          Hire talent that moves your company forward.
        </motion.h1>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search by name, specialty, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/2 px-4 py-2 border-2 border-purple-600 rounded-full text-purple-900 focus:outline-none focus:border-purple-800 transition duration-300 ease-in-out"
          />
        </div>

        {/* Sorting */}
        <div className="flex justify-center mb-8">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-1/4 px-4 py-2 border-2 border-purple-600 rounded-full text-purple-900 focus:outline-none focus:border-purple-800 transition duration-300 ease-in-out"
          >
            <option value="">Sort By</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="experience">Experience</option>
            <option value="fee">Fee</option>
          </select>
        </div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredDoctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center border-2 border-purple-300 relative"
            >
              {/* Info Icon */}
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="absolute top-4 right-4 text-purple-600 cursor-pointer"
                onClick={() => handleInfoPopup(doctor)}
              />

              {doctor.freelancerDetails.map((freelancer) => (
                <img
                  key={freelancer.photoURL}
                  src={freelancer.photoURL}
                  alt="Doctor's profile"
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                />
              ))}
              <h3 className="text-lg font-semibold text-gray-800">{doctor.freelancerDetails.map((freelancer) => freelancer.companyName).join(', ')}</h3>
              <p className="text-gray-600">
                    <span className="flex items-center justify-center">
                    <MdOutlineMiscellaneousServices className="mr-2 text-xl"/>
                    {doctor.freelancerDetails.map((freelancer) => freelancer.productsServices).join(', ')}
                    </span>
                </p>
                <p className="text-gray-600">
                    <span className="flex items-center justify-center">
                    <GiPaperClip className="mr-2 text-xl"/>
                    {doctor.freelancerDetails.map((freelancer) => freelancer.missionStatement).join(', ')}
                    </span>
                </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* More Info Popup */}
      {moreInfoPopup.isOpen && moreInfoPopup.doctor && (
  <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white rounded-lg shadow-lg p-6 relative w-4/12">
      <button
        onClick={closeInfoPopup}
        className="absolute top-4 right-4 text-red-600 hover:text-red-900 transition duration-300"
      >
        &times;
      </button>

      {moreInfoPopup.doctor.freelancerDetails.map((freelancer) => (
        <div key={freelancer.photoURL}>
          <h2 className="text-2xl font-bold mb-4 text-gray-700">{freelancer.companyName}</h2>
          <p><strong>Company Address:</strong> {freelancer.companyAddress}</p>
          <p><strong>History:</strong> {freelancer.companyHistory}</p>
          <p><strong>Mission Statement:</strong> {freelancer.missionStatement}</p>

          {/* Contact Information */}
          <div className="mt-4">
            <h3 className="text-xl font-bold text-gray-700">Contact Information</h3>
            <div className="flex gap-4 mt-2">
              {/* Phone Icon */}
              {freelancer.phoneNumber && (
                <a href={`tel:${freelancer.phoneNumber}`} className="text-lg text-gray-600" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faPhone} size="lg" />
                </a>
              )}
              
              {/* Email Icon */}
              {freelancer.email && (
                <a href={`mailto:${freelancer.email}`} className="text-lg text-gray-600" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faEnvelope} size="lg" />
                </a>
              )}
              
              {/* Website Icon */}
              {freelancer.websiteURL && (
                <a href={freelancer.websiteURL} className="text-lg text-gray-600" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faGlobe} size="lg" />
                </a>
              )}
            </div>
          </div>
          {/* Apply Button */}
          <div className="mt-4">
                  <button
                    onClick={() => handleApply(freelancer)}
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700  transition duration-300"
                  >
                    Apply Now!
                  </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
};

export default DoctorPage;
