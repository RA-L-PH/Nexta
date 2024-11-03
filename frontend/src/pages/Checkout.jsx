import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, setDoc, deleteDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = location.state || { cartItems: [] };

  // Log cart items array to the console
  useEffect(() => {
    cartItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, item.doctorId);
    });
  }, [cartItems]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [userId, setUserId] = useState(null);
  
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSubmit = async () => {
    if (!userId) {
      alert('You must be logged in to book.');
      return;
    }
  
    // Add 'status' field to each cart item
    const updatedCartItems = cartItems.map((item) => ({
      ...item,
      status: 'Pending',
    }));

    const bookingDetails = {
      startDate,
      endDate,
      cartItems: updatedCartItems,
      userId,
      createdAt: new Date().toISOString()
    };
  
    try {
      // Create a new document in the current user's 'booked' collection
      const bookingRef = await addDoc(collection(db, 'users', userId, 'booked'), bookingDetails);
      const bookingId = bookingRef.id;
  
      // Update the booking details with the generated ID
      await setDoc(doc(db, 'users', userId, 'booked', bookingId), {
        ...bookingDetails,
        id: bookingId,
      });
  
      // Save each cart item with its status to the corresponding doctor's 'bookedRequests' collection
      const doctorBookingPromises = updatedCartItems.map(async (item) => {
        const doctorId = item.doctorId;
        const id = item.id;
        const documentId = doc(collection(db, 'users')).id; // Generate a new document ID
        await setDoc(doc(db, 'users', doctorId, 'bookedRequests', id), {
          ...item,
          bookingId,
          requesterId: userId,
          startDate,
          endDate
        });
        return { ...item, documentId };
      });
      
      await Promise.all(doctorBookingPromises);
  
      alert('Booking confirmed!');
  
      // Clear the cart after successful booking
      const cartRef = collection(db, 'users', userId, 'cart');
      const cartSnapshot = await getDocs(cartRef);
  
      const deletePromises = cartSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
  
      console.log('Cart items deleted successfully.');
      navigate('/');
    } catch (error) {
      console.error('Error saving booking or deleting cart items:', error);
    }
  };

  const isFormValid = startDate && endDate && termsAgreed;

  return (
    <div className="mx-auto mt-8 w-[calc(100%-40px)] p-4 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>
      {cartItems.length > 0 ? (
        <ul>
          {cartItems.map((freelancer) => (
            <li key={freelancer.id} className="flex items-center justify-between bg-gray-100 p-4 mb-4 rounded-lg">
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
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No items in the cart.</p>
      )}

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg p-2 w-full"
              required
            />
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mr-2"
              required
            />
            <label className="text-gray-700">
              I agree to the terms and conditions.
            </label>
          </div>
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || !userId}
              className={`px-6 py-2 rounded-lg text-white ${isFormValid && userId ? 'bg-green-500 hover:bg-green-700' : 'bg-gray-500 cursor-not-allowed'}`}
            >
              Confirm and Pay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
