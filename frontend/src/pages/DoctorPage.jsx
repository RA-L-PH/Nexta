import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faBriefcase, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { MdAddBox,MdCheckBox } from "react-icons/md";
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/firebase'; // Adjust the import path if needed


const storage = getStorage();

const DoctorPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const doctorsList = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const userData = { id: doc.id, ...doc.data() };
          const freelancerSnapshot = await getDocs(collection(db, 'users', doc.id, 'freelancer'));
          const freelancerDetails = await Promise.all(freelancerSnapshot.docs.map(async (freelancerDoc) => {
            const data = freelancerDoc.data();
            const photoRef = ref(storage, data.photoFile);
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
  
    if (minFee) filtered = filtered.filter(doctor => 
      doctor.freelancerDetails.some(freelancer => freelancer.hourlyRate >= parseInt(minFee))
    );
    if (maxFee) filtered = filtered.filter(doctor => 
      doctor.freelancerDetails.some(freelancer => freelancer.hourlyRate <= parseInt(maxFee))
    );
    if (minExperience) filtered = filtered.filter(doctor => 
      doctor.freelancerDetails.some(freelancer => freelancer.experience >= parseInt(minExperience))
    );
    if (maxExperience) filtered = filtered.filter(doctor => 
      doctor.freelancerDetails.some(freelancer => freelancer.experience <= parseInt(maxExperience))
    );
  
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
  }, [searchQuery, minFee, maxFee, minExperience, maxExperience, sortOption, doctors]);

  const addToCart = async (doctorId) => {
    try {
      if (!doctorId) {
        throw new Error('Doctor ID is undefined');
      }
  
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        throw new Error('User not authenticated');
      }
  
      const userId = user.uid;
      const cartRef = collection(db, 'users', userId, 'cart');
  
      await addDoc(cartRef, {
        doctorId: doctorId,
        addedAt: new Date()
      });
  
      console.log('Doctor added to cart successfully');
    } catch (error) {
      console.error('Error adding doctor to cart:', error);
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

        {/* Filters */}
        <div className="flex flex-wrap justify-center mb-8 space-x-4">
          <input
            type="number"
            placeholder="Min Fee"
            value={minFee}
            onChange={(e) => setMinFee(e.target.value)}
            className="w-30 px-4 py-2 border-2 border-purple-600 rounded-full text-purple-900 focus:outline-none focus:border-purple-800 transition duration-300 ease-in-out"
          />
          <input
            type="number"
            placeholder="Max Fee"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            className="w-30 px-4 py-2 border-2 border-purple-600 rounded-full text-purple-900 focus:outline-none focus:border-purple-800 transition duration-300 ease-in-out"
          />
          <input
            type="number"
            placeholder="Min Experience"
            value={minExperience}
            onChange={(e) => setMinExperience(e.target.value)}
            className="w-30 px-4 py-2 border-2 border-purple-600 rounded-full text-purple-900 focus:outline-none focus:border-purple-800 transition duration-300 ease-in-out"
          />
          <input
            type="number"
            placeholder="Max Experience"
            value={maxExperience}
            onChange={(e) => setMaxExperience(e.target.value)}
            className="w-30 px-4 py-2 border-2 border-purple-600 rounded-full text-purple-900 focus:outline-none focus:border-purple-800 transition duration-300 ease-in-out"
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-30 px-4 py-2 border-2 border-purple-600 rounded-full text-purple-900 focus:outline-none focus:border-purple-800 transition duration-300 ease-in-out"
          >
            <option value="">Sort By</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="experience">Experience</option>
            <option value="hourlyRate">Fee</option>
          </select>
        </div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredDoctors.map(doctor => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-4"
            >
            <button
                onClick={() => addToCart(doctor.id)}
                className="absolute top-0 left-0 bg-purple-500 text-white w-8 h-8 flex items-center justify-center rounded"
              >
                <MdAddBox />
              </button>
              {doctor.freelancerDetails.map((freelancer, index) => (
                <div key={index} className="flex flex-col items-center text-center space-y-4">
                  <img
                    src={freelancer.photoURL}
                    alt={freelancer.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <h3 className="text-2xl text-purple-900 font-bold">{freelancer.name}</h3>
                  <p className="text-gray-700">
                    <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-purple-600" />
                    {freelancer.qualification}
                  </p>
                  <p className="text-gray-700">
                    <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-purple-600" />
                    {freelancer.skills}
                  </p>
                  <p className="text-purple-600 font-semibold">
                    <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
                    {freelancer.hourlyRate} / hr
                  </p>
                  <p className="text-gray-700">
                    <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-purple-600" />
                    {freelancer.experience} years
                  </p>
                  <button className="mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg">
                    View More
                  </button>
                  <p className="mt-2 inline-block bg-gray-200 text-gray-700 py-1 px-3 rounded-full text-sm">
                    {freelancer.workingType}
                  </p>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
        </div>
      </div>
  );
};

export default DoctorPage;