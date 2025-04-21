import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ManualPayment from './pages/ManualPayment';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import { getToken, getUserRole } from './utils/auth';

function PrivateRoute({ children, roles }) {
  const token = getToken();
  const role = getUserRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute roles={['admin']}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manual-payment"
          element={
            <PrivateRoute roles={['admin', 'finance']}>
              <ManualPayment />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute roles={['admin']}>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <PrivateRoute roles={['admin']}>
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
