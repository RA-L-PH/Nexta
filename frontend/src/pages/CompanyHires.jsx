import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { HiOutlineMail } from "react-icons/hi";
import { IoCall } from "react-icons/io5";

const CompanyHires = () => {
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

          const bookedCandidates = bookedSnapshot.docs.flatMap((doc) => {
            const { cartItems } = doc.data();
            return cartItems
              .filter((item) => item.status === 'Accepted')
              .map((item) => ({
                id: doc.id,
                name: item.doctorDetails?.name || 'Unknown',
                position: item.doctorDetails?.workingType || 'N/A',
                skills : item.doctorDetails?.skills || 'N/A',
                mobileNo : item.doctorDetails?.mobileNo || 'N/A',
                email : item.doctorDetails?.email || 'N/A',
              }));
          });

          const receivedAppsRef = collection(db, 'users', user.uid, 'receivedApplications');
          const receivedAppsSnapshot = await getDocs(receivedAppsRef);

          const receivedCandidates = await Promise.all(
            receivedAppsSnapshot.docs.map(async (doc) => {
              const applicantId = doc.data().applicantId;
              if (doc.data().status === 'Approved' && applicantId) {
                // Fetch the extra details from the Freelancer subcollection
                const freelancerRef = collection(db, 'users', applicantId, 'Freelancer');
                const freelancerSnapshot = await getDocs(freelancerRef);

                const freelancerData = freelancerSnapshot.docs[0]?.data() || {}; // Assuming only one document per user in Freelancer subcollection
                return {
                  id: doc.id,
                  name: freelancerData.name || 'Unknown',
                  position: freelancerData.workingType || 'N/A',
                  skills : freelancerData.skills || 'N/A',
                  mobileNo : freelancerData.mobileNo || 'N/A',
                  email : freelancerData.email || 'N/A',
                };
              }
              return null;
            })
          );

          setAcceptedCandidates([
            ...bookedCandidates,
            ...receivedCandidates.filter((candidate) => candidate !== null),
          ]);
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchAcceptedCandidates();
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const filteredCandidates = acceptedCandidates
    .filter((candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Search candidates..."
          className="p-2 border border-gray-300 rounded w-full mr-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
      <ul>
        {filteredCandidates.map((candidate) => (
          <li key={candidate.id} className="mb-2 p-2 border border-gray-300 rounded flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold">{candidate.name}</h2>
              <p className="text-gray-600">{candidate.position} | Skills: {candidate.skills}</p>
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompanyHires;
