import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-8">
    <h1 className="text-5xl font-bold text-blue-700 mb-4">Oops! Page not found</h1>
    <p className="text-lg text-gray-600 mb-8">The page you are looking for does not exist or has been moved.</p>
    <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all">Go to Homepage</Link>
  </div>
);

export default NotFound; 