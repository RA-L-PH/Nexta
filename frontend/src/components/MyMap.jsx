import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Hospital, BriefcaseMedical } from 'lucide-react'; // Assuming UserDoctorIcon is a custom icon for doctors
import { User } from 'lucide-react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';

// Meaningful icons for clinics, hospitals, doctors, and user's location
const clinicIcon = new L.Icon({
  iconUrl: BriefcaseMedical, // Stethoscope icon
  iconSize: [30, 30],
});

const hospitalIcon = new L.Icon({
  iconUrl: Hospital, // Hospital building icon
  iconSize: [30, 30],
});

const doctorIcon = new L.Icon({
  iconUrl: User, // Doctor icon
  iconSize: [30, 30],
});

const userLocationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Pin marker for user's location
  iconSize: [35, 35],
});

const MyMap = () => {
  const [position, setPosition] = useState([19.229, 72.854]); // Default position for Borivali (W), Mumbai
  const [clinics, setClinics] = useState([]); // Store fetched clinics
  const [hospitals, setHospitals] = useState([]); // Store fetched hospitals
  const [doctors, setDoctors] = useState([]); // Store fetched doctors
  const [userLocation, setUserLocation] = useState(null); // Store user's current location

  const db = getFirestore(); // Firestore instance

  // Fetch clinics and hospitals from Overpass API
  const fetchClinicsAndHospitals = async (lat, lon) => {
    if (!lat || !lon) {
      console.error('Invalid latitude or longitude for fetching data');
      return;
    }

    const query = `
      [out:json];
      (
        node["amenity"="clinic"](around:7000, ${lat}, ${lon});
        way["amenity"="clinic"](around:7000, ${lat}, ${lon});
        node["amenity"="hospital"](around:7000, ${lat}, ${lon});
        way["amenity"="hospital"](around:7000, ${lat}, ${lon});
      );
      out body;
    `;

    try {
      const response = await axios.get('https://overpass-api.de/api/interpreter', {
        params: { data: query },
      });
      const data = response.data.elements;
      const fetchedClinics = data.filter(el => el.tags.amenity === 'clinic');
      const fetchedHospitals = data.filter(el => el.tags.amenity === 'hospital');

      setClinics(fetchedClinics); // Set clinics data
      setHospitals(fetchedHospitals); // Set hospitals data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch doctors' locations from Firebase
  const fetchDoctors = async () => {
    try {
      const doctorsCollection = collection(db, 'doctors');
      const snapshot = await getDocs(doctorsCollection);
      const fetchedDoctors = snapshot.docs.map(doc => doc.data());

      setDoctors(fetchedDoctors); // Set doctors data
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Handle location access and search for clinics, hospitals, and doctors
  const handleSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (latitude && longitude) {
            setPosition([latitude, longitude]); // Update map center to user's location
            setUserLocation([latitude, longitude]); // Save user's current location
            fetchClinicsAndHospitals(latitude, longitude);  // Fetch nearby clinics and hospitals
            fetchDoctors(); // Fetch doctors
          } else {
            console.error('Invalid latitude or longitude from geolocation');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to access your location.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    fetchDoctors(); // Fetch doctors on initial render
  }, []);

  return (
    <div className="w-full p-5 rounded-lg shadow-lg mx-auto bg-transparent">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Nearby Clinics, Hospitals & Doctors</h2>
      <button 
        onClick={handleSearch}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 w-full"
      >
        Find Nearby Clinics, Hospitals & Doctors
      </button>
      <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }} className="mb-4 rounded-lg shadow-xl">
        <TileLayer
          url="https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=G21DQ8H8wST7yQqswPtr" // Your MapTiler API key
          attribution='&copy; <a href="https://www.maptiler.com/copyright">MapTiler</a>'
        />

        {/* Display user's current location */}
        {userLocation && Array.isArray(userLocation) && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}
        
        {/* Display clinics */}
        {clinics.map((clinic, index) => (
          clinic.lat && clinic.lon ? (
            <Marker key={index} position={[clinic.lat, clinic.lon]} icon={clinicIcon}>
              <Popup>
                <strong>Clinic:</strong> {clinic.tags.name || 'Unknown Name'}<br />
                <strong>Address:</strong> {clinic.tags['addr:street'] || 'No address available'}<br />
                <strong>ID:</strong> {clinic.id}
              </Popup>
            </Marker>
          ) : null
        ))}

        {/* Display hospitals */}
        {hospitals.map((hospital, index) => (
          hospital.lat && hospital.lon ? (
            <Marker key={index} position={[hospital.lat, hospital.lon]} icon={hospitalIcon}>
              <Popup>
                <strong>Hospital:</strong> {hospital.tags.name || 'Unknown Name'}<br />
                <strong>Address:</strong> {hospital.tags['addr:street'] || 'No address available'}<br />
                <strong>ID:</strong> {hospital.id}
              </Popup>
            </Marker>
          ) : null
        ))}

        {/* Display doctors */}
        {doctors.map((doctor, index) => (
          doctor.location?.lat && doctor.location?.lon ? (
            <Marker key={index} position={[doctor.location.lat, doctor.location.lon]} icon={doctorIcon}>
              <Popup>
                <strong>Doctor:</strong> {doctor.name}<br />
                <strong>Medical Council:</strong> {doctor.medicalCouncil}<br />
                <strong>Year of Registration:</strong> {doctor.yearOfRegistration}<br />
                <strong>Address:</strong> {doctor.address || 'No address available'}
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
};

export default MyMap;
