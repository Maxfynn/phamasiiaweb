import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const {
    customerName,
    staffName,
    storeName,
    location,
    email,
    phone1,
    phone2,
    password,
    role,
  } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Email, password, and role are required." });
  }

  try {
    await prisma.$connect();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "SUPERADMIN") {
      const superAdmin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "SUPERADMIN",
        },
      });

      return res.status(201).json({ message: "SuperAdmin created successfully", user: superAdmin });
    }

    if (role === "ADMIN") {
      if (!customerName || !storeName || !phone1 || !location) {
        return res.status(400).json({ error: "Missing required customer/store fields for admin." });
      }

      // 1. Create new Customer and User (Admin)
      const newCustomer = await prisma.customer.create({
        data: {
          customerName,
          StoreName: storeName,
          location,
          phone1,
          phone2,
          users: {
            create: {
              email,
              password: hashedPassword,
              role: "ADMIN",
            },
          },
        },
        include: { users: true },
      });

      const adminUser = newCustomer.users[0];

      // 2. Create the Store associated with the new Customer
      const newStore = await prisma.store.create({
        data: {
          storeName,
          location,
          customerId: newCustomer.id,
        },
      });

      return res.status(201).json({
        message: "Admin, Customer, and Store created successfully",
        user: adminUser,
        store: newStore,
      });
    }

    if (role === "STAFF") {
      if (!staffName || !storeName || !phone1 || !location) {
        return res.status(400).json({ error: "Missing required staff/store fields for staff." });
      }

      const customer = await prisma.customer.findFirst({
        where: {
          StoreName: storeName,
        },
      });

      if (!customer) {
        return res.status(404).json({ error: `Store "${storeName}" not found.` });
      }

      const staffUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "STAFF",
          customer: { connect: { id: customer.id } },
          staff: {
            create: {
              staffName,
              storeName: customer.StoreName,
              location,
              phone1,
              phone2,
              email,
              customer: { connect: { id: customer.id } },
            },
          },
        },
      });

      return res.status(201).json({ message: "Staff created successfully", user: staffUser });
    }

    return res.status(400).json({ error: "Invalid role specified." });

  } catch (error: any) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
