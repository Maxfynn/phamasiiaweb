// pages/Drugstore/drugstore.tsx


import DrugsInput from './DrugsInput'
import DrugsTable from './DrugsTable'

export default function DrugstorePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Drugstore Inventory</h1>
    
      <DrugsInput />
      <DrugsTable />
    </div>
    
  );
}
