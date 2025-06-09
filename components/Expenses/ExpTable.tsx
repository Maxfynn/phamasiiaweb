import { useEffect, useState } from 'react';
import { format } from "date-fns";
import { FaEdit, FaTrash } from "react-icons/fa";

// Define the type for an individual expense item.
type Expense = {
  id: number;
  exp: string;
  value: number;
  createdAt: string;
};

// Define the props interface for the ExpensesTable component.
interface ExpTableProps {
  reloadData: boolean; // Prop to trigger data reload when its value changes.
}

// ExpensesTable component to display a list of expenses.
export default function ExpensesTable({ reloadData }: ExpTableProps) {
  // State to store the fetched expenses data.
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // State to manage the loading state of the data fetching process.
  const [loading, setLoading] = useState(true);
  // State to store any error messages that occur during data fetching.
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch expenses data when the component mounts or reloadData changes.
  useEffect(() => {
    // Log the reloadData value for debugging purposes.
    console.log("Reloading table data. reloadData:", reloadData);

    // Async function to fetch expenses data from the API.
    const fetchExpenses = async () => {
      setLoading(true); // Set loading to true before fetching data.
      setError(null); // Clear any previous error messages.

      try {
        // Fetch data from the /api/expenses/expenses-table endpoint.
        const response = await fetch('/api/expenses/expenses-table');
        if (response.ok) {
          // Parse the JSON response.
          const data = await response.json();
          // Update the expenses state with the fetched data.
          setExpenses(data);
        } else {
          // Set error message if the response is not ok.
          setError("Failed to load expenses.");
        }
      } catch (err) {
        // Log and set error message if an error occurs during fetching.
        console.error('Error fetching expenses:', err);
        setError("An error occurred while fetching expenses.");
      } finally {
        // Set loading to false after fetching is complete (success or error).
        setLoading(false);
      }
    };

    // Call the fetchExpenses function.
    fetchExpenses();
    // Dependency array: useEffect runs when reloadData changes.
  }, [reloadData]);

  // Render loading message while data is being fetched.
  if (loading) return <div>Loading...</div>;
  // Render error message if an error occurred during data fetching.
  if (error) return <div className="text-red-600">{error}</div>;

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this expense?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted expense from state
        setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id));
      } else {
        setError('Failed to delete expense.');
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('An error occurred while deleting the expense.');
    }
  };

  // Render the expenses table.
  return (
    <div>
      <div className="border border-gray-300 overflow-auto m-6 bg-white rounded shadow-md max-h-[400px]">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10 border-b">
            <tr className="text-blue-600">
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Expense Name</th>
              <th className="p-4 border-b">Value</th>
              <th className="p-4 border-b">Created At</th>
              <th className="p-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Render expenses data if available, otherwise render a message. */}
            {expenses.length > 0 ? (
              expenses.map(expense => (
                <tr key={expense.id} className="text-center hover:bg-gray-50">
                  <td className="p-4">{expense.id}</td>
                  <td className="p-4">{expense.exp}</td>
                  <td className="p-4">{expense.value.toLocaleString()} TSH</td>
                  <td className="p-4">{format(new Date(expense.createdAt), 'yyyy-MM-dd')}</td>
                  <td className="p-4 flex justify-center gap-2">
                    {/* Edit button */}
                    <button aria-label="Edit Expense" title="Edit Expense" className="text-blue-500 hover:text-blue-700">
                      <FaEdit />
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(expense.id)}
                      aria-label="Delete Expense"
                      title="Delete Expense"
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              // Rendered when no expenses are found.
              <tr>
                <td colSpan={5} className="text-center p-4">No expenses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}