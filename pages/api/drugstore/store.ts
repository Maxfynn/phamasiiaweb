import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST instead.' });
  }

  try {
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
      status, // Optional input
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
  } catch (error: any) {
    console.error('Error saving drug:', error);
    return res.status(500).json({ message: 'Failed to store drug.', error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
