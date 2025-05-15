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
    // Fetch the drug to check inventory
    const drug = await prisma.drugstore.findUnique({
      where: { id: drugstoreId },
    });

    if (!drug) {
      return res.status(404).json({ error: 'Drug not found' });
    }

    // Check if there's enough quantity to sell
    if (drug.remainingQuantity < doseSold) {
      return res.status(400).json({ error: 'Not enough inventory' });
    }

    // Create the sale
    const newSale = await prisma.sales.create({
      data: {
        drugstoreId,
        doseSold,
        unitCostPrice,
        salesPrice,
        profit,
        closed: closed ?? false,
      },
    });

    // Update the inventory (decrement remainingQuantity)
    await prisma.drugstore.update({
      where: { id: drugstoreId },
      data: {
        remainingQuantity: {
          decrement: doseSold,
        },
      },
    });

    res.status(201).json({ message: 'Sale recorded and inventory updated', sale: newSale });
  } catch (error) {
    console.error('Error processing sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
