import express, { response } from "express";
import prisma from "../utils/database";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const ressources = await prisma.ressource.findMany();
    console.log(ressources);
    if (ressources && ressources.length > 0) res.status(200).json(ressources);
    else res.status(404).json({ message: "No ressources found." });
  } catch (e) {
    // dev
    res.status(500).json(e);
    // prod
    // res.status(500).json("Internal server error. Please contact an administrateur or IT service.");
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, categoryId } = req.body;
    const category = await prisma.category.findFirst({
      where: { id: categoryId },
    });

    const newRessource = await prisma.ressource.create({
      data: {
        title,
        description,
        category,
      },
    });
    res.status(201).json({ data: newRessource });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

export default router;
