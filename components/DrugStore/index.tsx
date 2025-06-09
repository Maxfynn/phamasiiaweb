"use client";

import DrugsInput from "./DrugsInput";
import DrugsTable from "./DrugsTable";

export default function DrugstorePage() {
  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">Drugstore Inventory</h1>
        {/* Optional: Add another place for the button here if needed */}
      </div>

      {/* Add Drug Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <DrugsInput />
      </div>

      {/* Drug Table */}
      <div className="bg-white rounded-xl shadow-md p-6 overflow-auto">
        <DrugsTable />
      </div>
    </div>
  );
}
