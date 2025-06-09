import { ArrowUpRight, ArrowDownRight, DollarSign, Calendar } from "lucide-react"; // Importing icons for visual indicators and card headers
import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';

// Interface for the StatCard component's props
interface StatCardProps {
  title: string;           // Title of the statistic card
  value: string;           // Current value of the statistic
  previousValue: string;   // Previous value of the statistic for comparison
  change: string;          // Percentage change between current and previous values
  isPositive: boolean;     // Indicates if the change is positive or negative
  dateLabel: string;       // Label indicating the date or month for the statistic
  icon: React.ReactNode;   // Icon to display on the card
}

// Type definition for an expense item
type Expense = {
  id: number;
  exp: string;
  value: number;
  createdAt: string;
};

// Type definition for daily total expenses data
type DailyTotal = {
  date: string;
  total: number;
  expenses?: Expense[];
};

// Type definition for monthly total expenses data
type MonthlyTotal = {
  month: string;
  total: number;
  expenses?: Expense[];
};

// StatCard component: Displays a statistic card with an icon, title, value, change, and date label
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  previousValue,
  change,
  isPositive,
  dateLabel,
  icon,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <div className="flex items-center mb-2">
        <div className="mr-2 text-blue-600">
          {icon}
        </div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-blue-600">{value} Tsh</p>
      <p className="text-gray-400 text-sm">Compared to {previousValue} Tsh</p>
      <div className="flex items-center mt-2">
        <span
          className={`${
            isPositive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          } text-xs font-medium px-2 py-1 rounded-full flex items-center`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 mr-1" />
          )}
          {change} Change
        </span>
      </div>
      {dateLabel && <p className="text-gray-500 text-sm mt-2">{dateLabel}</p>}
    </div>
  );
};

// ExpensesSummaryLayout component: Fetches and displays daily and monthly expense summaries
export default function ExpensesSummaryLayout() {
  // State variables for daily and monthly totals, loading, error, and date labels
  const [dailyTotal, setDailyTotal] = useState<number>(0);
  const [previousDailyTotal, setPreviousDailyTotal] = useState<number>(0);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [previousMonthlyTotal, setPreviousMonthlyTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dailyDate, setDailyDate] = useState('');
  const [previousDailyDate, setPreviousDailyDate] = useState('');
  const [monthlyDate, setMonthlyDate] = useState('');
  const [previousMonthlyDate, setPreviousMonthlyDate] = useState('');

  // useEffect hook to fetch expense summaries when the component mounts
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Fetch daily and monthly total expenses from the API
        const dailyResponse = await fetch('/api/expenses/daily-total');
        const monthlyResponse = await fetch('/api/expenses/monthly-total');

        if (dailyResponse.ok && monthlyResponse.ok) {
          const dailyData: DailyTotal[] = await dailyResponse.json();
          const monthlyData: MonthlyTotal[] = await monthlyResponse.json();

          const currentDailyTotal = dailyData.length > 0 ? dailyData[0].total : 0;
          const currentMonthlyTotal = monthlyData.length > 0 ? monthlyData[0].total : 0;
          const prevDailyTotal = dailyData.length > 1 ? dailyData[1].total : 0;
          const prevMonthlyTotal = monthlyData.length > 1 ? monthlyData[1].total : 0;

          setDailyTotal(currentDailyTotal);
          setPreviousDailyTotal(prevDailyTotal);
          setMonthlyTotal(currentMonthlyTotal);
          setPreviousMonthlyTotal(prevMonthlyTotal);

          setDailyDate(dailyData.length > 0 ? format(parseISO(dailyData[0].date), 'EEEE, MMMM dd, yyyy') : '');
          setPreviousDailyDate(dailyData.length > 1 ? format(parseISO(dailyData[1].date), 'EEEE, MMMM dd, yyyy') : '');
          setMonthlyDate(monthlyData.length > 0 ? format(parseISO(monthlyData[0].month), 'MMMM yyyy') : '');
          setPreviousMonthlyDate(monthlyData.length > 1 ? format(parseISO(monthlyData[1].month), 'MMMM yyyy') : '');
        } else {
          setError('Failed to load summary.');
        }
      } catch (err) {
        console.error('Error fetching summary:', err);
        setError('An error occurred while fetching the summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading expense data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Calculate the percentage change between current and previous values
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return "No change";
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(2) + "%";
  };

  // Determine if the change is positive or negative
  const isPositiveChange = (current: number, previous: number) => {
    return current >= previous;
  };

  return (
    <div className="p-6">
      <h2 className="text-gray-700 text-lg font-semibold mb-4">Expenses Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Daily Expenses"
          value={dailyTotal.toLocaleString()}
          previousValue={previousDailyTotal.toLocaleString()}
          change={calculateChange(dailyTotal, previousDailyTotal)}
          isPositive={isPositiveChange(dailyTotal, previousDailyTotal)}
          dateLabel={`For: ${dailyDate}`}
          icon={<DollarSign className="w-8 h-8" />}  // Daily expense icon
        />
        <StatCard
          title="Total Monthly Expenses"
          value={monthlyTotal.toLocaleString()}
          previousValue={previousMonthlyTotal.toLocaleString()}
          change={calculateChange(monthlyTotal, previousMonthlyTotal)}
          isPositive={isPositiveChange(monthlyTotal, previousMonthlyTotal)}
          dateLabel={`For: ${monthlyDate}`}
          icon={<Calendar className="w-8 h-8" />}  // Monthly expense icon
        />
      </div>
    </div>
  );
}
