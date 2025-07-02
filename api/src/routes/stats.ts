import express from "express";
import prisma from "../utils/database";

const router = express.Router();

router.get("/resources-by-category", async (req, res) => {
  try {
    const { startDate, endDate, categoryId } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    const result = await prisma.ressource.groupBy({
      by: ["categoryId"],
      _count: true,
      where,
    });

    const categories = await prisma.category.findMany();

    const formatted = result.map((r) => {
      const category = categories.find((c) => c.id === r.categoryId);
      return {
        category: category?.name || "Inconnue",
        count: r._count,
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

router.get("/resources-by-date", async (req, res) => {
  try {
    const { startDate, endDate, categoryId } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    const ressources = await prisma.ressource.findMany({ where });

    const grouped: { [date: string]: number } = {};
    ressources.forEach((r) => {
      const dateKey = new Date(r.createdAt).toISOString().slice(0, 7);
      grouped[dateKey] = (grouped[dateKey] || 0) + 1;
    });

    const data = Object.entries(grouped).map(([date, count]) => ({
      date,
      count,
    }));

    res.status(200).json({ success: true, data: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

router.get("/user-count", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const count = await prisma.user.count({ where });
    res.status(200).json({ success: true, data: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

export default router;
