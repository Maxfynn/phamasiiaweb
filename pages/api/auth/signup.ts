
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
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
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "SUPERADMIN") {
      const superAdmin = await prisma.user.create({
        data: { email, password: hashedPassword, role },
      });

      return res.status(201).json({ message: "SuperAdmin created successfully", user: superAdmin });
    }

    if (role === "ADMIN") {
      if (!customerName || !storeName || !phone1 || !location) {
        return res.status(400).json({ error: "Missing required fields for ADMIN." });
      }

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
              role,
            },
          },
        },
        include: { users: true },
      });

      const adminUser = newCustomer.users[0];

      await prisma.store.create({
        data: {
          storeName,
          location,
          customerId: newCustomer.id,
        },
      });

      return res.status(201).json({
        message: "Admin, Customer, and Store created successfully",
        user: adminUser,
      });
    }

    if (role === "STAFF") {
      if (!staffName || !storeName || !phone1 || !location) {
        return res.status(400).json({ error: "Missing required fields for STAFF." });
      }

      const customer = await prisma.customer.findFirst({ where: { StoreName: storeName } });

      if (!customer) {
        return res.status(404).json({ error: `Customer with store "${storeName}" not found.` });
      }

      const staffUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
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
    console.error("Signup error:", error.message);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
