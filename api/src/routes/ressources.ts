import express, { Request, Response } from "express";
import prisma from "../utils/database";
import { RessourceEntity } from "../types/ressources";
import commentsRouter from "./comments";

const router = express.Router();
router.use("/:ressourceId/comments", commentsRouter);

router.get("/", async (req, res) => {
  try {
    const ressources = (await prisma.ressource.findMany({
      include: {
        category: true
      }
    }));
    if (ressources && ressources.length > 0) res.status(200).json(ressources);
    else res.status(404).json({ message: "No ressources found." });
  } catch (e) {
    res
      .status(500)
      .json(
        "Internal server error. Please contact an administrateur or IT service."
      );
  }
});

router.get("/:ressourceId", async (req, res) => {
  try {
    const id = req.params.ressourceId;

    const ressource = await prisma.ressource.findFirst({
      where: { id },
      include: {
        category: true,
        // ressourceType: true,
      },
    });
    if (ressource) res.status(200).json({ data: ressource });
    else res.status(404).json({ message: "Ressource not found." });
  } catch (e) {
    res
      .status(500)
      .json(
        "Internal server error. Please contact an administrateur or IT service."
      );
  }
});

router.post<{}, any, RessourceEntity>("/", async (req, res) => {
  const { title, description, categoryId, isActive } = req.body;

  try {
    const category = await prisma.category.findFirst({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(400).json({ error: "Category not found" });
      return;
    }
    const newRessource = await prisma.ressource.create({
      data: {
        title,
        description,
        // ressourceType: {
        //   connect: { id: ressourceTypeId },
        // },
        category: {
          connect: { id: categoryId },
        },
        isActive
      },
    });

    res.status(201).json({ data: newRessource });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.ressource.delete({
      where: {
        id: id
      }
    })

    res.status(200).json("Ressource supprimée avec succès.");
  }
  catch (e) {
    console.log(e);
    res.status(500)
      .json("Internal server error");
  }
});

router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const { title, description, isActive, categoryId } = req.body;

  try {
    const updated = await prisma.ressource.update({
      where: { id },
      data: {
        title,
        description,
        isActive,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    res.status(200).json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
});

export default router;
