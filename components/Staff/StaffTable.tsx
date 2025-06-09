import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

// TypeScript interface for a staff record
interface Staff {
  id: number;
  staffName: string;
  storeName: string;
  location: string;
  email: string;
  phone1: string;
  phone2: string | null;
  password: string;
  createdAt: string;
}

const StaffManager = () => {
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  const [deletedStaffName, setDeletedStaffName] = useState("");
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Staff>>({});
  const [showEditMessage, setShowEditMessage] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch("/api/staff/staff-table");
        const data = await response.json();
        setStaffData(data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };

    fetchStaff();
  }, []);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = staffData.filter((staff) => {
    const term = searchTerm.toLowerCase();
    return (
      staff.staffName.toLowerCase().includes(term) ||
      staff.storeName.toLowerCase().includes(term) ||
      staff.email.toLowerCase().includes(term)
    );
  });

  // Open Delete Modal
  const openDeleteModal = (staff: Staff) => {
    setStaffToDelete(staff);
    setShowDeleteModal(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!staffToDelete) return;

    try {
      const response = await fetch(`/api/staff/delete/${staffToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStaffData((prev) => prev.filter((staff) => staff.id !== staffToDelete.id));
        setDeletedStaffName(staffToDelete.staffName);
        setShowDeleteMessage(true);
      } else {
        console.error("Failed to delete staff member");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
    } finally {
      setShowDeleteModal(false);
      setStaffToDelete(null);
    }
  };

  // Open edit form with selected staff data
  const openEditForm = (staff: Staff) => {
    setEditingStaff(staff);
    setEditFormData({ ...staff });
  };

  // Handle changes in edit form fields
  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit the edited form
  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    try {
      const response = await fetch(`/api/staff/update/${editingStaff.id}`, {
        method: "PUT", // or PATCH, depending on your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        // Update the local staff data array
        setStaffData((prev) =>
          prev.map((staff) =>
            staff.id === editingStaff.id ? { ...staff, ...editFormData } as Staff : staff
          )
        );
        setShowEditMessage(true);
      } else {
        console.error("Failed to update staff information");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
    } finally {
      setEditingStaff(null);
      setEditFormData({});
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingStaff(null);
    setEditFormData({});
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 pl-2">Staff List</h2>

      {/* If editingStaff exists, show the edit form instead of the table */}
      {editingStaff ? (
        <form onSubmit={handleEditSubmit} className="bg-white rounded-lg shadow-md border p-3">
          <h3 className="text-xl font-semibold mb-4">Edit Staff Information</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="mb-4">
            <label className="block text-gray-700">Staff Name:</label>
            <input
              id="staffName"
              type="text"
              name="staffName"
              value={editFormData.staffName || ""}
              placeholder="Staff Name"
              onChange={handleEditChange}
              className="w-full p-2 border rounded focus:outline-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Store Name:</label>
            <input
              type="text"
              name="storeName"
              id="storeName"
              placeholder="Store Name"
              value={editFormData.storeName || ""}
              onChange={handleEditChange}
              className="w-full p-2 border rounded focus:outline-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Location:</label>
            <input
              type="text"
              name="location"
              id="location"
              placeholder="......"
              value={editFormData.location || ""}
              onChange={handleEditChange}
              className="w-full p-2 border rounded focus:outline-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="johndoe@mail.com"
              value={editFormData.email || ""}
              onChange={handleEditChange}
              className="w-full p-2 border rounded focus:outline-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone 1:</label>
            <input
              type="text"
              name="phone1"
              id="phone1"
              placeholder="000000"
              value={editFormData.phone1 || ""}
              onChange={handleEditChange}
              className="w-full p-2 border rounded focus:outline-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone 2:</label>
            <input
              type="text"
              id="phone2"
              placeholder="000000"
              name="phone2"
              value={editFormData.phone2 || ""}
              onChange={handleEditChange}
              className="w-full p-2 border rounded focus:outline-blue-500"
            />
          </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by Staff Name, Store Name, or Email..."
            value={searchTerm}
            onChange={handleSearch}
            className="p-2 border border-gray-500 rounded mb-4 w-full focus:border-blue-900 focus:outline-none"
          />

          {/* Staff Table */}
          <div className="rounded-lg border shadow overflow-hidden">
            <div className="overflow-y-auto max-h-96 border-b border-gray-300">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10 border-b">
                  <tr className="text-blue-600">
                    <th className="p-4 border-b">Staff Name</th>
                    <th className="p-4 border-b">Store Name</th>
                    <th className="p-4 border-b">Location</th>
                    <th className="p-4 border-b">Email</th>
                    <th className="p-4 border-b">Phone 1</th>
                    <th className="p-4 border-b">Phone 2</th>
                    <th className="p-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((staff) => (
                      <tr key={staff.id} className="text-center hover:bg-gray-50">
                        <td className="p-4">{staff.staffName}</td>
                        <td className="p-4">{staff.storeName}</td>
                        <td className="p-4">{staff.location}</td>
                        <td className="p-4">{staff.email}</td>
                        <td className="p-4">{staff.phone1}</td>
                        <td className="p-4">{staff.phone2}</td>
                        <td className="p-4 flex justify-center gap-2">
                          <button
                            aria-label="Edit"
                            onClick={() => openEditForm(staff)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <FaEdit />
                          </button>
                          <button
                            aria-label="Delete"
                            onClick={() => openDeleteModal(staff)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center p-4">
                        No staff found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && staffToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Confirm Deletion</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <strong>{staffToDelete.staffName}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
              >
                No
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Message Box */}
      {showDeleteMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4 text-red-600">
              Staff Member Deleted
            </h2>
            <p className="text-gray-600 mb-6">
              {deletedStaffName} has been successfully removed.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteMessage(false)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Message Box */}
      {showEditMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              Staff Information Edited
            </h2>
            <p className="text-gray-600 mb-6">
              The staff information has been updated successfully.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowEditMessage(false)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManager;
