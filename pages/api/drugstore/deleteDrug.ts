// pages/api/drugstore/deleteDrug.ts
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const deletedDrug = await prisma.drugstore.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      message: "Drug deleted successfully",
      drug: deletedDrug,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: "Failed to delete drug" });
  }
}
