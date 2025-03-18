import express from "express";
import prisma from "../utils/database";
import { TypedRequestBody } from "../types/express";
import { RessourceCreateBody, RessourceEntity } from "../types/ressources";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const ressources = await prisma.ressource.findMany();
    console.log(ressources);
    if (ressources && ressources.length > 0) res.status(200).json(ressources);
    else res.status(404).json({ message: "No ressources found." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.post<{}, any, RessourceEntity>(
  "/",
  async (req: TypedRequestBody<RessourceCreateBody>, res) => {
    const { title, description, categoryId } = req.body;

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
          category: {
            connect: { id: categoryId },
          },
        },
      });

      res.status(201).json({ data: newRessource });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error", details: e });
    }
  }
);

router.delete(
  "/:ressourceId",
  async (req: TypedRequestBody<RessourceEntity>, res) => {
    try {
      const ressourceId = req.params.ressourceId;

      await prisma.ressource.delete({ where: { id: parseInt(ressourceId) } });

      res
        .status(204)
        .json(`La ressource (id:${ressourceId}) a été supprimé avec succès.`);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error", details: e });
    }
  }
);

export default router;
