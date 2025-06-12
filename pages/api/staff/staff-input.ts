// pages/api/staff/create.ts
import { Prisma } from "@prisma/client";
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Define UserRole enum if not imported from elsewhere
enum UserRole {
  STAFF = 'STAFF',
  // Add other roles if needed
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string; error?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { staffName, storeName, location, email, phone1, phone2, password } = req.body;

  // Validate required fields
  if (!staffName || !storeName || !location || !email || !phone1 || !password) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // Check if email exists in User or Staff
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists as a user.' });
    }

    const existingStaff = await prisma.staff.findUnique({ where: { email } });
    if (existingStaff) {
      return res.status(409).json({ message: 'Email already exists as a staff member.' });
    }

    // Match Customer by storeName
    const customer = await prisma.customer.findUnique({
      where: { StoreName: storeName },
    });

    if (!customer) {
      return res.status(404).json({ message: 'No customer found matching the given storeName.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User and Staff within a single transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.STAFF,
          customerId: customer.id,
        },
      });

      await tx.staff.create({
        data: {
          staffName,
          storeName,
          location,
          email,
          phone1,
          phone2,
          userId: user.id,
          customerId: customer.id,
        },
      });
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
