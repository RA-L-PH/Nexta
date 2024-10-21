import React, { useState } from 'react';

const candidates = [
  { id: 1, name: "John Doe", position: "Software Engineer", imageUrl: "https://via.placeholder.com/150" },
  { id: 2, name: "Jane Smith", position: "Product Manager", imageUrl: "https://via.placeholder.com/150" },
  { id: 3, name: "Alice Johnson", position: "UX Designer", imageUrl: "https://via.placeholder.com/150" },
  { id: 4, name: "Bob Brown", position: "Data Scientist", imageUrl: "https://via.placeholder.com/150" }
];

const UserHires = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hired Candidates</h1>
      <input
        type="text"
        placeholder="Search by name or position"
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4 p-2 border border-gray-300 rounded w-full"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCandidates.map(candidate => (
          <div key={candidate.id} className="border p-4 rounded shadow">
            <img src={candidate.imageUrl} alt={candidate.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-semibold">{candidate.name}</h2>
            <p className="text-gray-600">{candidate.position}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHires;