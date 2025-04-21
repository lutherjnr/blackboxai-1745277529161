import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [totals, setTotals] = useState([]);

  useEffect(() => {
    axiosInstance.get('payments/dashboard/').then((response) => {
      setTotals(response.data.totals);
    });
  }, []);

  const data = {
    labels: totals.map((item) => item.account__name),
    datasets: [
      {
        label: 'Total Income',
        data: totals.map((item) => item.total_amount),
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {totals.map((item) => (
          <div key={item.account__code} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{item.account__name}</h2>
            <p className="text-2xl font-bold">Ksh {item.total_amount.toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded shadow">
        <Bar data={data} />
      </div>
    </div>
  );
}
