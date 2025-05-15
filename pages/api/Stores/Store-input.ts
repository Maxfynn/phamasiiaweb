// pages/api/store/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StoreData {
  storeName: string;
  customerId: number;
  location: string; // e.g., "lat, long" or any string from geolocation
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  try {
    const { storeName, customerId, location } = req.body as StoreData;

    // Basic validation
    if (!storeName || !customerId || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newStore = await prisma.store.create({
      data: {
        storeName,
        customerId,
        location,
      },
    });

    return res.status(201).json({ message: 'Store created successfully', data: newStore });
  } catch (error) {
    console.error('Error creating store:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
