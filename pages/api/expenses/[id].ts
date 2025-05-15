import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API endpoint called with method:', req.method);

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      // Validate `id` parameter
      if (!id || Array.isArray(id)) {
        return res.status(400).json({ message: 'Invalid ID provided.' });
      }

      // Parse the ID to an integer
      const expenseId = parseInt(id as string, 10);
      if (isNaN(expenseId)) {
        return res.status(400).json({ message: 'ID must be a valid number.' });
      }

      // Attempt to delete the record from the `expenses` table
      const deletedExpense = await prisma.expenses.delete({
        where: { id: expenseId },
      });

      console.log('Expense deleted successfully:', deletedExpense);

      return res.status(200).json({
        message: 'Expense deleted successfully!',
        expense: deletedExpense,
      });
    } catch (error) {
      console.error('Error deleting expense from database:', error);

      // Handle specific Prisma errors (e.g., record not found)
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({ message: 'Expense not found.' });
      }

      return res.status(500).json({
        message: 'Failed to delete expense.',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    console.warn(`Method ${req.method} not allowed.`);
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}
