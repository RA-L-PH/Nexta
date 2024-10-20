import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, setDoc, doc, getDoc, deleteDoc  } from 'firebase/firestore';
import { db } from '../firebase/firebase'; // Adjust the path based on your setup
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
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('User is not authenticated!');
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
            allJobs.push(jobData);
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
    if (!userId) {
      console.error('User ID is not available');
      return;
    }

    const applicationData = {
      companyName: job.companyName,
      jobTitle : job.title,
      skills : job.skills,
      appliedAt: new Date(),
    };

    try {
      await setDoc(doc(collection(db, 'users', userId, 'applications'), job.companyName), applicationData);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error("Error submitting application: ", error);
      console.log(applicationData);
      alert('Failed to submit application. Please try again later.');
    }
  };

  const handleWithdraw = async (job) => {
    if (!userId) {
      console.error('User ID is not available');
      return;
    }

    try {
      await deleteDoc(doc(collection(db, 'users', userId, 'applications'), job.jobId));
      alert('Application withdrawn successfully!');

      setAppliedJobs(prev => {
        const updated = new Set(prev);
        updated.delete(job.jobId); // Remove jobId from the applied jobs
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
            {/* Show Apply button only for users with the role 'User' */}
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
