import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase'; // Firebase config
import { getAuth } from 'firebase/auth'; // To get the current user's ID
import { collection, getDocs } from 'firebase/firestore'; // Firestore functions
import { getStorage, ref, getDownloadURL } from 'firebase/storage'; // Firebase Storage functions

const MyResume = () => {
  const [resumeURL, setResumeURL] = useState(null); // To store the resume link
  const userId = getAuth().currentUser?.uid; // Get the current user's ID
  const storage = getStorage(); // Firebase storage instance

  useEffect(() => {
    const fetchResumeLink = async () => {
      if (userId) {
        // Fetch resume from Firestore subcollection (e.g., users/{userId}/freelancer)
        const freelancerSnapshot = await getDocs(collection(db, 'users', userId, 'Freelancer'));
        const resumeDoc = freelancerSnapshot.docs[0]; // Assuming only one resume per freelancer

        if (resumeDoc) {
          const { resumeFile } = resumeDoc.data(); // Assuming 'resumeStoragePath' holds the path to the resume in Firebase Storage

          // Get download URL from Firebase Storage
          const resumeDownloadURL = await getDownloadURL(ref(storage, resumeFile));
          setResumeURL(resumeDownloadURL); // Set the resume URL
        }
      }
    };

    fetchResumeLink();
  }, [userId, storage]);

  return (
    <div className="flex justify-center mt-2 px-2 h-full">
      {resumeURL ? (
        <img src={resumeURL} alt="Resume" className="w-auto h-full md:max-w-2xl" />
      ) : (
        <p>Loading resume...</p>
      )}
    </div>
  );
};

export default MyResume;
