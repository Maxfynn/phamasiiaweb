'use client';

import { useEffect, useState } from 'react';

interface Store {
  id: string;
  name: string;
  location: string;
  customerName: string;
  phone: string;
}

export default function StoreTable() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    customerName: '',
    phone: '',
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/Stores/Store-table');
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error('API did not return an array.');

      setStores(data);
    } catch (err) {
      console.error('Failed to fetch store data:', err);
      setError('Failed to load store data.');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/Stores/delete?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setStores(stores.filter((store) => store.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const openEdit = (store: Store) => {
    setEditingStore(store);
    setEditForm({
      name: store.name,
      location: store.location,
      customerName: store.customerName,
      phone: store.phone,
    });
  };

  const handleEditSubmit = async () => {
    if (!editingStore) return;

    try {
      const res = await fetch(`/api/Stores/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStore.id,
          name: editForm.name,
          location: editForm.location,
          customerName: editForm.customerName,
          phone: editForm.phone,
        }),
      });

      if (!res.ok) throw new Error('Update failed');
      const updatedStore = await res.json();

      setStores((prev) =>
        prev.map((store) => (store.id === updatedStore.id ? updatedStore : store))
      );

      setEditingStore(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) return <div className="p-6">Loading stores...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">All Stores</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left border-b">
            <th className="p-3">Store Name</th>
            <th className="p-3">Location</th>
            <th className="p-3">Customer Name</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id} className="border-t">
              <td className="p-3">{store.name}</td>
              <td className="p-3">{store.location}</td>
              <td className="p-3">{store.customerName}</td>
              <td className="p-3">{store.phone}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => openEdit(store)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(store.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingStore && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Store</h3>
            <div className="mb-4">
              <label className="block text-sm mb-1">Store Name:</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Location:</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Customer Name:</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={editForm.customerName}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, customerName: e.target.value }))
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Phone Number:</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingStore(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
