import React from 'react';
import { AiOutlineHome } from 'react-icons/ai';

interface OverviewPanelProps {
  storeName: string;
}

const OverviewPanel = ({ storeName }: OverviewPanelProps) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to {storeName} Panel</h1>
        <p className="text-gray-500 mt-2">Dashboard Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-gray-600 text-lg">Total Sales</h3>
          <p className="text-2xl font-bold text-blue-600">₦1,240,500</p>
        </div>

        <div className="p-6 bg-green-50 rounded-lg border border-green-100">
          <h3 className="text-gray-600 text-lg">Today's Revenue</h3>
          <p className="text-2xl font-bold text-green-600">₦85,300</p>
        </div>

        <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
          <h3 className="text-gray-600 text-lg">Inventory Items</h3>
          <p className="text-2xl font-bold text-purple-600">1,428</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center mb-4">
          <AiOutlineHome className="mr-2 text-xl text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">Recent Activity</h3>
        </div>
        
        <ul className="space-y-4">
          <li className="p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            <p className="font-medium">New prescription from Dr. Adebayo</p>
            <p className="text-sm text-gray-500 mt-1">2 hours ago</p>
          </li>
          <li className="p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            <p className="font-medium">Inventory restocked - Paracetamol</p>
            <p className="text-sm text-gray-500 mt-1">5 hours ago</p>
          </li>
          <li className="p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            <p className="font-medium">New staff member added</p>
            <p className="text-sm text-gray-500 mt-1">Yesterday</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OverviewPanel;