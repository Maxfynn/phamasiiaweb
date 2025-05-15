import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Fetch all expenses from the database, sorted by creation date
      const expenses = await prisma.expenses.findMany({
        orderBy: {
          createdAt: 'desc', // Sort by most recent first
        },
      });
      return res.status(200).json(expenses); // Return the fetched expenses
    }

    // If any other HTTP method is used, return a 405 Method Not Allowed response
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
