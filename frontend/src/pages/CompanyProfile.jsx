import { getFirestore, doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { FaLinkedin, FaEdit, FaSave, FaBuilding, FaEnvelope, FaPhone, FaGlobe } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

function CompanyProfile() {
  const [companyData, setCompanyData] = useState([]);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (userId) {
        try {
          const userRef = doc(db, 'users', userId);
          const companiesRef = collection(userRef, 'Companies');
          const companySnap = await getDocs(companiesRef);

          const companyDetails = [];
          for (const doc of companySnap.docs) {
            const data = doc.data();
            const logoRef = ref(storage, data.logoFile);
            const logoURL = await getDownloadURL(logoRef);

            companyDetails.push({ id: doc.id, ...data, logoURL });
          }
          setCompanyData(companyDetails);
          setEditedData(companyDetails[0]);
        } catch (err) {
          setError("Error fetching company data!");
        }
      } else {
        setError("User is not authenticated!");
      }
    };

    fetchCompanyData();
  }, [userId]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      const companyRef = doc(collection(userRef, 'Companies'), companyData[0].id);
      await updateDoc(companyRef, editedData);
      setCompanyData([{ ...companyData[0], ...editedData }]);
      setEditMode(false);
    } catch (err) {
      setError("Error updating company data!");
    }
  };

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 border rounded-lg shadow-md bg-white">
      {companyData.map((company) => (
        <div key={company.id}>
          <div className="flex items-center gap-8">
            {/* Company Logo */}
            <div>
              <img
                src={company.logoURL}
                alt="Company Logo"
                className="w-32 h-32 rounded-full object-cover shadow-md"
              />
            </div>

            {/* Company Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{company.companyName}</h2>
              <p className="text-lg text-gray-600">
                {editMode ? (
                  <label className="text-lg text-gray-600">
                    Address:
                    <input
                      type="text"
                      name="companyAddress"
                      value={editedData.companyAddress}
                      onChange={handleChange}
                      className="w-full p-2 pl-10 text-sm text-gray-700"
                    />
                  </label>
                ) : (
                  company.companyAddress
                )}
              </p>
              <p className="text-lg text-gray-600">
                {editMode ? (
                  <label className="text-lg text-gray-600">
                    Mission Statement:
                    <input
                      type="text"
                      name="missionStatement"
                      value={editedData.missionStatement}
                      onChange={handleChange}
                      className="w-full p-2 pl-10 text-sm text-gray-700"
                    />
                  </label>
                ) : (
                  company.missionStatement
                )}
              </p>
              <p className="text-lg text-gray-600">
                {editMode ? (
                  <label className="text-lg text-gray-600">
                    Products/Services:
                    <input
                      type="text"
                      name="productsServices"
                      value={editedData.productsServices}
                      onChange={handleChange}
                      className="w-full p-2 pl-10 text-sm text-gray-700"
                    />
                  </label>
                ) : (
                  company.productsServices
                )}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-gray-700">Contact Information</h3>
            <p className="flex items-center gap-2 text-lg text-gray-600">
              <FaPhone /> {company.phoneNumber}
            </p>
            <p className="flex items-center gap-2 text-lg text-gray-600">
              <FaEnvelope /> {company.email}
            </p>
            <p className="flex items-center gap-2 text-lg text-gray-600">
              <FaGlobe /> {company.websiteURL}
            </p>
          </div>

          {/* Social Links */}
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-gray-700">Social Profiles</h3>
            <div className="flex gap-4">
              <a href={company.linkedin} className="text-lg text-gray-600">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            {!editMode ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                <FaEdit /> Edit Details
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded"
              >
                <FaSave /> Save Changes
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CompanyProfile;
