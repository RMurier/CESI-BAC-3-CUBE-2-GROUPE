import express from "express";
import prisma from "../utils/database";

const router = express.Router();

router.get("/resources-by-category", async (req, res) => {
  try {
    const result = await prisma.ressource.groupBy({
      by: ["categoryId"],
      _count: true,
    });

    const categories = await prisma.category.findMany();

    const formatted = result.map((r) => {
      const category = categories.find((c) => c.id === r.categoryId);
      return {
        category: category?.name || "Inconnue",
        count: r._count,
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Nombre de ressources par date (format AAAA-MM)
router.get("/resources-by-date", async (req, res) => {
  try {
    const ressources = await prisma.ressource.findMany();

    const grouped: { [date: string]: number } = {};

    ressources.forEach((r) => {
      const dateKey = new Date(r.createdAt).toISOString().slice(0, 7); // YYYY-MM
      grouped[dateKey] = (grouped[dateKey] || 0) + 1;
    });

    const data = Object.entries(grouped).map(([date, count]) => ({ date, count }));

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Nombre total d'utilisateurs
router.get("/user-count", async (req, res) => {
  try {
    const count = await prisma.user.count();
    res.status(200).json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

export default router;
