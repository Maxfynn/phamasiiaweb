// pages/drugstore/edit/[id].tsx
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";

interface FormData {
  type: string;
  stockType: string;
  amount: string;
  name: string;
  brand: string;
  manufacturedDate: string;
  expireDate: string;
  purchasePrice: string;
  salesPrice: string;
  location: string;
  storeId: string;
}

export default function EditDrugstoreItem() {
  const [formData, setFormData] = useState<FormData>({
    type: "",
    stockType: "",
    amount: "",
    name: "",
    brand: "",
    manufacturedDate: "",
    expireDate: "",
    purchasePrice: "",
    salesPrice: "",
    location: "",
    storeId: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  // Fetch user role from session
  const getUserRole = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return null;
      const data = await res.json();
      return data?.user?.role || null; // Adjust if your API returns a different structure
    } catch (err) {
      console.error("Failed to fetch user role:", err);
      return null;
    }
  };

  // Load drugstore item data
  useEffect(() => {
    if (id) {
      fetch(`/api/drugstore/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setFormData({
              type: data.type || "",
              stockType: data.stockType || "",
              amount: data.amount?.toString() || "",
              name: data.name || "",
              brand: data.brand || "",
              manufacturedDate: data.manufacturedDate || "",
              expireDate: data.expireDate || "",
              purchasePrice: data.purchasePrice?.toString() || "",
              salesPrice: data.salesPrice?.toString() || "",
              location: data.location || "",
              storeId: data.storeId?.toString() || "",
            });
          }
        })
        .catch(() => setErrorMessage("Failed to load drugstore item."));
    }
  }, [id]);

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    for (const key in formData) {
      if (!formData[key as keyof FormData]) {
        setErrorMessage("Please fill in all required fields.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/drugstore/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          purchasePrice: parseFloat(formData.purchasePrice),
          salesPrice: parseFloat(formData.salesPrice),
          storeId: parseInt(formData.storeId, 10),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update item.");
      } else {
        setSuccessMessage("Drugstore item updated successfully!");

        // Redirect based on user role
        const role = await getUserRole();

        switch (role) {
          case "ADMIN":
            router.push("/users/admin/dashboard");
            break;
          case "SUPERADMIN":
            router.push("/users/superadmin/dashboard");
            break;
          case "STAFF":
            router.push("/users/staff/dashboard");
            break;
          default:
            router.push("/dashboard");
            break;
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <h1 className="text-2xl font-bold mb-4">Edit Drugstore Item</h1>

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className={key === "location" || key === "storeId" ? "col-span-2" : ""}>
            <label className="block text-gray-700 capitalize">{key.replace(/([A-Z])/g, " $1")}:</label>
            <input
              type={
                key.toLowerCase().includes("date")
                  ? "date"
                  : key === "amount" || key.includes("Price") || key === "storeId"
                  ? "number"
                  : "text"
              }
              name={key}
              value={value}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              placeholder={`Enter ${key}`}
              step="any"
            />
          </div>
        ))}

        <div className="col-span-2 flex justify-end gap-4 mt-4">
          <button
            type="reset"
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            onClick={() =>
              setFormData({
                type: "",
                stockType: "",
                amount: "",
                name: "",
                brand: "",
                manufacturedDate: "",
                expireDate: "",
                purchasePrice: "",
                salesPrice: "",
                location: "",
                storeId: "",
              })
            }
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
