import React, { useState } from 'react';

const CompanyHires = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('alphabetical');

  const candidates = [
    { id: 1, name: 'John Doe', position: 'Software Engineer' },
    { id: 2, name: 'Jane Smith', position: 'Product Manager' },
    { id: 3, name: 'Sam Johnson', position: 'UX Designer' },
    // Add more sample data as needed
  ];

  const filteredCandidates = candidates
    .filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'latest') {
        return b.id - a.id;
      } else if (sortOption === 'oldest') {
        return a.id - b.id;
      }
      return 0;
    });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hired Candidates</h1>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search candidates..."
          className="p-2 border border-gray-300 rounded w-full mr-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
      <ul>
        {filteredCandidates.map(candidate => (
          <li key={candidate.id} className="mb-2 p-2 border border-gray-300 rounded">
            <h2 className="text-xl font-semibold">{candidate.name}</h2>
            <p className="text-gray-600">{candidate.position}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompanyHires;