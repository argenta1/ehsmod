import React from 'react';
import { Link } from 'react-router-dom';
import { User, Users } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">Welcome to EHS Modular</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link
          to="/admin-login"
          className="bg-blue-600 rounded-lg p-6 flex items-center justify-center text-gray-100 transition-transform duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg"
        >
          <User size={32} className="mr-4" />
          <span className="text-2xl font-bold">Admin</span>
        </Link>
        <Link
          to="/services"
          className="bg-green-600 rounded-lg p-6 flex items-center justify-center text-gray-100 transition-transform duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg"
        >
          <Users size={32} className="mr-4" />
          <span className="text-2xl font-bold">Agent</span>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;