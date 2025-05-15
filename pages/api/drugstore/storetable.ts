// pages/api/drugstore/storetable.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for the HTTP method
  if (req.method === 'GET') {
    const { id } = req.query;

    try {
      if (id) {
        // If an ID is provided in the query, fetch the specific drug
        const drug = await prisma.drugstore.findUnique({
          where: { id: parseInt(id as string, 10) }, // Convert id to integer
        });

        if (!drug) {
          return res.status(404).json({ message: 'Drug not found' });
        }

        return res.status(200).json(drug); // Return the drug data
      } else {
        // If no ID is provided, fetch all drugs
        const drugs = await prisma.drugstore.findMany({
          orderBy: { createdAt: 'desc' }, // Optionally order by created date
        });

        return res.status(200).json(drugs); // Return all drugs
      }
    } catch (error) {
      console.error('Error fetching drugs:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
