import React from 'react';

function UserJobs() {
    const requestedJobs = [
        { id: 1, title: 'Frontend Developer', company: 'Company A', date: '2023-10-01' },
        { id: 2, title: 'Backend Developer', company: 'Company B', date: '2023-10-02' },
    ];

    const appliedJobs = [
        { id: 1, title: 'Full Stack Developer', company: 'Company C', date: '2023-10-03' },
        { id: 2, title: 'DevOps Engineer', company: 'Company D', date: '2023-10-04' },
    ];

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h2 className="text-xl font-bold mb-4">Requested Jobs</h2>
                    {requestedJobs.map(job => (
                        <div key={job.id} className="bg-white p-4 mb-4 shadow-md rounded">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <p className="text-gray-600">{job.company}</p>
                            <p className="text-gray-400">{job.date}</p>
                        </div>
                    ))}
                </div>
                <div>
                    <h2 className="text-xl font-bold mb-4">Applied Jobs</h2>
                    {appliedJobs.map(job => (
                        <div key={job.id} className="bg-white p-4 mb-4 shadow-md rounded">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <p className="text-gray-600">{job.company}</p>
                            <p className="text-gray-400">{job.date}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UserJobs;