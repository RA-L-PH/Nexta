import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase'; // Your Firebase config
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FiEdit, FiTrash2, FiPlusCircle } from 'react-icons/fi'; // Importing icons

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ title: '', description: '', skills: '', companyName: '' });
  const [editingJobId, setEditingJobId] = useState(null); // To track if we are editing
  const [companyName, setCompanyName] = useState('');
  const userId = getAuth().currentUser?.uid; // Get the current user's ID

  useEffect(() => {
    const fetchJobsAndCompany = async () => {
      if (userId) {
        // Fetch jobs
        const jobsSnapshot = await getDocs(collection(db, 'users', userId, 'jobs'));
        const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsList);

        // Fetch the company name
        const companiesSnapshot = await getDocs(collection(db, 'users', userId, 'Companies'));
        const companyDoc = companiesSnapshot.docs[0]; // Assuming only one company for the user
        if (companyDoc) {
          const fetchedCompanyName = companyDoc.data().companyName;
          setCompanyName(fetchedCompanyName);
          setNewJob(prevJob => ({ ...prevJob, companyName: fetchedCompanyName }));
        }
      }
    };
    fetchJobsAndCompany();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob({ ...newJob, [name]: value });
  };

  const handleAddOrUpdateJob = async (e) => {
    e.preventDefault();
    if (userId) {
      const skillsArray = newJob.skills.split(',').map(skill => skill.trim());

      if (editingJobId) {
        // Update job if we are editing
        const jobDoc = doc(db, 'users', userId, 'jobs', editingJobId);
        await updateDoc(jobDoc, {
          ...newJob,
          skills: skillsArray,
        });

        setJobs(jobs.map(job => (job.id === editingJobId ? { id: editingJobId, ...newJob, skills: skillsArray } : job)));
        setEditingJobId(null); // Reset after updating
      } else {
        // Add new job if not editing
        const jobDoc = await addDoc(collection(db, 'users', userId, 'jobs'), {
          ...newJob,
          skills: skillsArray,
          companyName: companyName,
        });
        setJobs([...jobs, { id: jobDoc.id, ...newJob, skills: skillsArray }]);
      }

      setNewJob({ title: '', description: '', skills: '', companyName: companyName }); // Reset form
    }
  };

  const handleDeleteJob = async (id) => {
    if (userId) {
      await deleteDoc(doc(db, 'users', userId, 'jobs', id));
      setJobs(jobs.filter(job => job.id !== id));
    }
  };

  const handleEditJob = (id) => {
    const jobToEdit = jobs.find(job => job.id === id);
    setNewJob(jobToEdit);
    setEditingJobId(id); // Set editing mode
  };

  return (
    <div className="p-4">
      <form onSubmit={handleAddOrUpdateJob} className="mb-4">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">Job Title</label>
          <input
            type="text"
            name="title"
            value={newJob.title}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={newJob.description}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">Required Skills (comma-separated)</label>
          <input
            type="text"
            name="skills"
            value={newJob.skills}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiPlusCircle className="mr-2" />
          {editingJobId ? 'Update Job' : 'Add Job'}
        </button>
      </form>

      <div>
        {jobs.map(job => (
          <div key={job.id} className="mb-4 p-4 border border-gray-300 rounded-md">
            <h3 className="text-lg font-medium">{job.title}</h3>
            <p className="text-sm text-gray-500">Description: {job.description}</p>
            <p className="text-sm text-gray-500">Skills: {job.skills.join(', ')}</p>
            <p className="text-sm text-gray-500">Company: {job.companyName || 'Unknown Company'}</p>
            <div className="mt-2 flex">
              <button
                onClick={() => handleEditJob(job.id)}
                className="inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 mr-2"
              >
                <FiEdit className="mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteJob(job.id)}
                className="inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FiTrash2 className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageJobs;
