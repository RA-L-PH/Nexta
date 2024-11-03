import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // Adjust path as needed
import { getAuth } from 'firebase/auth';
import { IoMdInformationCircleOutline, IoMdClose } from "react-icons/io";
import { FaGithub, FaTwitter, FaLinkedin, FaFileAlt, FaGlobe } from 'react-icons/fa';


const Applications = () => {
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [searchReceived, setSearchReceived] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [disabledButtons, setDisabledButtons] = useState({}); // Track disabled buttons
  const [jobDetails, setJobDetails] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);  
  const [Candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
        if (user) {
          const bookedRef = collection(db, 'users', user.uid, 'booked');
          const bookedSnapshot = await getDocs(bookedRef);

          const candidates = bookedSnapshot.docs.flatMap((doc) => {
            const { cartItems } = doc.data();
            // Filter only items with status "Accepted" and map to required fields
            return cartItems
              .map((item) => ({
                id: doc.id,
                status: item.status,
                name: item.doctorDetails?.name || 'Unknown',
                position: item.doctorDetails?.workingType || 'N/A',
                startDate: doc.data().startDate || 'N/A', // Assuming startDate is a field in cartItems
                endDate: doc.data().endDate || 'N/A', // Assuming endDate is a field in cartItems
              }));
          });

          setCandidates(candidates);
        }
      } catch (error) {
        console.error('Error fetching accepted candidates:', error);
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

  const handleOpenModal = (app) => {
    setSelectedApplication(app);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleApprove = async (appId, applicantId, jobId) => {
    try {
      const appRef = doc(db, `users/${user.uid}/receivedApplications/${appId}`);
      await updateDoc(appRef, { status: 'Approved' });

      const subAppRef = doc(db, `users/${applicantId}/applications/${jobId}`);
      await updateDoc(subAppRef, { status: 'Approved' });

      setReceivedApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: 'Approved' } : app))
      );

      // Disable the approve button
      setDisabledButtons((prev) => ({ ...prev, [appId]: 'approve' }));

      console.log('Application approved successfully!');
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleDeny = async (appId, applicantId, jobId) => {
    try {
      const appRef = doc(db, `users/${user.uid}/receivedApplications/${appId}`);
      await updateDoc(appRef, { status: 'Denied' });

      const subAppRef = doc(db, `users/${applicantId}/applications/${jobId}`);
      await updateDoc(subAppRef, { status: 'Denied' });

      setReceivedApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: 'Denied' } : app))
      );

      // Disable the deny button
      setDisabledButtons((prev) => ({ ...prev, [appId]: 'deny' }));

      console.log('Application denied successfully!');
    } catch (error) {
      console.error('Error denying application:', error);
    }
  };

  const filteredReceived = receivedApplications.filter((app) =>
    userDetails[app.applicantId]?.name?.toLowerCase().includes(searchReceived.toLowerCase())
  );

  const filteredCandidates = Candidates
    .filter((candidate) =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="p-6 flex flex-wrap">
      <div className="w-1/2 pr-4">
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
                <IoMdInformationCircleOutline
                        className="cursor-pointer"
                        onClick={() => handleOpenModal(app)}
                      />
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
                    {app.status === 'Pending' && (
                      <div>
                        <button
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                          onClick={() => handleApprove(app.id, app.applicantId, app.jobId)}
                          disabled={disabledButtons[app.id] === 'approve'}
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                          onClick={() => handleDeny(app.id, app.applicantId, app.jobId)}
                          disabled={disabledButtons[app.id] === 'deny'}
                        >
                          Deny
                        </button>
                      </div>
                    )}
                    {app.status === 'Approved' && (
                      <span className="text-green-600">Approved</span>
                    )}
                    {app.status === 'Denied' && (
                      <span className="text-red-600">Denied</span>
                    )}
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
            placeholder="Search candidates..."
            className="ml-4 p-2 pl-10 text-sm text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        </div>
        <ul className="space-y-4">
        {filteredCandidates.map((candidate) => (
          <li key={candidate.id} className="mb-2 p-2 border border-gray-300 rounded flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold">{candidate.name}</h2>
              <p className="text-gray-600">{candidate.position}</p>
              <p className="text-gray-500">Start Date: {candidate.startDate} | End Date: {candidate.endDate} | Status:  
              {candidate.status === 'Accepted' && (
                <span className="text-green-600"> Accepted</span>
              )}
              {candidate.status === 'Rejected' && (
                <span className="text-red-600"> Rejected</span>
              )}
              {candidate.status === 'Pending' && (
                <span className="text-gray-600"> Pending</span>
              )}</p>
            </div>
          </li>
        ))}
        </ul>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-3/4 md:w-1/2 lg:w-1/3 p-6 relative transform transition-all">
            <IoMdClose
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer text-xl"
              onClick={handleCloseModal}
            />
            <div className="flex flex-col space-y-4">
              {userDetails[selectedApplication.applicantId].subCollectionData.map((info, index) => (
                <div key={index} className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-800">{info.name}</h2>
                  <p className="text-gray-600 text-sm">
                    {info.qualification}
                  </p>
                  <p className="text-gray-600">
                    <span className="block">{info.email}</span>
                    <span className="block">{info.address}</span>
                    <span className="block">Hourly Rate: ${info.hourlyRate}</span>
                    <span className="block">Experience: {info.experience} years</span>
                    <span className="block">Skills: {Array.isArray(info.skills) ? info.skills.join(', ') : info.skills || "N/A"}</span>
                    <span className="block">Phone: {info.mobileNo}</span>
                  </p>
                  <div className="flex space-x-4 mt-4 text-lg text-blue-500">
                {info.linkedin && (
                  <a href={info.linkedin} target="_blank" rel="noopener noreferrer">
                    <FaLinkedin className="hover:text-blue-700" />
                  </a>
                )}
                {info.github && (
                  <a href={info.github} target="_blank" rel="noopener noreferrer">
                    <FaGithub className="hover:text-blue-700" />
                  </a>
                )}
                {info.twitter && (
                  <a href={info.twitter} target="_blank" rel="noopener noreferrer">
                    <FaTwitter className="hover:text-blue-700" />
                  </a>
                )}
                {info.resumeFile && (
                  <a href={info.resumeFile} target="_blank" rel="noopener noreferrer">
                    <FaFileAlt className="hover:text-blue-700" />
                  </a>
                )}
                {info.portfolioURL && (
                  <a href={info.portfolioURL} target="_blank" rel="noopener noreferrer">
                    <FaGlobe className="hover:text-blue-700" />
                  </a>
                )}
              </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;