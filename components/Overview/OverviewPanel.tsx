import React from 'react';
import { AiOutlineHome, AiOutlineArrowUp, AiOutlineArrowDown, AiOutlineUser } from 'react-icons/ai';

interface OverviewPanelProps {
  storeName: string;
}

const OverviewPanel = ({ storeName }: OverviewPanelProps) => {
  return (
    <div className="p-6 md:p-10 bg-white rounded-2xl shadow-lg space-y-10">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Welcome to <span className="text-blue-600">{storeName}</span> Panel
        </h1>
        <p className="text-gray-500 text-lg">Get insights and monitor your store's performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-100 rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg text-blue-800 font-semibold">Total Sales</h3>
            <AiOutlineArrowUp className="text-blue-700 text-xl" />
          </div>
          <p className="text-3xl font-bold text-blue-800">₦1,240,500</p>
        </div>

        <div className="p-6 bg-green-100 rounded-xl shadow-sm hover:shadow-md transition-all border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg text-green-800 font-semibold">Today's Revenue</h3>
            <AiOutlineArrowDown className="text-green-700 text-xl" />
          </div>
          <p className="text-3xl font-bold text-green-800">₦85,300</p>
        </div>

        <div className="p-6 bg-purple-100 rounded-xl shadow-sm hover:shadow-md transition-all border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg text-purple-800 font-semibold">Inventory Items</h3>
            <AiOutlineUser className="text-purple-700 text-xl" />
          </div>
          <p className="text-3xl font-bold text-purple-800">1,428</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center mb-6">
          <AiOutlineHome className="mr-3 text-2xl text-blue-600" />
          <h3 className="text-2xl font-semibold text-gray-800">Recent Activity</h3>
        </div>

        <ul className="space-y-4">
          {[
            { title: 'New prescription from Dr. Adebayo', time: '2 hours ago' },
            { title: 'Inventory restocked - Paracetamol', time: '5 hours ago' },
            { title: 'New staff member added', time: 'Yesterday' },
          ].map((item, index) => (
            <li
              key={index}
              className="p-5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <p className="font-medium text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500 mt-1">{item.time}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OverviewPanel;
