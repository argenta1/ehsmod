import React, { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { db, storage, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, LogOut, Trash2, FileText, Edit2, Check, X, AlertCircle, Link as LinkIcon, Plus } from 'lucide-react';

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

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: string }>({});
  const [editingService, setEditingService] = useState<string | null>(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newSubServiceName, setNewSubServiceName] = useState('');
  const [purchaseLinks, setPurchaseLinks] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/admin-login');
      } else {
        fetchServices();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchServices = async () => {
    try {
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const servicesData = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Service));
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, serviceId: string, subService: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [`${serviceId}-${subService}`]: e.target.files![0] }));
    }
  };

  const handleUpload = async (serviceId: string, subService: string) => {
    const fileKey = `${serviceId}-${subService}`;
    const file = files[fileKey];
    if (!file) {
      setUploadStatus(prev => ({ ...prev, [fileKey]: 'No file selected' }));
      return;
    }

    setUploadStatus(prev => ({ ...prev, [fileKey]: 'Uploading...' }));

    try {
      const storageRef = ref(storage, `files/${fileKey}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await setDoc(doc(db, 'files', fileKey), {
        url: downloadURL,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        serviceId: serviceId,
        subService: subService,
        purchaseLink: purchaseLinks[fileKey] || ''
      });

      setUploadStatus(prev => ({ ...prev, [fileKey]: 'Uploaded successfully' }));
      setFiles(prev => ({ ...prev, [fileKey]: null }));
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadStatus(prev => ({ ...prev, [fileKey]: `Upload failed: ${error.message}` }));
    }
  };

  const handleDelete = async (serviceId: string, subService: string) => {
    const fileKey = `${serviceId}-${subService}`;
    try {
      await deleteDoc(doc(db, 'files', fileKey));
      const storageRef = ref(storage, `files/${fileKey}`);
      await deleteObject(storageRef);
      setUploadStatus(prev => ({ ...prev, [fileKey]: 'File deleted' }));
    } catch (error) {
      console.error('Error deleting file:', error);
      setUploadStatus(prev => ({ ...prev, [fileKey]: 'Delete failed' }));
    }
  };

  const handleEditService = (serviceId: string) => {
    setEditingService(serviceId);
    setNewServiceName(services.find(s => s.id === serviceId)?.name || '');
  };

  const handleSaveService = async (serviceId: string) => {
    try {
      await updateDoc(doc(db, 'services', serviceId), { name: newServiceName });
      setEditingService(null);
      fetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleAddSubService = async (serviceId: string) => {
    if (newSubServiceName.trim() === '') return;
    try {
      await updateDoc(doc(db, 'services', serviceId), {
        subServices: arrayUnion(newSubServiceName.trim())
      });
      setNewSubServiceName('');
      fetchServices();
    } catch (error) {
      console.error('Error adding sub-service:', error);
    }
  };

  const handleRemoveSubService = async (serviceId: string, subService: string) => {
    try {
      await updateDoc(doc(db, 'services', serviceId), {
        subServices: arrayRemove(subService)
      });
      fetchServices();
    } catch (error) {
      console.error('Error removing sub-service:', error);
    }
  };

  const handleAddService = async () => {
    if (newServiceName.trim() === '') return;
    try {
      const newServiceRef = doc(collection(db, 'services'));
      await setDoc(newServiceRef, {
        name: newServiceName.trim(),
        subServices: []
      });
      setNewServiceName('');
      fetchServices();
    } catch (error) {
      console.error('Error adding new service:', error);
    }
  };

  const handlePurchaseLinkChange = (serviceId: string, subService: string, link: string) => {
    setPurchaseLinks(prev => ({ ...prev, [`${serviceId}-${subService}`]: link }));
  };

  return (
    <div className="min-h-screen p-4 flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center"
        >
          <LogOut size={20} className="mr-2" />
          Logout
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Add New Service</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            placeholder="New service name"
            className="p-2 border rounded mr-2 flex-grow dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            onClick={handleAddService}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Service
          </button>
        </div>
      </div>

      {services.map((service) => (
        <div key={service.id} className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            {editingService === service.id ? (
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="p-2 border rounded mr-2 flex-grow dark:bg-gray-700 dark:border-gray-600"
              />
            ) : (
              <h2 className="text-2xl font-bold">{service.name}</h2>
            )}
            <div>
              {editingService === service.id ? (
                <>
                  <button
                    onClick={() => handleSaveService(service.id)}
                    className="bg-green-500 text-white p-2 rounded mr-2 hover:bg-green-600 transition-colors"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => setEditingService(null)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleEditService(service.id)}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                >
                  <Edit2 size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Sub-services</h3>
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={newSubServiceName}
                onChange={(e) => setNewSubServiceName(e.target.value)}
                placeholder="New sub-service name"
                className="p-2 border rounded mr-2 flex-grow dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={() => handleAddSubService(service.id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add
              </button>
            </div>
            {service.subServices.map((subService, index) => (
              <div key={index} className="flex items-center justify-between mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <span>{subService}</span>
                <button
                  onClick={() => handleRemoveSubService(service.id, subService)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">File Management</h3>
            {service.subServices.map((subService, index) => {
              const fileKey = `${service.id}-${subService}`;
              return (
                <div key={index} className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
                  <h4 className="font-semibold mb-2">{subService}</h4>
                  <div className="flex items-center mb-2">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, service.id, subService)}
                      className="mr-2"
                    />
                    <button
                      onClick={() => handleUpload(service.id, subService)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center mr-2"
                    >
                      <Upload size={20} className="mr-2" />
                      Upload
                    </button>
                    <button
                      onClick={() => handleDelete(service.id, subService)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center"
                    >
                      <Trash2 size={20} className="mr-2" />
                      Delete
                    </button>
                  </div>
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      value={purchaseLinks[fileKey] || ''}
                      onChange={(e) => handlePurchaseLinkChange(service.id, subService, e.target.value)}
                      placeholder="Purchase link"
                      className="p-2 border rounded mr-2 flex-grow dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button
                      onClick={() => handleUpload(service.id, subService)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center"
                    >
                      <LinkIcon size={20} className="mr-2" />
                      Save Link
                    </button>
                  </div>
                  {uploadStatus[fileKey] && (
                    <p className={`mt-2 ${uploadStatus[fileKey].includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
                      {uploadStatus[fileKey]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;