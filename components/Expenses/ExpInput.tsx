import { useState, useEffect } from 'react'; // Importing useState and useEffect hooks from React.

interface ExpenseInputProps {
    onDataAdded: () => void;
  }
  

export default function ExpenseInput({ onDataAdded }: ExpenseInputProps) {
  // Define state variables for the expense name, value, success message, error message.
  const [exp, setExp] = useState(''); // State to store the name of the expense.
  const [value, setValue] = useState(''); // State to store the value of the expense.
  const [message, setMessage] = useState<string | null>(null); // State to display a success message after adding an expense.
  const [error, setError] = useState<string | null>(null); // State to display error messages in case of failures.

  // Function to handle form submission.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior (e.g., page refresh).
    setMessage(null); // Clear any previous success messages.
    setError(null); // Clear any previous error messages.

    try {
      // Make a POST request to the `/api/expenses` endpoint with the expense data.
      const response = await fetch('/api/expenses/expenses-input', {
        method: 'POST', // HTTP method for creating a new resource.
        headers: { 'Content-Type': 'application/json' }, // Set content type to JSON.
        body: JSON.stringify({ exp, value: parseInt(value, 10) }), // Send expense name and value in the request body.
      });

      if (response.ok) {
        // If the request was successful:
        setExp(''); // Clear the expense name input field.
        setValue(''); // Clear the expense value input field.
        setMessage('Expense added successfully!'); // Display a success message.
        console.log('Expense added. Notifying parent...');
        onDataAdded();
      } else {
        // If the request failed, extract error details from the response.
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add expense.'); // Show the error message.
      }
    } catch (err) {
      // Handle any network or unexpected errors.
      console.error('Error adding expense:', err); // Log the error for debugging.
      setError('An error occurred while adding the expense.'); // Display a generic error message.
    }
  };

  // useEffect hook to clear the success message after 3 seconds.
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000); // 3000 milliseconds = 3 seconds
      return () => clearTimeout(timer); // Cleanup function to clear the timeout.
    }
  }, [message]);

  // useEffect hook to clear the error message after 3 seconds.
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000); // 3000 milliseconds = 3 seconds
      return () => clearTimeout(timer); // Cleanup function to clear the timeout.
    }
  }, [error]);

  // JSX structure to render the UI.
  return (
    <div className="p-6 ">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6 py-5 max-w-full mx-auto bg-white rounded border border-gray-300">
        <div className="text-gray-800 text-lg font-semibold pl-6">
          Add Expense
        </div>
      </div>

      {/* Form for adding expenses */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-full mx-auto p-6 bg-white rounded border border-gray-300"
      >
        <div className="flex flex-wrap items-center space-y-4 md:space-y-0 md:space-x-4 border-gray-300">
          <div className="flex flex-col w-full md:w-2/5">
            <label
              htmlFor="expense-name"
              className="text-gray-700 font-medium mb-2"
            >
              Expense Name
            </label>
            <input
              id="expense-name"
              type="text"
              value={exp}
              onChange={(e) => setExp(e.target.value)}
              placeholder="Enter expense name"
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col w-full md:w-2/5">
            <label
              htmlFor="expense-value"
              className="text-gray-700 font-medium mb-2"
            >
              Value
            </label>
            <input
              id="expense-value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter expense value"
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col items-center pt-8 max-w-full">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto max-w-xs md:max-w-none"
              type="submit"
            >
              + Add Expense
            </button>
          </div>
        </div>

        {message && (
          <div
            className="mt-4 text-center text-green-600 bg-green-100 p-3 rounded-md"
            role="alert"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md"
            role="alert"
          >
            {error}
          </div>
        )}
      </form>
    </div>
  );
}