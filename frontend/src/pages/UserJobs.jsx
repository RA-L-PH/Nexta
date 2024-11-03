import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    deleteDoc, 
    updateDoc 
} from 'firebase/firestore';

const UserJobs = () => {
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [requestedJobs, setRequestedJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    const userId = getAuth().currentUser?.uid;

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            if (userId) {
                try {
                    const applicationsSnapshot = await getDocs(collection(db, 'users', userId, 'applications'));
                    const jobs = applicationsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setAppliedJobs(jobs);
                } catch (error) {
                    console.error("Error fetching applied jobs: ", error);
                }
            }
        };

        const fetchRequestedJobs = async () => {
            if (userId) {
                try {
                    const applicationsSnapshot = await getDocs(collection(db, 'users', userId, 'bookedRequests'));
        
                    const jobs = await Promise.all(
                        applicationsSnapshot.docs.map(async (applicationDoc) => {
                            const jobData = applicationDoc.data();
                            const requesterId = jobData.requesterId;
        
                            try {
                                const requesterDoc = await getDoc(doc(db, 'users', requesterId));
                                
                                if (!requesterDoc.exists()) {
                                    console.error(`Requester with ID ${requesterId} not found`);
                                    return null;
                                }
        
                                const requesterData = requesterDoc.data();
                                let additionalData = {};
        
                                if (requesterData.role === 'Company') {
                                    const companySnapshot = await getDocs(collection(db, 'users', requesterId, 'Companies'));
                                    additionalData = companySnapshot.docs.map((companyDoc) => companyDoc.data());
                                } else if (requesterData.role === 'User') {
                                    const freelancerSnapshot = await getDocs(collection(db, 'users', requesterId, 'Freelancer'));
                                    additionalData = freelancerSnapshot.docs.map((freelancerDoc) => freelancerDoc.data());
                                }
        
                                return {
                                    id: applicationDoc.id,
                                    requesterId,
                                    ...jobData,
                                    requesterData,
                                    additionalData,
                                };
                            } catch (error) {
                                console.error(`Error fetching data for requesterId ${requesterId}: `, error);
                                return null;
                            }
                        })
                    );
        
                    setRequestedJobs(jobs.filter(job => job !== null));
                } catch (error) {
                    console.error("Error fetching requested jobs: ", error);
                }
            }
        };

        fetchRequestedJobs();
        fetchAppliedJobs();
    }, [userId]);

    const handleRequestResponse = async (jobId, requesterId, bookingId, action) => {
        if (!userId) return;
        setLoading(true);
    
        try {
            // Reference for the current user's booking
            const currentUserBookingRef = doc(db, 'users', userId, 'bookedRequests', jobId);
            // Reference for the requester's booking
            const requesterBookingRef = doc(db, 'users', requesterId, 'booked', bookingId);
    
            // Fetch the requester's booking document
            const requesterBookingDoc = await getDoc(requesterBookingRef);
            if (!requesterBookingDoc.exists()) {
                throw new Error('Booking document not found');
            }
    
            // Retrieve and update the cartItems array in the requester's booking document
            const bookingData = requesterBookingDoc.data();
            const cartItems = bookingData.cartItems || [];
    
            const updatedCartItems = cartItems.map(item => {
                if (item.id === jobId) {
                    return {
                        ...item,
                        status: action === 'accept' ? 'Accepted' : 'Rejected'
                    };
                }
                return item;
            });
    
            // Update both the current user’s and requester's booking documents
            await Promise.all([
                updateDoc(currentUserBookingRef, {
                    status: action === 'accept' ? 'Accepted' : 'Rejected'
                }),
                updateDoc(requesterBookingRef, {
                    cartItems: updatedCartItems
                })
            ]);
    
            // Update the local state to reflect the changes in the UI
            setRequestedJobs(prevJobs => 
                prevJobs.map(job => 
                    job.id === jobId 
                        ? { ...job, status: action === 'accept' ? 'Accepted' : 'Rejected' }
                        : job
                )
            );
    
            alert(`Request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            alert(`Failed to ${action} request. Please try again later.`);
        } finally {
            setLoading(false);
        }
    };
    

    const handleDeleteJob = async (jobId) => {
        if (userId) {
            try {
                const jobToDelete = appliedJobs.find(job => job.id === jobId);
                if (!jobToDelete) {
                    console.error("Job not found");
                    return;
                }

                const applicationId = jobToDelete.applicationId;
                const companyUserId = jobToDelete.companyId;

                if (!applicationId || !companyUserId) {
                    console.error("Invalid applicationId or companyUserId");
                    return;
                }

                await deleteDoc(doc(db, 'users', userId, 'applications', jobId));
                await deleteDoc(doc(db, 'users', companyUserId, 'receivedApplications', applicationId));

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
                            {/* Status Display */}
                            <div className="mt-2">
                                <span className={`inline-block px-2 py-1 rounded mr-2 ${
                                    job.status === 'Accepted' ? 'bg-green-200 text-green-800' :
                                    job.status === 'Rejected' ? 'bg-red-200 text-red-800' :
                                    'bg-gray-200 text-gray-800'
                                }`}>
                                    {job.status || 'Pending'}
                                </span>
                            </div>

                            {/* Requester Details */}
                            {job.additionalData && job.additionalData.length > 0 ? (
                                job.additionalData.map((dataItem, index) => (
                                    <div key={index} className="mt-2">
                                        {job.requesterData.role === 'Company' && (
                                            <>
                                                <h3 className="text-lg font-semibold">{dataItem.companyName}</h3>
                                                <p className="text-gray-600">Email: {dataItem.email} | Phone: {dataItem.phoneNumber}</p>
                                                <p className="text-gray-600">Mission: {dataItem.missionStatement} | Services: {dataItem.productsServices}</p>
                                                <p className="text-gray-600">Start Date: {job.startDate} | End Date: {job.endDate}</p>
                                            </>
                                        )}
                                        {job.requesterData.role.trim() === 'User' && (
                                            <>
                                                <h3 className="text-lg font-semibold">{dataItem.name}</h3>
                                                <p className="text-gray-600">Email: {dataItem.email} | Phone: {dataItem.mobileNo}</p>
                                                <p className="text-gray-600">Qualification: {dataItem.qualification}</p>
                                                <p className="text-gray-600">Start Date: {job.startDate} | End Date: {job.endDate}</p>
                                            </>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No additional details available</p>
                            )}

                            {/* Accept/Reject Buttons */}
                            {(!job.status || job.status === 'Pending') && (
                                <div className="mt-4 flex space-x-2">
                                {console.log("Job ID:", job.id)}
                                    <button
                                        onClick={() => handleRequestResponse(job.id, job.requesterId, job.bookingId, 'accept')}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                        disabled={loading}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleRequestResponse(job.id, job.requesterId, job.bookingId, 'reject')}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                        disabled={loading}
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
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