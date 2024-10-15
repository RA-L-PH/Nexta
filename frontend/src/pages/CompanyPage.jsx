import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa';
import { MdOpenInNew } from 'react-icons/md';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const presumedCompaniesData = [
  {
    id: 'company1',
    name: 'Tech Innovators',
    industry: 'Software Development',
    teamSize: 50,
    hourlyRate: '$120',
    logoUrl: 'https://example.com/logos/tech-innovators-logo.png',
    linkedin: 'https://linkedin.com/company/tech-innovators',
    github: 'https://github.com/tech-innovators',
    twitter: 'https://twitter.com/tech_innovators',
    portfolioLink: 'https://tech-innovators.com/portfolio',
    documentFile: 'company1/proposal.pdf',
  },
  {
    id: 'company2',
    name: 'Design Studio X',
    industry: 'Graphic Design',
    teamSize: 25,
    hourlyRate: '$85',
    logoUrl: 'https://example.com/logos/design-studio-x-logo.png',
    linkedin: 'https://linkedin.com/company/design-studio-x',
    github: '',
    twitter: 'https://twitter.com/design_studio_x',
    portfolioLink: 'https://designstudiox.com/works',
    documentFile: 'company2/brochure.pdf',
  },
  {
    id: 'company3',
    name: 'Marketing Masters',
    industry: 'Digital Marketing',
    teamSize: 100,
    hourlyRate: '$150',
    logoUrl: 'https://example.com/logos/marketing-masters-logo.png',
    linkedin: 'https://linkedin.com/company/marketing-masters',
    github: '',
    twitter: 'https://twitter.com/marketing_masters',
    portfolioLink: '',
    documentFile: 'company3/marketing-strategy.pdf',
  },
  {
    id: 'company4',
    name: 'Green Energy Solutions',
    industry: 'Renewable Energy',
    teamSize: 200,
    hourlyRate: '$200',
    logoUrl: 'https://example.com/logos/green-energy-logo.png',
    linkedin: 'https://linkedin.com/company/green-energy-solutions',
    github: 'https://github.com/green-energy-solutions',
    twitter: '',
    portfolioLink: 'https://greenenergysolutions.com/case-studies',
    documentFile: 'company4/company-overview.pdf',
  },
];

const CompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [resumeUrl, setResumeUrl] = useState(''); // Store resume URL for viewing
  const storage = getStorage();

  useEffect(() => {
    // Load presumed data for testing
    setCompanies(presumedCompaniesData);
  }, []);

  const handleViewResume = async (documentFile) => {
    try {
      const resumeRef = ref(storage, documentFile);
      const resumeURL = await getDownloadURL(resumeRef);
      setResumeUrl(resumeURL);
      window.open(resumeURL, '_blank');
    } catch (error) {
      toast.error('Error fetching resume. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-white py-8 font-sans">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl text-green-900 font-extrabold mb-8 text-center"
        >
          Discover Top Companies
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {companies.map((company) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center border-2 border-green-300"
            >
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800">{company.name}</h3>
              <p className="text-gray-600">{company.industry}</p>
              <p className="text-gray-600">Team Size: {company.teamSize}</p>
              <p className="text-gray-600">Hourly Rate: {company.hourlyRate}</p>

              {/* Social Links */}
              <div className="flex justify-center mt-4 gap-4">
                {company.linkedin && (
                  <a
                    href={company.linkedin}
                    className="text-lg text-gray-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin size={24} />
                  </a>
                )}
                {company.github && (
                  <a
                    href={company.github}
                    className="text-lg text-gray-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaGithub size={24} />
                  </a>
                )}
                {company.twitter && (
                  <a
                    href={company.twitter}
                    className="text-lg text-gray-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaTwitter size={24} />
                  </a>
                )}
              </div>

              {/* Portfolio & Resume */}
              <div className="flex justify-center mt-4 gap-4">
                {/* Portfolio Link */}
                {company.portfolioLink ? (
                  <a
                    href={company.portfolioLink}
                    className="text-lg text-green-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MdOpenInNew size={24} />
                  </a>
                ) : (
                  <MdOpenInNew size={24} className="text-gray-400" />
                )}

                {/* View Resume */}
                <button
                  onClick={() => handleViewResume(company.documentFile)}
                  className="text-lg text-green-600"
                >
                  <MdOpenInNew size={24} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;
