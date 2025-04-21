import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function Reports() {
  const [filters, setFilters] = useState({
    account: '',
    phone: '',
    name: '',
    start_date: '',
    end_date: '',
  });
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    axiosInstance.get('payments/accounts/').then((response) => {
      setAccounts(response.data);
    });
  }, []);

  const handleChange = (e) => {
    setFilters({...filters, [e.target.name]: e.target.value});
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });
      const response = await axiosInstance.get('payments/reports/', { params });
      setTransactions(response.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-6">Reports</h2>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <select
          name="account"
          value={filters.account}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All Accounts</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.code}>
              {acc.code} - {acc.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={filters.phone}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="name"
          placeholder="Member Name"
          value={filters.name}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="date"
          name="start_date"
          value={filters.start_date}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Phone</th>
              <th className="border border-gray-300 px-4 py-2">Account</th>
              <th className="border border-gray-300 px-4 py-2">Amount</th>
              <th className="border border-gray-300 px-4 py-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="border border-gray-300 px-4 py-2">{tx.name}</td>
                <td className="border border-gray-300 px-4 py-2">{tx.phone}</td>
                <td className="border border-gray-300 px-4 py-2">{tx.account.code}</td>
                <td className="border border-gray-300 px-4 py-2">Ksh {tx.amount.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2">{new Date(tx.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
