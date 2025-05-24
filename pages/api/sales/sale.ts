import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    // GET all sales
    case 'GET': {
      try {
        const sales = await prisma.sales.findMany({
          orderBy: { id: 'desc' },
          include: {
            drugstore: {
              select: {
                name: true,
                doseQuantity: true,
              },
            },
          },
        });
        return res.status(200).json(sales);
      } catch (error) {
        console.error('Error fetching sales:', error);
        return res.status(500).json({ error: 'Failed to fetch sales history' });
      }
    }

    // POST a new sale
    case 'POST': {
      const { drugstoreId, doseSold, unitCostPrice, salesPrice, closed } = req.body;

      if (!drugstoreId || !doseSold || !unitCostPrice || !salesPrice) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        const drug = await prisma.drugstore.findUnique({
          where: { id: drugstoreId },
        });

        if (!drug) {
          return res.status(404).json({ error: 'Drug not found' });
        }

        if (drug.remainingQuantity < doseSold) {
          return res.status(400).json({ error: 'Not enough inventory' });
        }

        const profit = salesPrice * doseSold - unitCostPrice * doseSold;

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

        await prisma.drugstore.update({
          where: { id: drugstoreId },
          data: {
            remainingQuantity: {
              decrement: doseSold,
            },
          },
        });

        return res.status(201).json({ message: 'Sale recorded and inventory updated', sale: newSale });
      } catch (error) {
        console.error('Error processing sale:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    // PUT to update a sale by id
    case 'PUT': {
      const { id, drugstoreId, doseSold, unitCostPrice, salesPrice, closed } = req.body;

      if (!id || !drugstoreId || !doseSold || !unitCostPrice || !salesPrice) {
        return res.status(400).json({ error: 'Missing required fields for update' });
      }

      try {
        // Find existing sale
        const existingSale = await prisma.sales.findUnique({ where: { id: Number(id) } });
        if (!existingSale) {
          return res.status(404).json({ error: 'Sale not found' });
        }

        // Find the drug for inventory
        const drug = await prisma.drugstore.findUnique({ where: { id: drugstoreId } });
        if (!drug) {
          return res.status(404).json({ error: 'Drug not found' });
        }

        // Calculate change in doseSold to adjust inventory correctly
        const doseDifference = doseSold - existingSale.doseSold;

        if (doseDifference > 0 && drug.remainingQuantity < doseDifference) {
          return res.status(400).json({ error: 'Not enough inventory to increase doseSold' });
        }

        // Update inventory accordingly
        await prisma.drugstore.update({
          where: { id: drugstoreId },
          data: {
            remainingQuantity: {
              decrement: doseDifference, // decrement if positive, increment if negative
            },
          },
        });

        // Recalculate profit
        const profit = salesPrice * doseSold - unitCostPrice * doseSold;

        // Update sale record
        const updatedSale = await prisma.sales.update({
          where: { id: Number(id) },
          data: {
            drugstoreId,
            doseSold,
            unitCostPrice,
            salesPrice,
            profit,
            closed: closed ?? existingSale.closed,
          },
        });

        return res.status(200).json({ message: 'Sale updated successfully', sale: updatedSale });
      } catch (error) {
        console.error('Error updating sale:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    // DELETE a sale by id
    case 'DELETE': {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Sale id is required for deletion' });
      }

      try {
        // Find existing sale
        const existingSale = await prisma.sales.findUnique({ where: { id: Number(id) } });
        if (!existingSale) {
          return res.status(404).json({ error: 'Sale not found' });
        }

        // Return sold doses back to inventory
        if (existingSale.drugstoreId === null) {
          return res.status(400).json({ error: 'Sale record has no associated drugstoreId' });
        }
        await prisma.drugstore.update({
          where: { id: existingSale.drugstoreId },
          data: {
            remainingQuantity: {
              increment: existingSale.doseSold,
            },
          },
        });

        // Delete the sale
        await prisma.sales.delete({ where: { id: Number(id) } });

        return res.status(200).json({ message: 'Sale deleted successfully' });
      } catch (error) {
        console.error('Error deleting sale:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }

    // Handle unsupported methods
    default:
      return res.status(405).json({ error: 'Method Not Allowed' });
  }
}