import { useState } from "react";

import StaffRegistration from "./StaffInput";
import StaffSummary from "./StaffSummary";
import StaffTable from "./StaffTable";

export default function StaffPanel() {
  const [refreshTable, setRefreshTable] = useState(false);

  const handleRefresh = () => {
    setRefreshTable((prev) => !prev); // Toggle state to trigger a re-render
  };

  return (
    <div>
      <h1>HELLO WELCOME TO STAFF</h1>
      <StaffSummary/>
      <StaffRegistration onSuccess={handleRefresh} />
      <StaffTable key={refreshTable ? "refresh-on" : "refresh-off"} />
    </div>
  );
}
