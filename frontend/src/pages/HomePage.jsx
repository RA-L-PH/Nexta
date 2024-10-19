import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import doc1 from '../assets/se.jpg';
import doc2 from '../assets/ds.jpg';
import doc3 from '../assets/pm.png';
import doc4 from '../assets/fa.jpg';
import doc5 from '../assets/mm.jpg';
import doc6 from '../assets/hrs.jpg';
import doc7 from '../assets/ba.jpg';
import doc8 from '../assets/cs.jpg';
import doc9 from '../assets/prm.jpg';
import doc10 from '../assets/sam.jpg';
import doc11 from '../assets/na.jpg';
import doc12 from '../assets/bb.jpg';
import { BiFileFind } from "react-icons/bi";
import logo from "../assets/logo.png";

import '@fontsource/poppins/400.css'; // Weight 400
import '@fontsource/poppins/700.css';
import { useNavigate } from 'react-router-dom';

import MyMap from '../components/MyMap'

const HomePage = () => {
  const navigate = useNavigate();

  // Array of doctor specialties for the categories section
  const specialties = [
    { name: 'Software Engineer', img: doc1 },
    { name: 'Data Scientist', img: doc2 },
    { name: 'Project Manager', img: doc3 },
    { name: 'Financial Analyst', img: doc4 },
    { name: 'Marketing Manager', img: doc5 },
    { name: 'HR Manager', img: doc6 },
    { name: 'Business Analyst', img: doc7 },
    { name: 'Cybersecurity Specialist', img: doc8 },
    { name: 'Product Manager', img: doc9 },
    { name: 'Sales Manager', img: doc10 },
    { name: 'Network Administrator', img: doc11 },
    { name: 'All', img: doc12 },
  ];
  // Slideshow state and logic
  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatically change slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % specialties.length);
    }, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval);
  }, [specialties.length]);


  return (
      <div>
      {/* Section 1: Background Image */}
      <div
        className="flex flex-col md:flex-row min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: "url('/bckground.png')", // Adjust the image path as needed
          backgroundSize: 'cover',
        }}
      >
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center bg-white p-4">
          {/* Banner Section */}
          <div className="bg-blue-900 w-full max-w rounded-lg shadow-lg flex flex-col md:flex-row h-full animate-fade-in">
            {/* Left Side (Text Content) */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center text-white">
              <h1 className="text-4xl md:text-7xl font-bold mb-4 font-sans">
                <span className="inline-block animate-fade-in-right" style={{ animationDelay: '0s' }}>WHERE</span>{' '}
                <span className="inline-block animate-fade-in-right" style={{ animationDelay: '0.1s' }}>GREAT</span>
              </h1>
              <h1 className="text-4xl md:text-7xl font-bold mb-4 font-sans">
                <span className="inline-block animate-fade-in-right" style={{ animationDelay: '0.2s' }}>COMPANIES</span>{' '}
                <span className="inline-block animate-fade-in-right" style={{ animationDelay: '0.3s' }}>AND</span>
              </h1>
              <h1 className="text-4xl md:text-7xl font-bold mb-4 font-sans">
                <span className="inline-block animate-fade-in-right" style={{ animationDelay: '0.4s' }}>GREAT</span>{' '}
                <span className="inline-block animate-fade-in-right" style={{ animationDelay: '0.5s' }}>PEOPLE</span>
              </h1>
              <h1 className="text-4xl md:text-7xl font-bold mb-6 font-sans">
                <span className="inline-block animate-fade-in-right" style={{ animationDelay: '0.6s' }}>MEET</span>
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-300">
                Find the right fit for your Company's future.
              </p>

              <button
                onClick={() => navigate('/People')}
                className="bg-blue-500 text-black px-4 py-3 rounded-full hover:bg-blue-600 mb-9 transform hover:scale-105 transition duration-500 flex items-center justify-center font-semibold text-lg"
              >
                <BiFileFind size={30} />
                Find Them NOW!!
              </button>

              <div className="flex items-center animate-slide-left">
                <div className="bg-[#e1e3fb] p-3 rounded-full mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-300 font-medium">24/7 Emergency Helpline</p>
                  <p className="text-2xl font-bold">+123-456-7890</p>
                </div>
              </div>
            </div>

            {/* Right Side (Slideshow) */}
            <div className="hidden md:flex w-1/2 h-full items-center justify-center">
              <div className="border-4 border-gray-200 rounded-lg overflow-hidden w-3/4 h-3/4 px-12 py-9 relative">
                {/* Slideshow */}
                {specialties.map((specialty, index) => (
                  <img
                    key={index}
                    src={specialty.img}
                    alt={specialty.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ objectPosition: 'center 20%' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Content from File 2 (Doctor Specialties) */}
      <div className="min-h-screen bg-white p-8 text-black mt-10 backdrop-blur-md poppins-400">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-center text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Find new Beginnings to your End with Nexta
          </h1>
          <p className="text-center text-xl md:text-2xl font-light">Hire Effortlessly</p>
        </header>

        {/* Doctor Specialties Circular Cards */}
        <section className="container mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-semibold mb-10">Explore our Space</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {specialties.map((specialty, index) => (
              <Link
                key={index}
                to={`/People/${specialty.name}`}
                className="relative bg-white rounded-lg shadow-lg overflow-hidden group transition-transform duration-300 transform hover:scale-105"
              >
                <div className="w-full h-32 overflow-hidden">
                  <img
                    src={specialty.img}
                    alt={specialty.name}
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70"
                    style={{ objectPosition: 'center 20%' }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300 group-hover:opacity-0">
                  <h3 className="text-white text-xl font-bold">{specialty.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="flex justify-around bg-white from-indigo-600 to-purple-500 text-black py-5 border-t-2 border-black">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex ml-5 mb-4 md:mb-0">
          <img src={logo} className="h-20 w-20 mr-1" alt="Logo"/>
          </div>

          <div className="flex space-x-4 text-gray-900">
            <Link to="/about" className="hover:underline">About Us</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
            <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:underline">Terms of Service</Link>
          </div>

          <div className="mt-4 md:mt-0 text-gray-900">
            &copy; {new Date().getFullYear()} Nexta. All rights reserved.
          </div>
        </div>
      </footer>
    </div>

  );
};

export default HomePage;
