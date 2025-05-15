// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ensure that Prisma client is only instantiated once during the lifecycle
export default prisma;
