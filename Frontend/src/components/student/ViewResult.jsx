// src/components/student/ViewResult.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fetchResults } from '../../redux/resultSlice';

function ViewResult() {
  const dispatch = useDispatch();
  const { results, loading, error } = useSelector((state) => state.results);
  const { user } = useSelector((state) => state.auth);
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    dispatch(fetchResults());
  }, [dispatch]);

  const filteredResults = selectedSubject === 'all' ? results : results.filter(res => res.subject === selectedSubject);

  const barData = filteredResults.map(res => ({
    subject: res.subject,
    pass: res.marks >= 40 ? 1 : 0,
    fail: res.marks < 40 ? 1 : 0,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">View Result</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium">Select Subject</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Subjects</option>
          {[...new Set(results.map(res => res.subject))].map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <BarChart width={600} height={300} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pass" fill="#4CAF50" name="Pass" />
            <Bar dataKey="fail" fill="#F44336" name="Fail" />
          </BarChart>
          <table className="w-full border-collapse border mt-4">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Student Name</th>
                <th className="border p-2">Subject</th>
                <th className="border p-2">Marks</th>
                <th className="border p-2">Pass/Fail</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map(res => (
                <tr key={res._id}>
                  <td className="border p-2">{user.name}</td>
                  <td className="border p-2">{res.subject}</td>
                  <td className="border p-2">{res.marks}</td>
                  <td className="border p-2">{res.marks >= 40 ? 'Pass' : 'Fail'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default ViewResult;