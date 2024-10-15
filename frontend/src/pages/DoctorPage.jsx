import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faBriefcase, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { MdAddBox, MdCheckBox } from "react-icons/md";
import { FaLinkedin, FaGithub, FaTwitter, FaFileAlt, FaBriefcase } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase/firebase'; // Adjust the import path if needed

const storage = getStorage();
const auth = getAuth(); // Initialize Firebase Auth

const DoctorPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [maxExperience, setMaxExperience] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [addedToCart, setAddedToCart] = useState([]);  // Doctors added to cart
  const [moreInfo, setMoreInfo] = useState({}); // Store whether "More Info" is shown for each doctor
  const [resumeModal, setResumeModal] = useState({ isOpen: false, imageUrl: '' });

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
            let resumeURL = null;
            if (data.resumeFile) {
              const resumeRef = ref(storage, data.resumeFile);
              resumeURL = await getDownloadURL(resumeRef);
            }
            return { ...data, photoURL, resumeURL };
          }));
          return { ...userData, freelancerDetails };
        }));
        setDoctors(doctorsList);
        setFilteredDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors: ", error);
      }
    };

    const fetchCart = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const cartSnapshot = await getDocs(collection(db, 'users', user.uid, 'cart'));
          const cartItems = cartSnapshot.docs.map(doc => doc.data().doctorId);
          setAddedToCart(cartItems);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchDoctors();
    fetchCart();
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

  const toggleCart = async (doctorId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const userId = user.uid;
      const cartRef = collection(db, 'users', userId, 'cart');

      if (addedToCart.includes(doctorId)) {
        const doctorInCart = await getDocs(collection(db, 'users', userId, 'cart'));
        const cartDoc = doctorInCart.docs.find(doc => doc.data().doctorId === doctorId);
        if (cartDoc) {
          await deleteDoc(doc(db, 'users', userId, 'cart', cartDoc.id));
          setAddedToCart(addedToCart.filter(id => id !== doctorId));
          toast.info('Doctor removed from cart.', { position: "top-right", autoClose: 3000 });
        }
      } else {
        await addDoc(cartRef, {
          doctorId: doctorId,
          addedAt: new Date()
        });
        setAddedToCart([...addedToCart, doctorId]);
        toast.success('Doctor added to cart!', { position: "top-right", autoClose: 3000 });
      }
    } catch (error) {
      console.error('Error adding/removing doctor to/from cart:', error);
    }
  };

  const toggleMoreInfo = (doctorId) => {
    setMoreInfo(prevState => ({
      ...prevState,
      [doctorId]: !prevState[doctorId]
    }));
  };

  const handleResumeModal = (doctorId, resumeURL) => {
    setResumeModal({ isOpen: true, imageUrl: resumeURL });
  };

  const handleCloseResumeModal = () => {
    setResumeModal({ isOpen: false, imageUrl: '' });
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
              className="bg-white rounded-lg shadow-lg p-6 text-center border-2 border-purple-300"
            >
              {doctor.freelancerDetails.map((freelancer) => (
                <img
                  key={freelancer.photoURL}
                  src={freelancer.photoURL}
                  alt="Doctor's profile"
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                />
              ))}
              <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
              <p className="text-gray-600">
                <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                {doctor.freelancerDetails.map((freelancer) => freelancer.qualification).join(', ')}
              </p>
              <p className="text-gray-600">
                <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                {doctor.freelancerDetails.map((freelancer) => freelancer.experience).join(', ')} years experience
              </p>
              <p className="text-gray-600">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                {doctor.freelancerDetails.map((freelancer) => freelancer.hourlyRate).join(', ')} / hour
              </p>

              {/* More Info Button */}
              <button
                onClick={() => toggleMoreInfo(doctor.id)}
                className="w-full px-4 py-2 mt-2 text-purple-600 border-2 border-purple-600 rounded-full hover:bg-purple-100 transition duration-300"
              >
                {moreInfo[doctor.id] ? 'Hide Info' : 'More Info'}
              </button>

              {moreInfo[doctor.id] && (
                <div className="mt-4 text-left">
                  <p className="text-gray-600">
                    <strong>Skills:</strong>{' '}
                    {doctor.freelancerDetails.map((freelancer) => freelancer.skills).join(', ')}
                  </p>

                  {/* Social Profiles */}
                  {doctor.freelancerDetails.map((freelancer, index) => (
                    <div key={index} className="mt-4">
                      <h3 className="text-2xl font-bold text-gray-700">Social Profiles</h3>
                      <div className="flex gap-4">
                        {freelancer.linkedin && (
                          <a href={freelancer.linkedin} className="text-lg text-gray-600" target="_blank" rel="noopener noreferrer">
                            <FaLinkedin size={24} />
                          </a>
                        )}
                        {freelancer.github && (
                          <a href={freelancer.github} className="text-lg text-gray-600" target="_blank" rel="noopener noreferrer">
                            <FaGithub size={24} />
                          </a>
                        )}
                        {freelancer.twitter && (
                          <a href={freelancer.twitter} className="text-lg text-gray-600" target="_blank" rel="noopener noreferrer">
                            <FaTwitter size={24} />
                          </a>
                        )}
                        {freelancer.resumeURL && (
                          <button
                            onClick={() => handleResumeModal(doctor.id, freelancer.resumeURL)}
                            className="text-lg text-gray-600"
                          >
                            <FaFileAlt size={24} />
                          </button>
                        )}
                        {freelancer.portfolioURL && (
                          <a href={freelancer.portfolioURL } className="text-lg text-gray-600" target="_blank" rel="noopener noreferrer">
                            <FaBriefcase size={24} />
                            View Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}


              {/* Add to Cart Button */}
              <button
                onClick={() => toggleCart(doctor.id)}
                className={`w-full px-4 py-2 mt-4 rounded-full ${
                  addedToCart.includes(doctor.id) ? 'bg-green-500' : 'bg-purple-600'
                } text-white hover:bg-purple-700 transition duration-300`}
              >
                {addedToCart.includes(doctor.id) ? (
                  <MdCheckBox size={24} className="inline-block mr-2" />
                ) : (
                  <MdAddBox size={24} className="inline-block mr-2" />
                )}
                {addedToCart.includes(doctor.id) ? 'Added' : 'Add to Cart'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    {/* Resume Modal */}
    {resumeModal.isOpen && (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full h-full">
          <img src={resumeModal.imageUrl} alt="Resume" className="w-full h-full object-contain" />
          <button
            onClick={handleCloseResumeModal}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    )}
    </div>
  );
};

export default DoctorPage;
