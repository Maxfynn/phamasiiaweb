import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extract staff ID from the URL
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid staff ID' });
  }

  // DELETE request: Remove staff from the database
  if (req.method === 'DELETE') {
    try {
      // Find staff to ensure they exist
      const staff = await prisma.staff.findUnique({
        where: { id: Number(id) },
      });

      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Delete staff record
      await prisma.staff.delete({
        where: { id: Number(id) },
      });

      return res.status(200).json({ message: 'Staff deleted successfully' });
    } catch (error) {
      console.error('Error deleting staff:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // If the request method is not DELETE, return a 405 Method Not Allowed error
  return res.setHeader('Allow', ['DELETE']).status(405).json({ error: `Method ${req.method} not allowed` });
}
