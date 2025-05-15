// pages/api/staff/create.ts
import { PrismaClient, UserRole } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string; error?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { staffName, storeName, location, email, phone1, phone2, password } = req.body;

  if (!staffName || !storeName || !location || !email || !phone1 || !password) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // Check if email already exists in User or Staff
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists as a user.' });
    }

    const existingStaff = await prisma.staff.findUnique({ where: { email } });
    if (existingStaff) {
      return res.status(409).json({ message: 'Email already exists as a staff member.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User and Staff in a single transaction
    await prisma.staff.create({
      data: {
        staffName,
        storeName,
        location,
        email,
        phone1,
        phone2,
        user: {
          create: {
            email,
            password: hashedPassword,
            role: UserRole.STAFF,
          },
        },
      },
    });

    res.status(201).json({ message: 'Staff member created successfully.' });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await prisma.$disconnect();
  }
}
