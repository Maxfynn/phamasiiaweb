import { useState } from "react";

import StorePanel from "./StorePanel";
import StoreRegistration from "./StoreRegistration";
import StoreTable from "./StoreTable";

export default function StaffPanel() {
  const [refreshTable, setRefreshTable] = useState(false);

  const handleRefresh = () => {
    setRefreshTable((prev) => !prev); // Toggle state to trigger table refresh
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Welcome to the Staff Panel</h1>
        <p className="text-gray-600">Manage stores efficiently and effectively.</p>
      </header>

      <section>
        <StorePanel />
      </section>

      <section>
        <StoreRegistration onSuccess={handleRefresh} />
      </section>

      <section>
        <StoreTable key={refreshTable ? "refresh-on" : "refresh-off"} />
      </section>
    </div>
  );
}
