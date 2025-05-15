// pages/api/expenses/monthly-total.ts
import { PrismaClient, Expenses } from '@prisma/client';
import { format } from 'date-fns';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

interface MonthlyTotal {
  month: string;
  total: number;
  expenses: Expenses[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MonthlyTotal[] | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const expenses = await prisma.expenses.findMany();

    const monthlyTotals: { [key: string]: MonthlyTotal } = expenses.reduce(
      (acc: { [key: string]: MonthlyTotal }, expense: Expenses) => {
        const month = format(expense.createdAt, 'yyyy-MM');
        if (!acc[month]) {
          acc[month] = { month, total: 0, expenses: [] };
        }
        acc[month].total += expense.value;
        acc[month].expenses.push(expense);
        return acc;
      },
      {}
    );

    const monthlyTotalsArray: MonthlyTotal[] = Object.values(monthlyTotals);

    res.status(200).json(monthlyTotalsArray);
  } catch (error) {
    console.error('Error fetching monthly totals:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}