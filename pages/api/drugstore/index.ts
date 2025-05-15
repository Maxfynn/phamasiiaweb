// pages/api/drugstore/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const drugs = await prisma.drugstore.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    res.status(200).json(drugs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drugstore data.' })
  }
}
