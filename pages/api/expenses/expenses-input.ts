import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route /api/expenses loaded'); // Debugging log

  if (req.method === 'POST') {
    const { exp, value } = req.body;

    try {
      // Validate input
      if (!exp || typeof exp !== 'string') {
        return res.status(400).json({ error: 'Invalid "expenses" field. It must be a non-empty string.' });
      }
      if (value == null || isNaN(Number(value))) {
        return res.status(400).json({ error: 'Invalid "value" field. It must be a number.' });
      }

      // Save data to the database
      const newExpense = await prisma.expenses.create({
        data: {
          exp: exp,
          value: parseFloat(value), // Convert to number for the database
        },
      });

      return res.status(201).json(newExpense); // Return the created expense
    } catch (error: any) {
      console.error('Database error:', error);

      return res.status(500).json({
        error: 'An error occurred while saving the expense. Please ensure your data is compatible with the database.',
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed. Please use POST.` });
  }
}