import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase'; // Import Firestore config
import { getAuth } from 'firebase/auth'; // Firebase auth to get the current user ID
import { collection, getDocs } from 'firebase/firestore'; // Firestore functions

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
                            <div key={job.id} className="bg-white p-4 mb-4 shadow-md rounded">
                                <h3 className="text-lg font-semibold">{job.jobTitle}</h3>
                                <p className="text-gray-600">{job.companyName}</p>
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
