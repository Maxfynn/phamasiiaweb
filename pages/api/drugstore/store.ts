import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const drugs = await prisma.drugstore.findMany({
        where: { status: 'AVAILABLE' },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(drugs);
    }

    if (req.method === 'POST') {
      const {
        type,
        name,
        brand,
        amount,
        doseQuantity,
        stockType,
        manufacturedAt,
        expiredAt,
        purchasePrice,
        salesPrice,
        location,
        storeId,
        unitCostPrice,
        remainingQuantity,
        status,
      } = req.body;

      if (
        !type || !name || !brand || !stockType || !manufacturedAt ||
        !expiredAt || !location || !storeId || !doseQuantity ||
        !amount || !purchasePrice || !salesPrice || remainingQuantity === undefined
      ) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }

      const calculatedUnitCost = unitCostPrice !== undefined
        ? parseFloat(unitCostPrice)
        : parseFloat(purchasePrice) / parseInt(doseQuantity);

      const newDrug = await prisma.drugstore.create({
        data: {
          type,
          name,
          brand,
          amount: parseFloat(amount),
          doseQuantity: parseInt(doseQuantity),
          stockType,
          manufacturedDate: new Date(manufacturedAt),
          expireDate: new Date(expiredAt),
          purchasePrice: parseFloat(purchasePrice),
          salesPrice: parseFloat(salesPrice),
          location,
          storeId: parseInt(storeId),
          unitCostPrice: calculatedUnitCost,
          remainingQuantity: parseInt(remainingQuantity),
          status: status || 'AVAILABLE',
        },
      });

      return res.status(201).json({ message: 'Drug stored successfully.', drug: newDrug });
    }

    return res.status(405).json({ message: 'Method not allowed. Use GET or POST.' });
  } catch (error: any) {
    console.error('Error handling drugstore API:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
