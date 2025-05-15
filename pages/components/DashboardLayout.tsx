import React from 'react';

interface DashboardLayoutProps {
  user: {
    role: 'admin' | 'staff';
    name: string;
    storeName?: string;
    location?: string;
  };
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, children }) => {
  return (
    <div>
      {/* Top Heading */}
      <header className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-lg font-semibold">
          {user.role === 'admin'
            ? `Admin Dashboard - ${user.name} / ${user.storeName}`
            : `Staff Dashboard - ${user.name} (${user.location})`}
        </h1>
      </header>

      <div className="flex">
        {/* Sidebar Menu */}
        <aside className="w-64 bg-gray-100 p-4">
          <ul className="list-none">
            {user.role === 'admin' ? (
              <>
                <li>Overview</li>
                <li>Drug Registration</li>
                <li>Sales</li>
                <li>Staff</li>
                <li>Reports</li>
                <li>Expenses</li>
              </>
            ) : (
              <>
                <li>Overview</li>
                <li>Sales</li>
                <li>Expenses</li>
              </>
            )}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
