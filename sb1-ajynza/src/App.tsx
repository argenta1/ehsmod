import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './components/HomePage';
import ServicePage from './components/ServicePage';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import ServicesPage from './components/ServicesPage';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <ThemeToggle />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service/:id" element={<ServicePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-login" element={<AdminLogin />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;