import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, setDoc, doc, getDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';

const JobPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    const fetchJobs = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'Company'));
        const querySnapshot = await getDocs(q);

        let allJobs = [];

        for (const doc of querySnapshot.docs) {
          const jobsRef = collection(db, `users/${doc.id}/jobs`);
          const jobSnapshot = await getDocs(jobsRef);

          jobSnapshot.forEach((jobDoc) => {
            const jobData = jobDoc.data();
            if (typeof jobData.skills === 'string') {
              jobData.skills = jobData.skills.split(',').map(skill => skill.trim());
            }
            allJobs.push({ ...jobData, companyUserId: doc.id, jobId: jobDoc.id });
          });
        }

        setJobs(allJobs);
      } catch (error) {
        console.error("Error fetching jobs: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchJobs();
  }, [user]);

  const handleApply = async (job) => {
    if (!user) {
      console.error('User  is not authenticated');
      return;
    }
  
    const userId = user.uid; 
    const applicationData = {
      companyName: job.companyName,
      companyId: job.companyUserId,
      jobTitle: job.title,
      skills: job.skills,
      jobId: job.jobId,
      applicantId: userId,
      status: 'Pending',
      appliedAt: new Date(),
    };
  
    try {
      // First, create a document in the receivedApplications collection to get the applicationId
      const receivedApplicationRef = await addDoc(collection(db, `users/${job.companyUserId}/receivedApplications`), {
        applicantId: userId,
        jobId: job.jobId,
        appliedAt: new Date(),
        status: 'Pending',
      });
  
      const applicationId = receivedApplicationRef.id; // Get the generated application ID
  
      // Now, set the application data including the applicationId in the user's applications subcollection
      await setDoc(doc(db, 'users', userId, 'applications', job.jobId), {
        ...applicationData,
        applicationId: applicationId, // Add applicationId to the application data
      });
  
      // Update the receivedApplications document to include the applicationId
      await setDoc(receivedApplicationRef, {
        applicationId: applicationId, // Add applicationId to the receivedApplications document
      }, { merge: true });
  
      // Reference to the company's job document
      const companyJobDocRef = doc(db, 'users', job.companyUserId, 'jobs', job.jobId);
  
      // Fetch and update the applicants array in the job document under the company's collection
      const jobDocSnap = await getDoc(companyJobDocRef);
      let updatedApplicants = [];
  
      if (jobDocSnap.exists()) {
        const jobData = jobDocSnap.data();
        updatedApplicants = jobData.applicants ? [...jobData.applicants, userId] : [userId];
      } else {
        updatedApplicants = [userId];
      }
  
      await setDoc(companyJobDocRef, { applicants: updatedApplicants }, { merge: true });
  
      alert('Application submitted successfully!');
    } catch (error) {
      console.error("Error submitting application: ", error);
      alert('Failed to submit application. Please try again later.');
    }
  };

  const handleWithdraw = async (job) => {
    if (!userId) {
      console.error('User ID is not available');
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId, 'applications', job.jobId));
      alert('Application withdrawn successfully!');

      setAppliedJobs(prev => {
        const updated = new Set(prev);
        updated.delete(job.jobId);
        return updated;
      });
    } catch (error) {
      console.error("Error withdrawing application: ", error);
      alert('Failed to withdraw application. Please try again later.');
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <p>Loading jobs...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Job Listings</h1>
      <input
        type="text"
        placeholder="Search by job title or skills..."
        className="border p-2 mb-4 w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="space-y-4">
        {filteredJobs.map((job, index) => (
          <div key={index} className="border p-4 rounded shadow flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-600">{job.companyName}</p>
              <p className="text-gray-800">{job.description}</p>
              <div className="mt-2">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded mr-2">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {userData && userData.role === 'User' && (
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => handleApply(job)}
              >
                Apply
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobPage;
