import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { drugstoreId, doseSold, unitCostPrice, salesPrice, profit, closed } = req.body;

  if (!drugstoreId || !doseSold || !unitCostPrice || !salesPrice || profit === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newSale = await prisma.sales.create({
      data: {
        drugstoreId,
        doseSold,
        unitCostPrice,
        salesPrice,
        profit,
        closed: closed ?? false, // default to false if not provided
      },
    });

    res.status(201).json({ message: 'Sale recorded successfully', sale: newSale });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
