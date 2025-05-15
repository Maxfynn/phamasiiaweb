// pages/api/expenses/daily-total.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ date: string; total: number; expenses: any[] }[] | { error: string }>
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

    const dailyTotals: { [date: string]: { total: number; expenses: any[] } } = {};

    expenses.forEach((expense) => {
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