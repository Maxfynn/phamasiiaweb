import { useState } from 'react';
import { useRouter } from 'next/router';
import { PrismaClient } from '@prisma/client';
import { GetServerSidePropsContext } from 'next';

// Define the interface for staff data structure
interface StaffData {
  staffName: string;
  storeName: string;
  location: string;
  email: string;
  phone1: string;
  phone2: string;
}

interface EditStaffFormProps {
  initialStaffData: StaffData;
  staffId: number;
}

export default function EditStaffForm({ initialStaffData, staffId }: EditStaffFormProps) {
  // Initialize the form state with the initial data passed as props
  const [staffData, setStaffData] = useState<StaffData>(initialStaffData);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle input changes and update corresponding staff data fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setStaffData({ ...staffData, [id]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true); // Start loading state

    // Validate that passwords match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Send PUT request to API to update the staff data
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...staffData, // Send the staff data from the form
          password, // Send the new password (if provided)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // On success, display success message and redirect
        setSuccessMessage(data.message);
        router.push('/staff'); // Redirect to the staff list or another page
      } else {
        // If there was an error, show the error message
        setErrorMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      // Catch any unexpected errors
      console.error('Form submission error:', error);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      // Stop the loading state
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Edit Staff Member</h1>

      {/* Display error messages if any */}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {/* Display success messages if any */}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      {/* Form to edit staff member data */}
      <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded bg-white">
        {/* Staff Name */}
        <input
          id="staffName"
          type="text"
          value={staffData.staffName}
          onChange={handleChange}
          placeholder="Staff Name"
          required
          className="block w-full mb-2 p-2 border rounded"
        />

        {/* Store Name */}
        <input
          id="storeName"
          type="text"
          value={staffData.storeName}
          onChange={handleChange}
          placeholder="Store Name"
          required
          className="block w-full mb-2 p-2 border rounded"
        />

        {/* Location */}
        <input
          id="location"
          type="text"
          value={staffData.location}
          onChange={handleChange}
          placeholder="Location"
          required
          className="block w-full mb-2 p-2 border rounded"
        />

        {/* Email */}
        <input
          id="email"
          type="email"
          value={staffData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="block w-full mb-2 p-2 border rounded"
        />

        {/* Phone 1 */}
        <input
          id="phone1"
          type="text"
          value={staffData.phone1}
          onChange={handleChange}
          placeholder="Phone 1"
          required
          className="block w-full mb-2 p-2 border rounded"
        />

        {/* Phone 2 (optional) */}
        <input
          id="phone2"
          type="text"
          value={staffData.phone2}
          onChange={handleChange}
          placeholder="Phone 2 (optional)"
          className="block w-full mb-2 p-2 border rounded"
        />

        {/* Password */}
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password (leave blank to keep current)"
          className="block w-full mb-2 p-2 border rounded"
        />

        {/* Confirm Password */}
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm New Password"
          className="block w-full mb-2 p-2 border rounded"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-500 text-white'}`}
        >
          {loading ? 'Updating...' : 'Update Staff'}
        </button>
      </form>
    </div>
  );
}

// Fetch staff data from the database for server-side rendering (SSR)
export async function getServerSideProps(context: GetServerSidePropsContext) {
    const staffId = parseInt(context.query.id as string, 10); // Safely type `context.query.id` as string
    const prisma = new PrismaClient();
  
    try {
      // Fetch the staff member from the database
      const staff = await prisma.staff.findUnique({ where: { id: staffId } });
      prisma.$disconnect();
  
      // If staff is not found, redirect to 404 page
      if (!staff) {
        return {
          notFound: true,
        };
      }
  
      // Return the staff data and staff ID as props
      return {
        props: {
          initialStaffData: JSON.parse(JSON.stringify(staff)), // Deep clone the data
          staffId: staffId,
        },
      };
    } catch (error) {
      console.error('Error fetching staff:', error);
      return { notFound: true }; // Return 404 if there was an error fetching the data
    }
  }