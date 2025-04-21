import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function ManualPayment() {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    amount: '',
    account_id: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('payments/accounts/').then((response) => {
      setAccounts(response.data);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axiosInstance.post('payments/transactions/manual/', {
        name: formData.name,
        phone: formData.phone,
        amount: parseFloat(formData.amount),
        account_id: formData.account_id,
      });
      setMessage('Payment recorded and SMS sent successfully.');
      setFormData({name: '', phone: '', amount: '', account_id: ''});
    } catch (err) {
      setError('Failed to record payment. Please check your inputs.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Manual Payment Entry</h2>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-semibold">Member Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <label className="block mb-2 font-semibold">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <label className="block mb-2 font-semibold">Amount</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <label className="block mb-2 font-semibold">Income Account</label>
        <select
          name="account_id"
          value={formData.account_id}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded mb-6"
        >
          <option value="">Select Account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.code} - {acc.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Record Payment
        </button>
      </form>
    </div>
  );
}
