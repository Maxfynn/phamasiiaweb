import { useState } from "react";


import ExpenseInput from "./ExpInput";
import ExpensesTable from "./ExpTable";
import ExpensesDaily from "./ExpDaily";
import Expenses from "./Expenses";

export default function ExpensesPanel() {
  const [reloadData, setReloadData] = useState(false);

  const handleDataUpdate = () => {
    console.log("Data updated. Reloading table...");
    setReloadData(prev => !prev); // Toggle reloadData to trigger a re-fetch.
  };

  return (
    <div className="p-1">
      <h1 className="text-blue-600 ml-4 text-2xl font-bold">HELLO WELCOME TO EXPENSES</h1>
      <Expenses/>
      <ExpensesDaily/>
      <ExpenseInput onDataAdded={handleDataUpdate} />
      <ExpensesTable reloadData={reloadData} />
      
    </div>
  );
}
