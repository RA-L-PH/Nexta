import { getFirestore, doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { FaLinkedin, FaGithub, FaTwitter, FaEdit, FaSave } from 'react-icons/fa';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

function UserProfile() {
  const [freelancerData, setFreelancerData] = useState([]);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  useEffect(() => {
    const fetchFreelancerData = async () => {
      if (userId) {
        try {
          const userRef = doc(db, 'users', userId);
          const freelancersRef = collection(userRef, 'Freelancer');
          const freelancerSnap = await getDocs(freelancersRef);

          const freelancerDetails = [];
          for (const doc of freelancerSnap.docs) {
            const data = doc.data();
            const photoRef = ref(storage, data.photoFile);
            const photoURL = await getDownloadURL(photoRef);

            freelancerDetails.push({ id: doc.id, ...data, photoURL });
          }
          setFreelancerData(freelancerDetails);
          setEditedData(freelancerDetails[0]);
        } catch (err) {
          setError("Error fetching freelancer data!");
        }
      } else {
        setError("User is not authenticated!");
      }
    };

    fetchFreelancerData();
  }, [userId]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      const freelancerRef = doc(collection(userRef, 'Freelancer'), freelancerData[0].id);
      await updateDoc(freelancerRef, editedData);
      setFreelancerData([{ ...freelancerData[0], ...editedData }]);
      setEditMode(false);
    } catch (err) {
      setError("Error updating freelancer data!");
    }
  };

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  if (error) {
    return <div>{error}</div>;
  }
  console.log("UserProfile component rendered");

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 border rounded-lg shadow-md bg-white">
      {freelancerData.map((freelancer) => (
        <div key={freelancer.id}>
          <div className="flex items-center gap-8">
            {/* Profile Image */}
            <div>
              <img
                src={freelancer.photoURL}
                alt="Freelancer Profile"
                className="w-32 h-32 rounded-full object-cover shadow-md"
              />
            </div>

            {/* Freelancer Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{freelancer.name}</h2>
              <p className="text-xl text-gray-600">
                {editMode ? (
                  <label className="text-lg text-gray-600">Skills:
                    <input
                      type="text"
                      name="skills"
                      value={editedData.skills}
                      onChange={handleChange}
                      className="w-full p-2 pl-10 text-sm text-gray-700"
                    />
                  </label>
                ) : (
                  freelancer.skills
                )}
              </p>
              <p className="text-sm text-gray-500">
                {editMode ? (
                  <label className="text-lg text-gray-600">Experience:
                    <input
                      type="number"
                      name="experience"
                      value={editedData.experience}
                      onChange={handleChange}
                      className="w-full p-2 pl-10 text-sm text-gray-700"
                    />
                  </label>
                ) : (
                  `${freelancer.experience} years of experience`
                )}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-gray-700">Contact Information</h3>
            <div className="mt-2">
              <p className="flex items-center gap-2 text-lg text-gray-600">{freelancer.mobileNo}</p>
              <p className="text-lg text-gray-600">{freelancer.email}</p>
              <p className="text-lg text-gray-600">Address: {freelancer.address}</p>
            </div>
          </div>

          {/* Professional Information */}
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-gray-700">Professional Information</h3>
            <p className="text-lg text-gray-600">
              {editMode ? (
                <label className="text-lg text-gray-600">Qualification:
                  <input
                    type="text"
                    name="qualification"
                    value={editedData.qualification}
                    onChange={handleChange}
                    className="w-full p-2 pl-10 text-sm text-gray-700"
                  />
                </label>
              ) : (
                `Qualification: ${freelancer.qualification}`
              )}
            </p>
            <p className="text-lg text-gray-600">
              {editMode ? (
                <label className="text-lg text-gray-600">Hourly Rate:
                  <input
                    type="number"
                    name="hourlyRate"
                    value={editedData.hourlyRate}
                    onChange={handleChange}
                    className="w-full p-2 pl-10 text-sm text-gray-700"
                  />
                </label>
              ) : (
                `Hourly Rate: $${freelancer.hourlyRate}`
              )}
            </p>
            <p className="text-lg text-gray-600">
              {editMode ? (
                <label className="text-lg text-gray-600">Working Type:
                  <div className="flex gap-4">
                    <label>
                      <input
                        type="radio"
                        name="workingType"
                        value="Full-time"
                        checked={editedData.workingType === 'Full-time'}
                        onChange={handleChange}
                      />
                      Full-time
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="workingType"
                        value="Part-time"
                        checked={editedData.workingType === 'Part-time'}
                        onChange={handleChange}
                      />
                      Part-time
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="workingType"
                        value="Freelancer"
                        checked={editedData.workingType === 'Freelancer'}
                        onChange={handleChange}
                      />
                      Freelancer
                    </label>
                  </div>
                </label>
              ) : (
                <p className="text-lg text-gray-600">{`Working Type: ${freelancer.workingType}`}</p>
              )}
            </p>
          </div>

          {/* Social Links */}
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-gray-700">Social Profiles</h3>
            <div className="flex gap-4">
              <a href={freelancer.linkedin} className="text-lg text-gray-600">
                <FaLinkedin size={24} />
              </a>
              <a href={freelancer.github} className="text-lg text-gray-600">
                <FaGithub size={24} />
              </a>
              <a href={freelancer.twitter} className="text-lg text-gray-600">
                <FaTwitter size={24} />
              </a>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            {!editMode ? (
              <button onClick={handleEdit} className="flex items-center gap-4 bg-blue-500 text-white px-4 py-2 rounded">
                <FaEdit /> Edit Details
              </button>
            ) : (
              <button onClick={handleSave} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded">
                <FaSave /> Save Changes
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserProfile;
