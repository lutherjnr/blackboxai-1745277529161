import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { setToken, setUserRole } from '../utils/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axiosInstance.post('auth/token/', {
        username,
        password,
      });
      setToken(response.data.access);
      // Decode token to get user role or fetch user info
      // For simplicity, fetch user info here
      const userResponse = await axiosInstance.get('users/');
      const user = userResponse.data.find(u => u.username === username);
      if (user) {
        setUserRole(user.role);
      }
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">CFMS Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-semibold">Username</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label className="block mb-2 font-semibold">Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
