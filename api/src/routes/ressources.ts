import express from "express";
import prisma from "../utils/database";
import { TypedRequestBody } from "../types/express";
import { RessourceCreateBody, RessourceEntity } from "../types/ressources";
import { connect } from "mongoose";

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

router.get("/:ressourceId", async (req, res) => {
  try {
    const id = parseInt(req.params.ressourceId);

    const ressource = await prisma.ressource.findFirst({ where: { id } });

    if (!ressource) {
      res.status(400).json({ error: "Ressource not found" });
    } else {
      res.status(200).json({ data: ressource });
    }
  } catch (e) {}
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
      const id = parseInt(req.params.ressourceId);

      await prisma.ressource.delete({ where: { id } });

      res
        .status(204)
        .json(`La ressource (id:${id}) a été supprimé avec succès.`);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error", details: e });
    }
  }
);

router.put(
  "/:ressourceId",
  async (req: TypedRequestBody<RessourceEntity>, res) => {
    try {
      const id = parseInt(req.params.ressourceId);

      const { title, description, isActive, categoryId } = req.body;

      const category = await prisma.category.findFirst({
        where: { id: categoryId },
      });

      if (!category) {
        res.status(400).json({ error: "Category not found" });
      }

      const updatedRessource = await prisma.ressource.update({
        where: {
          id,
        },
        data: {
          title,
          description,
          isActive,
          category: {
            connect: {
              id: categoryId,
            },
          },
        },
      });

      res
        .status(200)
        .json({
          message: `L'utilisateur ${req.params.userId} a bien été mis-à-jour.`,
          data: updatedRessource,
        });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Internal server error", details: e });
    }
  }
);

export default router;
