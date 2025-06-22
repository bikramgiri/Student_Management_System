// src/components/student/ViewEditProfile.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function ViewEditProfile() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', password: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(formData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => {
          setMessage('');
          navigate('/student/dashboard'); // Navigate to student dashboard on success
        }, 3000);
      } else {
        setMessage('Failed to update profile');
      }
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">View/Edit Profile</h1>
      {message && <p className={message.includes('successfully') ? 'text-green-600' : 'text-red-500'}>{message}</p>}
      <div className="bg-white p-6 rounded shadow max-w-md">
        {!isEditing ? (
          <>
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Role:</strong> {formData.role}</p>
            <button onClick={() => setIsEditing(true)} className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600">
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                className="w-full border p-2 rounded"
                disabled
              />
            </div>
            <div>
              <label className="block">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Save
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ViewEditProfile;