// pages/api/store/store-table.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma'; // Adjust if your prisma instance path differs

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const stores = await prisma.store.findMany(); // Ensure this returns an array
    res.status(200).json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to load store data.' });
  }
}
