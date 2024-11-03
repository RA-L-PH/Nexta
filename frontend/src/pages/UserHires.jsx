import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { HiOutlineMail } from "react-icons/hi";
import { IoCall } from "react-icons/io5";

const UserHires = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('alphabetical');
  const [acceptedCandidates, setAcceptedCandidates] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const fetchAcceptedCandidates = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const bookedRef = collection(db, 'users', user.uid, 'booked');
          const bookedSnapshot = await getDocs(bookedRef);

          const candidates = bookedSnapshot.docs.flatMap((doc) => {
            const { cartItems } = doc.data();
            return cartItems
              .filter((item) => item.status === 'Accepted')
              .map((item) => ({
                id: doc.id,
                name: item.doctorDetails?.name || 'Unknown',
                position: item.doctorDetails?.workingType || 'N/A',
                mobileNo: item.doctorDetails?.mobileNo || 'N/A',
                email: item.doctorDetails?.email || 'N/A',
                startDate: doc.data().startDate || 'N/A',
                endDate: doc.data().endDate || 'N/A',
              }));
          });

          setAcceptedCandidates(candidates);
        }
      } catch (error) {
        console.error('Error fetching accepted candidates:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchAcceptedCandidates();
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCandidates = acceptedCandidates
    .filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'latest') {
        return b.id.localeCompare(a.id);
      } else if (sortOption === 'oldest') {
        return a.id.localeCompare(b.id);
      }
      return 0;
    });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hired Candidates</h1>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search by name or position"
          value={searchTerm}
          onChange={handleSearch}
          className="mb-4 p-2 border border-gray-300 rounded w-full mr-2"
        />
        <select
          className="mb-4 p-2 border border-gray-300 rounded"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCandidates.map(candidate => (
          <div key={candidate.id} className="border p-4 rounded shadow">
            <h1 className="text-4xl font-semibold">{candidate.name}</h1>
            <p className="text-gray-600">{candidate.position}</p>
            <p className="text-gray-500">Start Date: {candidate.startDate}</p>
            <p className="text-gray-500">End Date: {candidate.endDate}</p>
            <p className="text-gray-500">
              <a href={`mailto:${candidate.email}`} className="hover:underline">
                <HiOutlineMail className="inline-block mr-1" />
                {candidate.email}
              </a>
            </p>
            <p className="text-gray-500">
              <a href={`tel:${candidate.mobileNo}`} className="hover:underline">
                <IoCall className="inline-block mr-1" />
                {candidate.mobileNo}
              </a>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHires;
