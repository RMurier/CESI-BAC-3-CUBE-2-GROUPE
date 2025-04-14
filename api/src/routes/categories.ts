import express from "express";
import prisma from "../utils/database";
import { Category } from "@prisma/client";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const categories = await prisma.category.findMany();

        res.status(200).json(categories);
    }
    catch (ex) {
        console.error(ex);
        res.status(500).json("Internal server error");
    }
})

router.post<{}, any, Category>("/", async (req, res) => {
    try {
        const { name, description } = req.body;

        const newCategory = await prisma.category.create({
            data: {
                name,
                description
            }
        })

        res.status(201).json({ data: newCategory });
    }
    catch (ex) {
        console.error(ex);
        res.status(500).json("Internal server error");
    }
})

router.patch("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, description } = req.body;

        const updated = await prisma.category.update({
            where: { id },
            data: { name, description },
        });

        res.status(200).json(updated);
    } catch (ex) {
        console.error(ex);
        res.status(500).json("Internal server error");
    }
});

router.delete("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
  
    if (isNaN(id)) {
      res.status(400).json({ error: "ID invalide." });
      return;
    }
  
    try {
      const related = await prisma.ressource.findFirst({
        where: { categoryId: id },
      });
  
      if (related) {
        res.status(400).json({
          error: "Cette catégorie est liée à une ou plusieurs ressources.",
        });
        return;
      }
  
      await prisma.category.delete({ where: { id } });
  
      res.status(200).json({ message: "Catégorie supprimée avec succès." });
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  });


export default router;