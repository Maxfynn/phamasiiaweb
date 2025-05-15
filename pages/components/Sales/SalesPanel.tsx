"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

interface StoreEntry {
  id: string;
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
  store_id: string;
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

  const [selectedDrugId, setSelectedDrugId] = useState<string>("");
  const [doseSold, setDoseSold] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);

  useEffect(() => {
    // Simulated store entry
    const initialStore: StoreEntry[] = [
      {
        id: uuidv4(),
        drug_name: "Paracetamol",
        type: "Pill",
        dose_quantity: 500,
        purchase_price: 20,
        unit_cost_price: 20 / 500,
        remaining_quantity: 500,
        date_entered: dayjs().format(),
      },
    ];
    setStore(initialStore);
  }, []);

  const handleSale = () => {
    const storeItem = store.find((item) => item.id === selectedDrugId);
    if (!storeItem) return alert("Drug not found");
    if (doseSold <= 0 || sellingPrice <= 0) return alert("Enter valid values");
    if (storeItem.remaining_quantity < doseSold) return alert("Insufficient stock");

    const cost = doseSold * storeItem.unit_cost_price;
    const profit = sellingPrice - cost;

    const updatedStore = store.map((item) =>
      item.id === storeItem.id
        ? {
            ...item,
            remaining_quantity: item.remaining_quantity - doseSold,
          }
        : item
    );

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
      details: `Sold ${doseSold} ${storeItem.drug_name} ${storeItem.type.toLowerCase()}s for ${sellingPrice} TSH. Profit: ${profit.toFixed(
        2
      )} TSH.`,
      timestamp: dayjs().format(),
    };

    setStore(updatedStore);
    setSales([...sales, newSale]);
    setHistory([newHistory, ...history]);
    setDoseSold(0);
    setSellingPrice(0);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Drug Sales Panel</h2>

      {/* Store View */}
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
                <td className="p-2 border">{drug.unit_cost_price.toFixed(2)} TSH</td>
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
          <select
            className="p-2 border rounded"
            value={selectedDrugId}
            onChange={(e) => setSelectedDrugId(e.target.value)}
          >
            <option value="">Select Drug</option>
            {store.map((item) => (
              <option key={item.id} value={item.id}>
                {item.drug_name} ({item.type})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Dose sold"
            className="p-2 border rounded"
            value={doseSold}
            onChange={(e) => setDoseSold(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Selling Price"
            className="p-2 border rounded"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Number(e.target.value))}
          />
        </div>
        <button
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={handleSale}
        >
          Confirm Sale
        </button>
      </div>

      {/* Sales Log */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Sales History</h3>
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Drug</th>
              <th className="p-2 border">Dose Sold</th>
              <th className="p-2 border">Sale Price</th>
              <th className="p-2 border">Profit</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const drug = store.find((d) => d.id === sale.store_id);
              return (
                <tr key={sale.id}>
                  <td className="p-2 border">{drug?.drug_name}</td>
                  <td className="p-2 border">{sale.dose_sold}</td>
                  <td className="p-2 border">{sale.selling_price} TSH</td>
                  <td className="p-2 border">{sale.profit} TSH</td>
                  <td className="p-2 border">{dayjs(sale.date_sold).format("YYYY-MM-DD HH:mm")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Action History */}
      <div>
        <h3 className="text-xl font-semibold mb-2">System Activity Logs</h3>
        <ul className="text-sm space-y-2">
          {history.map((log) => (
            <li key={log.id} className="bg-white p-2 border rounded">
              <strong>[{log.action_type.toUpperCase()}]</strong> {log.details} <br />
              <span className="text-gray-500 text-xs">{dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SalesPanel;
