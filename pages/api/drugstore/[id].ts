import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma'; // Adjust this import to your project structure

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    if (req.method === 'GET') {
      const drug = await prisma.drugstore.findUnique({
        where: { id: parseInt(id, 10) },
      });

      if (!drug) {
        return res.status(404).json({ error: 'Drug not found' });
      }

      return res.status(200).json(drug);
    }

    if (req.method === 'PUT') {
      const data = req.body;

      const updatedDrug = await prisma.drugstore.update({
        where: { id: parseInt(id, 10) },
        data,
      });

      return res.status(200).json(updatedDrug);
    }

    // If method is not GET or PUT
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Server Error', details: error });
  }
}
