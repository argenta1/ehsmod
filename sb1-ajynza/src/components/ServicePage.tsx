import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle, ShoppingCart } from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

interface Service {
  id: string;
  name: string;
  subServices: string[];
}

interface FileInfo {
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  purchaseLink?: string;
}

const ServicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [filesInfo, setFilesInfo] = useState<{ [key: string]: FileInfo }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceAndFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const serviceDoc = await getDoc(doc(db, 'services', id as string));
        if (serviceDoc.exists()) {
          setService(serviceDoc.data() as Service);
          
          const filesQuery = query(collection(db, 'files'), where('serviceId', '==', id));
          const filesSnapshot = await getDocs(filesQuery);
          const filesData: { [key: string]: FileInfo } = {};
          filesSnapshot.forEach((doc) => {
            filesData[doc.id] = doc.data() as FileInfo;
          });
          setFilesInfo(filesData);
        } else {
          setError('Service not found');
        }
      } catch (err) {
        console.error('Error fetching service information:', err);
        setError('Unable to load service information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceAndFiles();
    }
  }, [id]);

  const getServiceColor = (serviceId: string) => {
    const colors: { [key: string]: string } = {
      'water-filtration': 'bg-blue-600',
      'window-cleaning': 'bg-green-600',
      'solar': 'bg-yellow-600',
      'patios': 'bg-purple-600'
    };
    return colors[serviceId] || 'bg-gray-600';
  };

  if (loading) {
    return <div className="min-h-screen p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  if (error || !service) {
    return <div className="min-h-screen p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">{error || 'Service not found'}</div>;
  }

  return (
    <div className="min-h-screen p-4 flex flex-col bg-gray-100 dark:bg-gray-900">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
        <ArrowLeft className="mr-2" />
        Back
      </button>
      <h1 className={`text-3xl font-bold mb-6 ${getServiceColor(service.id).replace('bg-', 'text-')}`}>
        {service.name}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {service.subServices.map((subService, index) => {
          const fileInfo = filesInfo[`${service.id}-${subService}`];
          return (
            <div key={index} className={`${getServiceColor(service.id)} rounded-lg p-6 flex flex-col items-center justify-center text-gray-100 shadow-lg`}>
              <span className="text-xl font-bold mb-4">{subService}</span>
              {fileInfo ? (
                <>
                  <FileText size={32} className="mb-2" />
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <a
                      href={fileInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-gray-900 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      View File
                    </a>
                    {fileInfo.purchaseLink && (
                      <a
                        href={fileInfo.purchaseLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors flex items-center"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Purchase
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-sm">No file uploaded</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServicePage;