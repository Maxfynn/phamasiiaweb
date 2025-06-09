import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";

interface Drugstore {
  id: number;
  name: string;
  brand: string;
  type: string;
  stockType: string;
  amount: number;
  manufacturedDate: string;
  expireDate: string;
  purchasePrice: number;
  salesPrice: number;
  location: string;
  status: string;
}

export default function DrugsTable() {
  const [drugs, setDrugs] = useState<Drugstore[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/drugstore/storetable");
      const data = await res.json();
      setDrugs(data);
    } catch (err) {
      toast.error("Failed to load drug list.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/drugstore/deleteDrug?id=${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Drug deleted successfully.");
        fetchData();
      } else {
        toast.error("Failed to delete drug.");
      }
    } catch (err) {
      toast.error("Error deleting drug.");
    } finally {
      setShowModal(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Drugs Table</h2>
      <table className="min-w-full table-auto border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Brand</th>
            <th className="px-4 py-2 border">Type</th>
            <th className="px-4 py-2 border">Stock Type</th>
            <th className="px-4 py-2 border">Amount</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {drugs.map((drug) => (
            <tr key={drug.id} className="text-center">
              <td className="px-4 py-2 border">{drug.name}</td>
              <td className="px-4 py-2 border">{drug.brand}</td>
              <td className="px-4 py-2 border">{drug.type}</td>
              <td className="px-4 py-2 border">{drug.stockType}</td>
              <td className="px-4 py-2 border">{drug.amount}</td>
              <td className="px-4 py-2 border">{drug.status}</td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() =>
                    router.push(`/components/DrugStore/edit/${drug.id}`)
                  }
                  className="mr-2 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => confirmDelete(drug.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-md text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 text-red-600 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m0-4h.01M12 20h.01M4.293 6.293l1.414 1.414L12 2.414l6.293 6.293 1.414-1.414L12 0.586 4.293 6.293z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Delete Drug
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this drug? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
