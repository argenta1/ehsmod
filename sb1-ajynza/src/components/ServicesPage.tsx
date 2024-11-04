import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Droplet, Wind, Sun, Home, ArrowLeft } from 'lucide-react';

interface Service {
  id: string;
  name: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  'water-filtration': Droplet,
  'window-cleaning': Wind,
  'solar': Sun,
  'patios': Home,
};

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Service));
        setServices(servicesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return <div className="min-h-screen p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">{error}</div>;
  }

  return (
    <div className="min-h-screen p-4 flex flex-col bg-gray-100 dark:bg-gray-900">
      <button
        onClick={() => navigate('/')}
        className="self-start mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
      >
        <ArrowLeft className="mr-2" />
        Back to Home
      </button>
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100 self-center">Home Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
        {services.map((service) => {
          const Icon = iconMap[service.id] || Home;
          return (
            <Link
              key={service.id}
              to={`/service/${service.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center justify-center text-gray-900 dark:text-gray-100 transition-transform duration-200 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <Icon size={32} className="mr-4" />
              <span className="text-2xl font-bold">{service.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesPage;