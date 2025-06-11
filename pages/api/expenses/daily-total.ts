// pages/api/expenses/daily-total.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Expenses } from '@prisma/client';  // Import your Prisma model type here
import { format } from 'date-fns';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ date: string; total: number; expenses: Expenses[] }[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Type the expenses explicitly as Expenses[]
    const expenses: Expenses[] = await prisma.expenses.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    // dailyTotals groups expenses by date, each date has total and expenses array
    const dailyTotals: { [date: string]: { total: number; expenses: Expenses[] } } = {};

    expenses.forEach((expense: Expenses) => {
      const date = format(expense.createdAt, 'yyyy-MM-dd');
      if (dailyTotals[date]) {
        dailyTotals[date].total += expense.value;
        dailyTotals[date].expenses.push(expense);
      } else {
        dailyTotals[date] = {
          total: expense.value,
          expenses: [expense],
        };
      }
    });

    const result = Object.entries(dailyTotals).map(([date, { total, expenses }]) => ({
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
