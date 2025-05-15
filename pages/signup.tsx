import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

const Signup = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    customerName: "",
    staffName: "",
    storeName: "",
    location: "",
    email: "",
    phone1: "",
    phone2: "",
    password: "",
    role: "ADMIN",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "role") {
      // Reset unnecessary fields when role changes
      setFormData((prev) => ({
        ...prev,
        role: value,
        customerName: "",
        staffName: "",
        storeName: "",
        location: "",
        phone1: "",
        phone2: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        const role = data.user.role;
        if (role === "SUPERADMIN") router.push("/users/superadmin/dashboard");
        else if (role === "ADMIN") router.push("/users/admin/dashboard");
        else if (role === "STAFF") router.push("/users/staff/dashboard");
        else setError("Unknown role. Cannot redirect.");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Sign Up to JAPAMA Pharmacy
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full mb-3 px-4 py-2 border rounded"
        >
          <option value="ADMIN">Admin</option>
          <option value="STAFF">Staff</option>
          <option value="SUPERADMIN">Super Admin</option>
        </select>

        {formData.role === "ADMIN" && (
          <>
            <input
              type="text"
              name="customerName"
              placeholder="Customer Name"
              value={formData.customerName}
              onChange={handleChange}
              required
              className="w-full mb-3 px-4 py-2 border rounded"
            />
            <input
              type="text"
              name="storeName"
              placeholder="Unique Store Name"
              value={formData.storeName}
              onChange={handleChange}
              required
              className="w-full mb-3 px-4 py-2 border rounded"
            />
            <input
              type="text"
              name="location"
              placeholder="Store Location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full mb-3 px-4 py-2 border rounded"
            />
          </>
        )}

        {formData.role === "STAFF" && (
          <>
            <input
              type="text"
              name="staffName"
              placeholder="Staff Name"
              value={formData.staffName}
              onChange={handleChange}
              required
              className="w-full mb-3 px-4 py-2 border rounded"
            />
            <input
              type="text"
              name="storeName"
              placeholder="Existing Store Name"
              value={formData.storeName}
              onChange={handleChange}
              required
              className="w-full mb-3 px-4 py-2 border rounded"
            />
            <input
              type="text"
              name="location"
              placeholder="Store Location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full mb-3 px-4 py-2 border rounded"
            />
          </>
        )}

        {formData.role !== "SUPERADMIN" && (
          <>
            <input
              type="text"
              name="phone1"
              placeholder="Primary Phone"
              value={formData.phone1}
              onChange={handleChange}
              required
              className="w-full mb-3 px-4 py-2 border rounded"
            />
            <input
              type="text"
              name="phone2"
              placeholder="Secondary Phone (optional)"
              value={formData.phone2}
              onChange={handleChange}
              className="w-full mb-3 px-4 py-2 border rounded"
            />
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full mb-3 px-4 py-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full mb-4 px-4 py-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
