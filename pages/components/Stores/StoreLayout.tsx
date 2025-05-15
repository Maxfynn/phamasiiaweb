import { useState } from "react";

import StorePanel from "./StorePanel";
import StoreRegistration from "./StoreRegistration";
import StoreTable from "./StoreTable";

export default function StaffPanel() {
  const [refreshTable, setRefreshTable] = useState(false);

  const handleRefresh = () => {
    setRefreshTable((prev) => !prev); // Toggle state to trigger a re-render
  };

  return (
    <div>
      <h1>HELLO WELCOME TO STAFF</h1>
      <StorePanel/>
      <StoreRegistration onSuccess={handleRefresh} />
      <StoreTable  key={refreshTable ? "refresh-on" : "refresh-off"} />
    </div>
  );
}
