"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

interface StoreEntry {
  id: number;
  drug_name: string;
  type: string;
  dose_quantity: number;
  purchase_price: number;
  unit_cost_price: number;
  remaining_quantity: number;
  date_entered: string;
}

interface SaleEntry {
  id: string;
  store_id: number;
  dose_sold: number;
  selling_price: number;
  unit_cost_price: number;
  profit: number;
  date_sold: string;
}

interface HistoryEntry {
  id: string;
  action_type: "input" | "sale";
  drug_name: string;
  details: string;
  timestamp: string;
}

const SalesPanel = () => {
  const [store, setStore] = useState<StoreEntry[]>([]);
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [selectedDrugId, setSelectedDrugId] = useState<number>(0);
  const [doseSold, setDoseSold] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);

  // Fetch inventory
  const fetchDrugs = async () => {
    try {
      const res = await fetch("/api/drugstore/store");
      const data = await res.json();

      const formatted: StoreEntry[] = data.map((item: any) => ({
        id: item.id,
        drug_name: item.name,
        type: item.type,
        dose_quantity: item.doseQuantity,
        purchase_price: item.purchasePrice,
        unit_cost_price: item.unitCostPrice,
        remaining_quantity: item.remainingQuantity,
        date_entered: item.createdAt || item.updatedAt || dayjs().format(),
      }));

      setStore(formatted);
    } catch (error) {
      console.error("Failed to fetch drugs:", error);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  // Handle sale
  const handleSale = async () => {
    const storeItem = store.find((item) => item.id === selectedDrugId);
    if (!storeItem) return alert("Drug not found");
    if (doseSold <= 0 || sellingPrice <= 0)
      return alert("Enter valid values");
    if (storeItem.remaining_quantity < doseSold)
      return alert("Insufficient stock");

    const cost = doseSold * storeItem.unit_cost_price;
    const profit = sellingPrice - cost;

    try {
      const res = await fetch("/api/sales/sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          drugstoreId: storeItem.id,
          doseSold,
          unitCostPrice: storeItem.unit_cost_price,
          salesPrice: sellingPrice,
          profit: parseFloat(profit.toFixed(2)),
          closed: false, // Optional, can be set to true if needed
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const result = await res.json();

      const newSale: SaleEntry = {
        id: uuidv4(),
        store_id: storeItem.id,
        dose_sold: doseSold,
        selling_price: sellingPrice,
        unit_cost_price: storeItem.unit_cost_price,
        profit: parseFloat(profit.toFixed(2)),
        date_sold: dayjs().format(),
      };

      const newHistory: HistoryEntry = {
        id: uuidv4(),
        action_type: "sale",
        drug_name: storeItem.drug_name,
        details: `Sold ${doseSold} ${storeItem.drug_name} ${storeItem.type.toLowerCase()}s for ${sellingPrice} TSH. Profit: ${profit.toFixed(2)} TSH.`,
        timestamp: dayjs().format(),
      };

      await fetchDrugs(); // Update store with latest stock

      setSales((prev) => [...prev, newSale]);
      setHistory((prev) => [newHistory, ...prev]);

      // Reset form
      setDoseSold(0);
      setSellingPrice(0);
      setSelectedDrugId(0);

      alert("Sale recorded and inventory updated!");
    } catch (error: any) {
      alert("Error: " + error.message);
      console.error("Sale submission error:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Drug Sales Panel</h2>

      {/* Inventory Table */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Available Inventory</h3>
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Drug</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Dose Qty</th>
              <th className="p-2 border">Unit Cost</th>
              <th className="p-2 border">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {store.map((drug) => (
              <tr key={drug.id}>
                <td className="p-2 border">{drug.drug_name}</td>
                <td className="p-2 border">{drug.type}</td>
                <td className="p-2 border">{drug.dose_quantity}</td>
                <td className="p-2 border">
                  {drug.unit_cost_price.toFixed(2)} TSH
                </td>
                <td className="p-2 border">{drug.remaining_quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sale Form */}
      <div className="bg-gray-50 p-4 rounded-md shadow">
        <h3 className="text-xl font-semibold mb-3">Sell Drug</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Select Drug
            </label>
            <select
              className="p-2 border rounded w-full"
              value={selectedDrugId}
              onChange={(e) => setSelectedDrugId(Number(e.target.value))}
            >
              <option value={0}>-- Select Drug --</option>
              {store.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.drug_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Dose Sold</label>
            <input
              type="number"
              className="p-2 border rounded w-full"
              placeholder="e.g. 10"
              value={doseSold}
              onChange={(e) => setDoseSold(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Selling Price (TSH)
            </label>
            <input
              type="number"
              className="p-2 border rounded w-full"
              placeholder="e.g. 2000"
              value={sellingPrice}
              onChange={(e) =>
                setSellingPrice(parseFloat(e.target.value))
              }
            />
          </div>
        </div>

        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleSale}
        >
          Record Sale
        </button>
      </div>
    </div>
  );
};

export default SalesPanel;
