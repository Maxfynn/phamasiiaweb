// pages/api/staff/summary.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Count total staff records
    const totalStaff = await prisma.staff.count();

    // Fetch distinct locations so that duplicate names count only once.
    const locations = await prisma.staff.findMany({
      select: { location: true },
      distinct: ['location'],
    });
    const totalLocations = locations.length;

    // Group staff by location and count staff per location
    const locationStats = await prisma.staff.groupBy({
      by: ['location'],
      _count: {
        id: true,
      },
    });

    return res.status(200).json({ totalStaff, totalLocations, locationStats });
  } catch (error) {
    console.error('Error fetching staff summary:', error);
    return res.status(500).json({ error: 'Error fetching staff summary.' });
  }
}
