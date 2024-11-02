import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // Adjust path as needed
import { getAuth } from 'firebase/auth';

const Applications = () => {
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [sentApplications, setSentApplications] = useState([]);
  const [searchReceived, setSearchReceived] = useState('');
  const [searchSent, setSearchSent] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [jobDetails, setJobDetails] = useState({});
  const auth = getAuth();
  const user = auth.currentUser ;

  useEffect(() => {
    const fetchReceivedApplications = async () => {
      if (!user) return;

      try {
        const receivedAppsRef = collection(db, `users/${user.uid}/receivedApplications`);
        const receivedSnapshot = await getDocs(receivedAppsRef);
        const applications = receivedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReceivedApplications(applications);

        const userDetailsAndJobTitlesPromises = applications.map(async (app) => {
          await fetchUserDetails(app.applicantId);
          await fetchJobTitle(app.applicantId, app.jobId);
        });

        await Promise.all(userDetailsAndJobTitlesPromises);
      } catch (error) {
        console.error('Error fetching received applications:', error);
      }
    };

    const fetchSentApplications = async () => {
      if (!user) return;

      try {
        const sentAppsRef = collection(db, `users/${user.uid}/sentApplications`);
        const sentSnapshot = await getDocs(sentAppsRef);
        const applications = sentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSentApplications(applications);

        const userDetailsAndJobTitlesPromises = applications.map(async (app) => {
          await fetchUserDetails(app.recipientId);
          await fetchJobTitle(app.recipientId, app.jobId);
        });

        await Promise.all(userDetailsAndJobTitlesPromises);
      } catch (error) {
        console.error('Error fetching sent applications:', error);
      }
    };

    const fetchUserDetails = async (applicantId) => {
      try {
        const userRef = doc(db, `users/${applicantId}`);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();

          const subCollectionRef = collection(db, `users/${applicantId}/Freelancer`);
          const subCollectionSnapshot = await getDocs(subCollectionRef);
          const subCollectionData = subCollectionSnapshot.docs.map((doc) => doc.data());

          setUserDetails((prevDetails) => ({
            ...prevDetails,
            [applicantId]: {
              ...userData,
              subCollectionData,
            },
          }));
        } else {
          console.error('No such user with ID:', applicantId);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    const fetchJobTitle = async (applicantId, jobId) => {
      try {
        const jobRef = doc(db, `users/${applicantId}/applications/${jobId}`);
        const jobSnapshot = await getDoc(jobRef);
        if (jobSnapshot.exists()) {
          const jobData = jobSnapshot.data();
          const jobTitle = jobData.jobTitle;

          setJobDetails((prevDetails) => ({
            ...prevDetails,
            [applicantId]: {
              ...prevDetails[applicantId],
              [jobId]: jobTitle,
            },
          }));
          return jobTitle;
        } else {
          console.error(`No job found with ID: ${jobId} for applicant ID: ${applicantId}`);
          return null;
        }
      } catch (error) {
        console.error('Error fetching job data:', error);
        return null;
      }
    };

    fetchReceivedApplications();
    fetchSentApplications();
  }, [user]);

  const filteredReceived = receivedApplications.filter((app) =>
    userDetails[app.applicantId]?.name?.toLowerCase().includes(searchReceived.toLowerCase())
  );

  const filteredSent = sentApplications.filter((app) =>
    userDetails[app.recipientId]?.name?.toLowerCase().includes(searchSent.toLowerCase())
  );

  return (
    <div className="p-6 flex flex-wrap">
      <div className ="w-1/2 pr-4">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-bold">Applications Received</h1>
          <input
            type="text"
            value={searchReceived}
            onChange={(e) => setSearchReceived(e.target.value)}
            placeholder="Search by name"
            className="ml-4 p-2 pl-10 text-sm text-gray-700"
          />
        </div>
        <ul className="space-y-4">
          {filteredReceived.map((app) => (
            <li key={app.id} className="p-4 border rounded-lg shadow-sm bg-white flex flex-col md:flex-row">
              {userDetails[app.applicantId] && (
                <div className="flex flex-col md:flex-row w-full">
                  {userDetails[app.applicantId].subCollectionData?.map((info, index) => (
                    <div key={index} className="p-4 border-b md:border-b-0 md:border-r last:border-r-0 flex-1">
                      <strong className="block text-lg">{info.name}</strong>
                      <p className="text-gray-700">
                        {jobDetails[app.applicantId]?.[app.jobId] || 'No job title available'}
                      </p>
                    </div>
                  ))}
                  <div className="flex-1 p-4 border-t md:border-t-0 md:border-l">
                    <strong className="block text-lg text-blue-600">
                      Status: {app.status || 'N/A'}
                    </strong>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-1/2 pl-4">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-bold">Applications Sent</h1>
          <input
            type="text"
            value={searchSent}
            onChange={(e) => setSearchSent(e.target.value)}
            placeholder="Search by name"
            className="ml-4 p-2 pl-10 text-sm text-gray-700"
          />
        </div>
        <ul className="space-y-4">
          {filteredSent.map((app) => (
            <li key={app.id} className="p-4 border rounded-lg shadow-sm bg-white flex flex-col md:flex-row">
              {userDetails[app.recipientId] && (
                <div className="flex flex-col md:flex-row w-full">
                  {userDetails[app.recipientId].subCollectionData?.map((info, index) => (
                    <div key={index} className="p-4 border-b md:border-b-0 md:border-r last:border-r-0 flex-1">
                      <strong className="block text-lg">{info.name}</strong>
                      <p className="text-gray-700">
                        {jobDetails[app.recipientId]?.[app.jobId] || 'No job title available'}
                      </p>
                    </div>
                  ))}
                  <div className="flex-1 p-4 border-t md:border-t-0 md:border-l">
                    <strong className="block text-lg text-blue-600">
                      Status: {app.status || 'N/A'}
                    </strong>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Applications;