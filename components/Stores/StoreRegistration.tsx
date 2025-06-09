import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';

interface FormData {
  storeName: string;
  customerId: string;
  location: string;
}

interface StoreRegistrationProps {
  onSuccess?: () => void;
}

export default function StoreRegistration({ onSuccess }: StoreRegistrationProps) {
  const [formData, setFormData] = useState<FormData>({
    storeName: '',
    customerId: '',
    location: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Retrieve live location on mount using Geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          }));
        },
        (error) => {
          console.error('Error retrieving location:', error);
          setErrorMessage('Unable to retrieve location. Please enable location services.');
        }
      );
    } else {
      setErrorMessage('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.storeName || !formData.customerId || !formData.location) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/Stores/Store-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: formData.storeName,
          customerId: parseInt(formData.customerId, 10),
          location: formData.location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'An error occurred while creating the store.');
      } else {
        setSuccessMessage('Store created successfully!');

        setFormData((prev) => ({
          ...prev,
          storeName: '',
          customerId: '',
        }));

        // 🔔 Notify parent component (StoreLayout) to refresh table
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      setErrorMessage('An error occurred while submitting the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Store</h1>

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-gray-700">Store Name:</label>
          <input
            type="text"
            name="storeName"
            placeholder="Enter The Store Name"
            value={formData.storeName}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Customer ID:</label>
          <input
            type="number"
            name="customerId"
            placeholder="Enter Customer ID"
            value={formData.customerId}
            onChange={handleChange}
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Location (retrieved live):</label>
          <input
            type="text"
            name="location"
            placeholder="..."
            value={formData.location}
            readOnly
            className="w-full p-2 border rounded mt-1 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="col-span-2 flex justify-end gap-4 mt-4">
          <button
            type="reset"
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                storeName: '',
                customerId: '',
              }))
            }
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
