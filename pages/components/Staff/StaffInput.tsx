import { useState } from 'react';

// Define the TypeScript interface for props
// `onSuccess` is a function that will be called after a successful staff registration
interface CreateStaffFormProps {
  onSuccess?: () => void; // Optional: This allows the parent component to refresh data after a new staff member is added
}

// Define the TypeScript interface for staff data
interface StaffData {
  staffName: string;  // Staff's full name
  storeName: string;  // Store assigned to the staff member
  location: string;   // Physical location of the store
  email: string;      // Staff's email address
  phone1: string;     // Primary contact number
  phone2: string;     // Optional secondary contact number
  password?: string;  // Password for authentication (optional here, but required for form submission)
}

export default function CreateStaffForm({ onSuccess }: CreateStaffFormProps) {
  // Control the visibility of the form
  const [showForm, setShowForm] = useState(false);

  // State to hold user input for staff data
  const [staffData, setStaffData] = useState<StaffData>({
    staffName: '',
    storeName: '',
    location: '',
    email: '',
    phone1: '',
    phone2: '',
  });

  // States for password and password confirmation fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State to manage error and success messages
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Loading state to disable the submit button while the request is being processed
  const [loading, setLoading] = useState<boolean>(false);

  // Function to update the state when an input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setStaffData({ ...staffData, [id]: value });
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form behavior (page refresh)
    
    // Reset previous error or success messages
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true); // Start loading state

    // Password validation: Check if password matches confirmPassword
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Email validation using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(staffData.email)) {
      setErrorMessage('Invalid email format.');
      setLoading(false);
      return;
    }

    // Phone number validation: Only digits and optional "+"
    const phoneRegex = /^[0-9+]+$/;
    if (!phoneRegex.test(staffData.phone1) || (staffData.phone2 && !phoneRegex.test(staffData.phone2))) {
      setErrorMessage('Invalid phone number format. Use digits and optional "+".');
      setLoading(false);
      return;
    }

    try {
      // Send a POST request to the API to save staff data
      const response = await fetch('/api/staff/staff-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...staffData, password }),
      });

      // Parse the JSON response
      const data = await response.json();

      if (response.ok) {
        // Success: Show success message and reset form fields
        setSuccessMessage('Staff member added successfully.');
        setStaffData({ staffName: '', storeName: '', location: '', email: '', phone1: '', phone2: '' });
        setPassword('');
        setConfirmPassword('');
        setShowForm(false); // Hide form after successful submission

        // Call the `onSuccess` function (if provided) to refresh the staff table
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // If the server returns an error, show it
        setErrorMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      // Catch unexpected errors and display an error message
      console.error('Form submission error:', error);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="p-3">
      {/* Header Panel with "Staff Management" heading and "+ Add Staff" button */}
      <div className="flex items-center justify-between border border-gray-300 p-4 rounded-md mb-4">
        {/* Page Heading */}
        <h2 className="text-2xl font-bold">Staff Management</h2>
        {/* Show the "+ Add Staff" button only when the form is hidden */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Add Staff
          </button>
        )}
      </div>


      {/* Staff Form wrapped in a bordered container */}
      {showForm && (
        
        <div className="border border-gray-300 p-4 rounded-md mb-4">
            {/* Display an error message if one exists */}
            {errorMessage && (
               <div className="mb-5 p-3 rounded text-sm text-red-800 bg-red-100 border border-red-400">
                 {errorMessage}
               </div>
           )}
          <form onSubmit={handleSubmit}>
            {/* Grid layout for the form fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Staff Name Field */}
              <div>
                <label htmlFor="staffName" className="block text-sm font-medium text-gray-900">
                  Staff Name
                </label>
                <div className="mt-2">
                  <input
                    id="staffName"
                    type="text"
                    value={staffData.staffName}
                    onChange={handleChange}
                    placeholder="Staff Name"
                    className="block w-full p-3 text-sm border rounded-md placeholder:text-gray-400 focus:outline-indigo-600"
                    required
                  />
                </div>
              </div>
              {/* Store Name Field */}
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-900">
                  Store Name
                </label>
                <div className="mt-2">
                  <input
                    id="storeName"
                    type="text"
                    value={staffData.storeName}
                    onChange={handleChange}
                    placeholder="Store Name"
                    className="block w-full p-3 text-sm border rounded-md placeholder:text-gray-400 focus:outline-indigo-600"
                    required
                  />
                </div>
              </div>
              {/* Location Field */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-900">
                  Location
                </label>
                <div className="mt-2">
                  <input
                    id="location"
                    type="text"
                    value={staffData.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="block w-full p-3 text-sm border rounded-md placeholder:text-gray-400 focus:outline-indigo-600"
                    required
                  />
                </div>
              </div>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    type="email"
                    value={staffData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="block w-full p-3 text-sm border rounded-md placeholder:text-gray-400 focus:outline-indigo-600"
                    required
                  />
                </div>
              </div>
              {/* Phone 1 Field */}
              <div>
                <label htmlFor="phone1" className="block text-sm font-medium text-gray-900">
                  Phone 1
                </label>
                <div className="mt-2">
                  <input
                    id="phone1"
                    type="text"
                    value={staffData.phone1}
                    onChange={handleChange}
                    placeholder="Phone Number 1"
                    className="block w-full p-3 text-sm border rounded-md placeholder:text-gray-400 focus:outline-indigo-600"
                    required
                  />
                </div>
              </div>
              {/* Phone 2 Field (Optional) */}
              <div>
                <label htmlFor="phone2" className="block text-sm font-medium text-gray-900">
                  Phone 2 (Optional)
                </label>
                <div className="mt-2">
                  <input
                    id="phone2"
                    type="text"
                    value={staffData.phone2}
                    onChange={handleChange}
                    placeholder="Phone Number 2"
                    className="block w-full p-3 text-sm border rounded-md placeholder:text-gray-400 focus:outline-indigo-600"
                  />
                </div>
              </div>
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="block w-full p-3 text-sm border rounded-md placeholder:text-gray-400 focus:outline-indigo-600"
                    required
                  />
                </div>
              </div>
              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                  Confirm Password
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="block w-full p-3 text-sm border rounded-md placeholder:text-gray-400 focus:outline-indigo-600"
                    required
                  />
                </div>
              </div>
            </div>
            {/* Action Buttons for the Form */}
            <div className="flex justify-end mt-6 space-x-4">
              {/* Save Button */}
              <button
                type="submit"
                className={`bg-blue-600 text-white px-6 py-3 rounded-md ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              {/* Cancel Button to hide the form */}
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success Modal Message Box */}
      {successMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            {/* Modal Header */}
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              You have successfully entered a staff member
            </h2>
            {/* Modal Content displaying the success message */}
            <p className="text-gray-600 mb-6">{successMessage}</p>
            {/* Button to close the modal */}
            <div className="flex justify-end">
              <button
                onClick={() => setSuccessMessage('')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
