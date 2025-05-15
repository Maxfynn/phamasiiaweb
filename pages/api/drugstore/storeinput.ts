import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma'; // adjust if your prisma client is in a different path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { storeName, location, customerId } = req.body;

      // Ensure that storeName, location, and customerId are provided
      if (!storeName || !location || !customerId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create a new store entry using the Prisma client
      const result = await prisma.store.create({
        data: {
          storeName,  // corresponds to `storeName` in your schema
          location,   // corresponds to `location` in your schema
          customerId, // corresponds to `customerId` in your schema
        },
      });

      // Return the created store object as JSON
      res.status(200).json(result);
    } catch (error) {
      console.error('Error creating store entry:', error);
      res.status(500).json({ error: 'Failed to create store entry' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
