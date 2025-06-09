// pages/staff-summary.tsx
import { useEffect, useState } from 'react';
import { User, MapPin } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

interface LocationStat {
  location: string;
  _count: { id: number };
}

// Simple StatCard component to display total stats
const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border flex items-center">
    <div className="mr-4 text-blue-600">{icon}</div>
    <div>
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  </div>
);

export default function StaffSummaryPage() {
  const [totalStaff, setTotalStaff] = useState<number>(0);
  const [totalLocations, setTotalLocations] = useState<number>(0);
  const [locationStats, setLocationStats] = useState<LocationStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchStaffSummary = async () => {
      try {
        const response = await fetch('/api/staff/staff-summary');
        if (response.ok) {
          const data = await response.json();
          setTotalStaff(data.totalStaff);
          setTotalLocations(data.totalLocations);
          setLocationStats(data.locationStats);
        } else {
          setError('Failed to load staff summary.');
        }
      } catch (err) {
        console.error('Error fetching staff summary:', err);
        setError('An error occurred while fetching staff summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffSummary();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading staff summary...</p>
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
      <h2 className="text-gray-700 text-lg font-semibold mb-4">Staff Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard title="Total Staff" value={totalStaff} icon={<User className="w-8 h-8" />} />
        <StatCard title="Total Unique Locations" value={totalLocations} icon={<MapPin className="w-8 h-8" />} />
      </div>

      {/* Panel for Staff by Location */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-gray-700 text-lg font-semibold mb-4">Staff by Location</h3>
        {locationStats.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 px-4">Location</th>
                <th className="py-2 px-4">Staff Count</th>
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
          <p>No staff data available.</p>
        )}
      </div>
    </div>
  );
}
