// pages/api/staff/[id].ts
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string; error?: string }>
) {
  const { id } = req.query;

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid staff ID.' });
  }

  const staffId = parseInt(id, 10);

  if (isNaN(staffId)) {
    return res.status(400).json({ message: 'Invalid staff ID.' });
  }

  const { staffName, storeName, location, email, phone1, phone2, password } = req.body;

  if (!staffName || !storeName || !location || !email || !phone1) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const existingStaff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!existingStaff) {
      return res.status(404).json({ message: 'Staff member not found.' });
    }

    let hashedPassword = existingStaff.password; // Use existing password if not provided

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await prisma.staff.update({
      where: { id: staffId },
      data: {
        staffName,
        storeName,
        location,
        email,
        phone1,
        phone2,
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: 'Staff member updated successfully.' });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'An unknown error occurred.',
    });
  } finally {
    await prisma.$disconnect();
  }
}