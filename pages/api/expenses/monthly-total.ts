// pages/api/expenses/monthly-total.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

// Define the response type structure
type MonthlyTotal = {
  month: string;
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
  res: NextApiResponse<MonthlyTotal[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const expenses = await prisma.expenses.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group expenses by month (e.g., "2025-06")
    const monthlyTotals: Record<string, { total: number; expenses: typeof expenses }> = {};

    for (const expense of expenses) {
      const month = format(expense.createdAt, 'yyyy-MM');

      if (!monthlyTotals[month]) {
        monthlyTotals[month] = {
          total: 0,
          expenses: [],
        };
      }

      monthlyTotals[month].total += expense.value;
      monthlyTotals[month].expenses.push(expense);
    }

    const result: MonthlyTotal[] = Object.entries(monthlyTotals).map(
      ([month, { total, expenses }]) => ({
        month,
        total,
        expenses,
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching monthly totals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
