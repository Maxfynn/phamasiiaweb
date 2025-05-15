// File: pages/api/store/store-summary.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma'; // Ensure this path points to your Prisma client instance

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const totalStores = await prisma.store.count();
    const totalCustomers = await prisma.customer.count();

    res.status(200).json({
      totalStores,
      totalCustomers,
    });
  } catch (error) {
    console.error('Error fetching store summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
