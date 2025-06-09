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

  // Editing state
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editDoseSold, setEditDoseSold] = useState<number>(0);
  const [editSellingPrice, setEditSellingPrice] = useState<number>(0);

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

  const fetchSales = async () => {
    try {
      const res = await fetch("/api/sales/sale");
      const data = await res.json();
      const formatted: SaleEntry[] = data.map((item: any) => ({
        id: String(item.id),
        store_id: item.drugstoreId,
        dose_sold: item.doseSold,
        selling_price: item.salesPrice,
        unit_cost_price: item.unitCostPrice,
        profit: item.profit,
        date_sold: item.createdAt || item.updatedAt || dayjs().format(),
      }));
      setSales(formatted);
    } catch (error) {
      console.error("Failed to fetch sales history:", error);
    }
  };

  useEffect(() => {
    fetchDrugs();
    fetchSales();
  }, []);

  const handleSale = async () => {
    const storeItem = store.find((item) => item.id === selectedDrugId);
    if (!storeItem) return alert("Drug not found");
    if (doseSold <= 0 || sellingPrice <= 0)
      return alert("Enter valid dose and price");
    if (storeItem.remaining_quantity < doseSold)
      return alert("Insufficient stock available");

    const cost = doseSold * storeItem.unit_cost_price;
    const profit = sellingPrice - cost;

    try {
      const res = await fetch("/api/sales/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drugstoreId: storeItem.id,
          doseSold,
          unitCostPrice: storeItem.unit_cost_price,
          salesPrice: sellingPrice,
          profit: parseFloat(profit.toFixed(2)),
          closed: false,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      const newHistory: HistoryEntry = {
        id: uuidv4(),
        action_type: "sale",
        drug_name: storeItem.drug_name,
        details: `Sold ${doseSold} ${storeItem.drug_name} ${storeItem.type.toLowerCase()}(s) for ${sellingPrice} TSH. Profit: ${profit.toFixed(2)} TSH.`,
        timestamp: dayjs().format(),
      };

      await fetchDrugs();
      await fetchSales();

      setHistory((prev) => [newHistory, ...prev]);
      setDoseSold(0);
      setSellingPrice(0);
      setSelectedDrugId(0);

      alert("Sale recorded and inventory updated!");
    } catch (error: any) {
      alert("Error: " + error.message);
      console.error("Sale submission error:", error);
    }
  };

  // Edit handlers
  const startEditing = (sale: SaleEntry) => {
    setEditingSaleId(sale.id);
    setEditDoseSold(sale.dose_sold);
    setEditSellingPrice(sale.selling_price);
  };

  const cancelEditing = () => {
    setEditingSaleId(null);
  };

  const saveEditing = async (sale: SaleEntry) => {
    if (editDoseSold <= 0 || editSellingPrice <= 0) {
      alert("Enter valid dose and price");
      return;
    }

    const storeItem = store.find((item) => item.id === sale.store_id);
    if (!storeItem) {
      alert("Drug not found");
      return;
    }
    if (storeItem.remaining_quantity + sale.dose_sold < editDoseSold) {
      alert("Insufficient stock available for this edit");
      return;
    }

    const cost = editDoseSold * sale.unit_cost_price;
    const profit = editSellingPrice - cost;

    try {
      const res = await fetch(`/api/sales/sale`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sale.id,
          drugstoreId: sale.store_id,
          doseSold: editDoseSold,
          unitCostPrice: sale.unit_cost_price,
          salesPrice: editSellingPrice,
          profit: parseFloat(profit.toFixed(2)),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update sale");
      }

      await fetchDrugs();
      await fetchSales();

      const newHistory: HistoryEntry = {
        id: uuidv4(),
        action_type: "sale",
        drug_name: storeItem.drug_name,
        details: `Edited sale of ${storeItem.drug_name}: Dose Sold ${sale.dose_sold} -> ${editDoseSold}, Selling Price ${sale.selling_price.toFixed(
          2
        )} -> ${editSellingPrice.toFixed(2)}, Profit updated.`,
        timestamp: dayjs().format(),
      };
      setHistory((prev) => [newHistory, ...prev]);

      setEditingSaleId(null);
      alert("Sale updated successfully!");
    } catch (error: any) {
      alert("Error: " + error.message);
      console.error("Sale update error:", error);
    }
  };

  const handleDelete = async (saleId: string) => {
    const confirmed = confirm("Are you sure you want to delete this sale?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/sales/sale`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: saleId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete sale");
      }

      await fetchDrugs();
      await fetchSales();

      const deletedSale = sales.find(s => s.id === saleId);
      if (deletedSale) {
        const storeItem = store.find(item => item.id === deletedSale.store_id);
        const newHistory: HistoryEntry = {
          id: uuidv4(),
          action_type: "sale",
          drug_name: storeItem?.drug_name || "Unknown",
          details: `Deleted sale of ${storeItem?.drug_name || "Unknown"}: ${deletedSale.dose_sold} doses, ${deletedSale.selling_price.toFixed(2)} TSH.`,
          timestamp: dayjs().format(),
        };
        setHistory((prev) => [newHistory, ...prev]);
      }

      alert(`Sale deleted successfully!`);
    } catch (error: any) {
      alert("Error: " + error.message);
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold">Drug Sales Panel</h2>

      {/* Inventory Table */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Available Inventory</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-2 py-1">Drug Name</th>
              <th className="border border-gray-300 px-2 py-1">Type</th>
              <th className="border border-gray-300 px-2 py-1">Dose Quantity</th>
              <th className="border border-gray-300 px-2 py-1">Purchase Price</th>
              <th className="border border-gray-300 px-2 py-1">Unit Cost Price</th>
              <th className="border border-gray-300 px-2 py-1">Remaining Quantity</th>
              <th className="border border-gray-300 px-2 py-1">Date Entered</th>
            </tr>
          </thead>
          <tbody>
            {store.map((drug) => (
              <tr key={drug.id}>
                <td className="border border-gray-300 px-2 py-1">{drug.drug_name}</td>
                <td className="border border-gray-300 px-2 py-1">{drug.type}</td>
                <td className="border border-gray-300 px-2 py-1">{drug.dose_quantity}</td>
                <td className="border border-gray-300 px-2 py-1">{drug.purchase_price.toFixed(2)}</td>
                <td className="border border-gray-300 px-2 py-1">{drug.unit_cost_price.toFixed(2)}</td>
                <td className="border border-gray-300 px-2 py-1">{drug.remaining_quantity}</td>
                <td className="border border-gray-300 px-2 py-1">{dayjs(drug.date_entered).format("YYYY-MM-DD")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Sale Form */}
      <section className="pt-4">
        <h3 className="text-xl font-semibold mb-2">Make a Sale</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSale();
          }}
          className="flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <select
            name="drugSelect"
            className="border px-2 py-1"
            value={selectedDrugId}
            onChange={(e) => setSelectedDrugId(Number(e.target.value))}
          >
            <option value={0}>Select Drug</option>
            {store.map((drug) => (
              <option key={drug.id} value={drug.id}>
                {drug.drug_name} ({drug.type})
              </option>
            ))}
          </select>
          <input
            name="doseSold"
            type="number"
            className="border px-2 py-1"
            placeholder="Dose Sold"
            value={doseSold}
            onChange={(e) => setDoseSold(Number(e.target.value))}
            min={1}
          />
          <input
            name="sellingPrice"
            type="number"
            className="border px-2 py-1"
            placeholder="Selling Price"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Number(e.target.value))}
            min={0.01}
            step={0.01}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Submit Sale
          </button>
        </form>
      </section>

      {/* Sales History Table */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Sales History</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-2 py-1">Drug Name</th>
              <th className="border border-gray-300 px-2 py-1">Dose Sold</th>
              <th className="border border-gray-300 px-2 py-1">Selling Price</th>
              <th className="border border-gray-300 px-2 py-1">Profit</th>
              <th className="border border-gray-300 px-2 py-1">Date Sold</th>
              <th className="border border-gray-300 px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const storeItem = store.find((item) => item.id === sale.store_id);
              if (!storeItem) return null;

              if (editingSaleId === sale.id) {
                return (
                  <tr key={sale.id} className="bg-yellow-50">
                    <td className="border border-gray-300 px-2 py-1">{storeItem.drug_name}</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        className="border px-1 py-0.5 w-20"
                        value={editDoseSold}
                        onChange={(e) => setEditDoseSold(Number(e.target.value))}
                        min={1}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        className="border px-1 py-0.5 w-24"
                        value={editSellingPrice}
                        onChange={(e) => setEditSellingPrice(Number(e.target.value))}
                        min={0.01}
                        step={0.01}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {(editSellingPrice - (editDoseSold * sale.unit_cost_price)).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">{dayjs(sale.date_sold).format("YYYY-MM-DD")}</td>
                    <td className="border border-gray-300 px-2 py-1 space-x-2">
                      <button
                        onClick={() => saveEditing(sale)}
                        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={sale.id}>
                  <td className="border border-gray-300 px-2 py-1">{storeItem.drug_name}</td>
                  <td className="border border-gray-300 px-2 py-1">{sale.dose_sold}</td>
                  <td className="border border-gray-300 px-2 py-1">{sale.selling_price.toFixed(2)}</td>
                  <td className="border border-gray-300 px-2 py-1">{sale.profit.toFixed(2)}</td>
                  <td className="border border-gray-300 px-2 py-1">{dayjs(sale.date_sold).format("YYYY-MM-DD")}</td>
                  <td className="border border-gray-300 px-2 py-1 flex gap-2">
                    <button
                      onClick={() => startEditing(sale)}
                      title="Edit Sale"
                      className="hover:text-blue-700"
                      aria-label="Edit sale"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 17h2m2.5-9.5L9 14l-2.5 2.5a1 1 0 01-1.414-1.414L9 12l4.5-4.5a1.5 1.5 0 012.121 0z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDelete(sale.id)}
                      title="Delete Sale"
                      className="hover:text-red-700"
                      aria-label="Delete sale"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* History Section */}
      <section>
        <h3 className="text-xl font-semibold mb-2">History Log</h3>
        <ul className="list-disc pl-5 space-y-1 max-h-60 overflow-y-auto border p-3 bg-gray-50 rounded">
          {history.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.action_type.toUpperCase()}</strong>: {entry.details} —{" "}
              <em>{dayjs(entry.timestamp).format("YYYY-MM-DD HH:mm:ss")}</em>
            </li>
          ))}
          {history.length === 0 && <li>No history entries yet.</li>}
        </ul>
      </section>
    </div>
  );
};

export default SalesPanel;