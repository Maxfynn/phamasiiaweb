// components/Stores/StoreSummary.tsx
import { useEffect, useState } from 'react';
import { MdStorefront } from 'react-icons/md';
import { MapPin } from 'lucide-react';

interface StoreLocationStat {
  location: string;
  _count: { id: number };
}

export default function StoreSummary() {
  const [totalStores, setTotalStores] = useState<number>(0);
  const [totalUniqueLocations, setTotalUniqueLocations] = useState<number>(0);
  const [locationStats, setLocationStats] = useState<StoreLocationStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchStoreSummary = async () => {
      try {
        const response = await fetch('/api/Stores/Store-Summary');
        if (response.ok) {
          const data = await response.json();
          setTotalStores(data.totalStores);
          setTotalUniqueLocations(data.totalUniqueLocations);
          setLocationStats(data.locationStats || []);
        } else {
          setError('Failed to load store summary.');
        }
      } catch (err) {
        console.error('Error fetching store summary:', err);
        setError('An error occurred while fetching store summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreSummary();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading store summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-gray-700 text-lg font-semibold mb-4">Store Summary</h2>

      {/* Stats Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border flex items-center">
          <div className="mr-4 text-blue-600">
            <MdStorefront className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm">Total Stores</h3>
            <p className="text-3xl font-bold text-blue-600">{totalStores}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border flex items-center">
          <div className="mr-4 text-blue-600">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 text-sm">Total Unique Locations</h3>
            <p className="text-3xl font-bold text-blue-600">{totalUniqueLocations}</p>
          </div>
        </div>
      </div>

      {/* Location Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-gray-700 text-lg font-semibold mb-4">Stores by Location</h3>

        {locationStats.length > 0 ? (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 px-4">Location</th>
                <th className="py-2 px-4">Store Count</th>
              </tr>
            </thead>
            <tbody>
              {locationStats.map((stat) => (
                <tr key={stat.location} className="border-b">
                  <td className="py-2 px-4">{stat.location}</td>
                  <td className="py-2 px-4">{stat._count.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No store data available.</p>
        )}
      </div>
    </div>
  );
}
