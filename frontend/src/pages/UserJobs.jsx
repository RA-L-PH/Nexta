import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase'; // Import Firestore config
import { getAuth } from 'firebase/auth'; // Firebase auth to get the current user ID
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'; // Firestore functions

const UserJobs = () => {
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [requestedJobs] = useState([ // Static data for requested jobs
        { id: 1, title: 'Frontend Developer', company: 'Company A', date: '2023-10-01' },
        { id: 2, title: 'Backend Developer', company: 'Company B', date: '2023-10-02' },
    ]);

    const userId = getAuth().currentUser?.uid; // Get the current user ID

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            if (userId) {
                try {
                    // Fetch the 'applications' subcollection for the current user
                    const applicationsSnapshot = await getDocs(collection(db, 'users', userId, 'applications'));

                    // Map the Firestore documents into the appliedJobs state
                    const jobs = applicationsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    setAppliedJobs(jobs); // Update the state with fetched jobs
                } catch (error) {
                    console.error("Error fetching applied jobs: ", error);
                }
            }
        };

        fetchAppliedJobs(); // Fetch applied jobs when the component loads
    }, [userId]);

    // Function to handle job deletion
    const handleDeleteJob = async (jobId) => {
        if (userId) {
            try {
                // Find the job to get the applicationId and companyUser  Id
                const jobToDelete = appliedJobs.find(job => job.id === jobId);
                if (!jobToDelete) {
                    console.error("Job not found");
                    return;
                }
    
                const applicationId = jobToDelete.applicationId; // Get the applicationId
                const companyUserId = jobToDelete.companyId; // Get the company user ID
    
                // Debugging: Check if values are defined
                console.log("Deleting job with ID:", jobId);
                console.log("Application ID:", applicationId);
                console.log("Company User ID:", companyUserId);
    
                // Check if applicationId and companyUser Id are valid
                if (!applicationId || !companyUserId) {
                    console.error("Invalid applicationId or companyUser Id");
                    return;
                }
    
                // Delete the job from the Firestore database
                await deleteDoc(doc(db, 'users', userId, 'applications', jobId));
    
                // Also delete the corresponding document from receivedApplications
                await deleteDoc(doc(db, 'users', companyUserId, 'receivedApplications', applicationId));
    
                // Update the state to remove the deleted job
                setAppliedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
                alert('Job deleted successfully!');
            } catch (error) {
                console.error("Error deleting job: ", error);
                alert('Failed to delete the job. Please try again later.');
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-2 gap-4">
                {/* Requested Jobs Section */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Requested Jobs</h2>
                    {requestedJobs.map((job) => (
                        <div key={job.id} className="bg-white p-4 mb-4 shadow-md rounded">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <p className="text-gray-600">{job.company}</p>
                            <p className="text-gray-400">{job.date}</p>
                        </div>
                    ))}
                </div>

                {/* Applied Jobs Section */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Applied Jobs</h2>
                    {appliedJobs.length > 0 ? (
                        appliedJobs.map((job) => (
                            <div key={job.id} className="bg-white p-4 mb-4 shadow-md rounded relative">
                                <button 
                                    className="absolute top-2 right-2 text-red-500" 
                                    onClick={() => handleDeleteJob(job.id)}
                                >
                                    Delete
                                </button>
                                <h3 className="text-lg font-semibold">{job.jobTitle}</h3>
                                <p className="text-gray-600">{job.companyName}</p>
                                <div className="mt-2">
                                    {job.status === 'Approved' ? (
                                        <span className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded mr-2">
                                            Approved
                                        </span>
                                    ) : job.status === 'Denied' ? (
                                        <span className="inline-block bg-red-200 text-red-800 px-2 py-1 rounded mr-2">
                                            Denied
                                        </span>
                                    ) : (
                                        <span className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded mr-2">
                                            Pending
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2">
                                    {job.skills.map((skill, idx) => (
                                        <span key={idx} className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded mr-2">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No applied jobs yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserJobs;
