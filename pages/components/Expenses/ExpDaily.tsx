import { useEffect, useState } from 'react';
import { format, parseISO } from "date-fns";

interface DailyTotal {
  date: string;
  total: number;
  expenses?: Expense[];
}

interface Expense {
  id: number;
  exp: string;
  value: number;
  createdAt: string;
}

export default function DailyExpensesDisplay() {
  const [totalExpenses, setTotalExpenses] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyExpenses = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/expenses/daily-total');
        if (response.ok) {
          const data: DailyTotal[] = await response.json();
          const sortedData = data.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
          setTotalExpenses(sortedData);
        } else {
          setError('Failed to load daily expenses.');
        }
      } catch (err) {
        console.error('Error fetching daily expenses:', err);
        setError('An error occurred while fetching daily expenses.');
      } finally {
        setLoading(false);
      }
    };

    fetchDailyExpenses();
  }, []);

  const formatDate = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const togglePanel = (date: string) => {
    setExpandedPanel(expandedPanel === date ? null : date);
  };

  return (
    <div className="m-6 border border-gray-300 ">
      <h1 className="text-2xl font-bold p-4">Daily Expenses</h1>

      {error && (
         <div className="border border-gray-300 fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setError(null)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        totalExpenses.map((dayExpenses, index) => (
          <div key={index} className="p-4">
            <h3 className="text-lg font-semibold">
              Expenses for {formatDate(new Date(dayExpenses.date))}
            </h3>
            <p className="text-xl font-bold">{dayExpenses.total.toLocaleString()} Tsh</p>

            <button
              onClick={() => togglePanel(dayExpenses.date)}
              className="mt-2 text-blue-500"
            >
              {expandedPanel === dayExpenses.date ? "Hide Expenses" : "View Expenses"}
            </button>

            {expandedPanel === dayExpenses.date && (
              <div className="mt-4 overflow-auto max-h-[400px] border border-gray-300">
                <table className="min-w-full table-auto border-collapse">
                 <thead className="bg-gray-100 sticky top-0 z-10 border-b">
                   <tr className="text-blue-600">
                    <th className="p-4 border-b">Expense ID</th>
                    <th className="p-4 border-b">Expense Name</th>
                    <th className="p-4 border-b">Value</th>
                    <th className="p-4 border-b">Created At</th>
                   </tr>
                 </thead>
                 <tbody>
               {dayExpenses.expenses?.map((expense) => (
              <tr key={expense.id} className="text-center hover:bg-gray-50">
               <td className="p-4">{expense.id}</td>
               <td className="p-4">{expense.exp}</td>
               <td className="p-4">{expense.value.toLocaleString()} Tsh</td>
               <td className="p-4">{new Date(expense.createdAt).toLocaleString()}</td>
             </tr>
               ))}
              </tbody>
              </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}