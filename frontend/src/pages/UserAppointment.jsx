import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { doc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';


const auth = getAuth();
const storage = getStorage();

const UserAppointment = () => {
  const navigate = useNavigate();
  const [freelancerDetails, setFreelancerDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  useEffect(() => {
    const fetchFreelancerData = async () => {
      if (userId) {
        try {
          const userRef = doc(db, 'users', userId); // Reference to user document
          const freelancersRef = collection(userRef, 'cart'); // Reference to user's cart subcollection
          const freelancerSnap = await getDocs(freelancersRef);

          // Array of promises to fetch doctor details based on freelancer.doctorId
          const freelancerDetailsPromises = freelancerSnap.docs.map(async (freelancerDoc) => {
            const freelancerData = freelancerDoc.data();
            const doctorId = freelancerData.doctorId;

            // Fetch doctor details using doctorId
            const doctorRef = doc(db, 'users', doctorId); // Correct usage of doc()
            const freelancerSubRef = collection(doctorRef, 'freelancer'); // Subcollection inside doctor's document
            const doctorDetailsSnap = await getDocs(freelancerSubRef);

            // Assuming only one document in 'freelancer' subcollection, we take the first one
            const doctorDetails = doctorDetailsSnap.docs.length > 0
              ? doctorDetailsSnap.docs[0].data()
              : null;

            return {
              id: freelancerDoc.id, // Freelancer document ID
              ...freelancerData, // Freelancer data
              doctorDetails, // Doctor details from subcollection
            };
          });

          // Resolve all promises and update state
          const resolvedFreelancerDetails = await Promise.all(freelancerDetailsPromises);
          setFreelancerDetails(resolvedFreelancerDetails);
          setLoading(false);
        } catch (err) {
          console.log('Error fetching freelancer data!', err);
        }
      } else {
        console.log('User is not authenticated!');
        setLoading(false);
      }
    };

    fetchFreelancerData();
  }, [userId]);

  const handleCheckout = () => {
    if (freelancerDetails.length === 0) {
      alert('Your cart is empty. Add some doctors to proceed.');
      return;
    }

    // Optionally, pass the cart data to the checkout page
    navigate('/checkout', { state: { cartItems: freelancerDetails } });
  };

  const handleRemoveFromCart = async (freelancerId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const freelancerRef = doc(userRef, 'cart', freelancerId);
      await deleteDoc(freelancerRef);

      // Update local state after deletion
      setFreelancerDetails((prevDetails) => prevDetails.filter((item) => item.id !== freelancerId));
    } catch (err) {
      console.log('Error removing from cart!', err);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="mx-auto mt-8 w-[calc(100%-40px)] p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Cart</h1>
      {freelancerDetails.length > 0 ? (
        <ul>
          {freelancerDetails.map((freelancer) => (
            <li
              key={freelancer.id}
              className="flex items-center justify-between bg-gray-100 p-4 mb-4 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={freelancer.doctorDetails?.profilePhoto || '/default-avatar.png'}
                  alt="Doctor profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold">
                    {freelancer.doctorDetails ? freelancer.doctorDetails.name : 'Unknown'}
                  </h2>
                  <p className="text-gray-600">
                    Working Type: {freelancer.doctorDetails ? freelancer.doctorDetails.workingType : 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFromCart(freelancer.id)}
                className="flex items-center space-x-1 text-red-500 hover:text-red-700"
              >
                <FaTrash className="w-5 h-5" />
                <span>Remove</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">Cart is Empty.</p>
      )}

      {/* Proceed to Checkout Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleCheckout}
          className="bg-blue-500 px-6 py-2 rounded-lg text-white hover:bg-blue-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};


export default UserAppointment;
