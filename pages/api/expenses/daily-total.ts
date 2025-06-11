// pages/api/expenses/daily-total.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'; // Use the client only from here
import { format } from 'date-fns';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define a type for the response structure
type DailyTotal = {
  date: string;
  total: number;
  expenses: {
    id: number;
    exp: string;
    value: number;
    createdAt: Date;
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DailyTotal[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Fetch all expenses ordered by creation date
    const expenses = await prisma.expenses.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group expenses by date
    const dailyTotals: Record<string, { total: number; expenses: typeof expenses }> = {};

    for (const expense of expenses) {
      const date = format(expense.createdAt, 'yyyy-MM-dd');

      if (!dailyTotals[date]) {
        dailyTotals[date] = {
          total: 0,
          expenses: [],
        };
      }

      dailyTotals[date].total += expense.value;
      dailyTotals[date].expenses.push(expense);
    }

    // Convert the result to an array
    const result: DailyTotal[] = Object.entries(dailyTotals).map(([date, { total, expenses }]) => ({
      date,
      total,
      expenses,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating daily expenses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
