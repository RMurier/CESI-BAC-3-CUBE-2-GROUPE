import express from "express";
import prisma from "../utils/database";
import { TypedRequestBody } from "../types/express";
import {
  RessourceTypeCreateBody,
  RessourceTypeEntity,
} from "../types/ressources";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const ressourceTypes = await prisma.ressourceType.findMany();

    if (ressourceTypes && ressourceTypes.length > 0)
      res.status(200).json(ressourceTypes);
    else res.status(404).json({ message: "No ressource types found." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.get("/:ressourceTypeId", async (req, res) => {
  try {
    const id = parseInt(req.params.ressourceTypeId);

    const ressourceType = await prisma.ressourceType.findFirst({
      where: { id },
    });

    if (!ressourceType) {
      res.status(400).json({ error: "Ressource type not found" });
    } else {
      res.status(200).json({ data: ressourceType });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.post<{}, any, RessourceTypeEntity>(
  "/",
  async (req: TypedRequestBody<RessourceTypeCreateBody>, res) => {
    try {
      const { name } = req.body;
      console.log(name);

      const newRessourceType = await prisma.ressourceType.create({
        data: {
          name,
        },
      });

      res.status(201).json({ data: newRessourceType });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error", details: e });
    }
  }
);

router.delete("/:ressourceTypeId", async (req, res) => {
  try {
    const id = parseInt(req.params.ressourceTypeId);

    const ressourceType = await prisma.ressourceType.findFirst({
      where: { id },
    });

    if (!ressourceType)
      res.status(404).json({ error: "Ressource type not found." });

    await prisma.ressourceType.update({
      where: { id },
      data: { isActive: !ressourceType!.isActive },
    });

    res.status(204).json({
      message: `Le type de ressource (id:${id}) a été supprimé avec succès.`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.put(
  "/:ressourceTypeId",
  async (req: TypedRequestBody<RessourceTypeEntity>, res) => {
    try {
      const id = parseInt(req.params.ressourceTypeId);

      const { name, isActive } = req.body;

      const updatedRessourceType = await prisma.ressourceType.update({
        where: { id },
        data: { name, isActive },
      });

      res.status(200).json({
        message: `Le type de ressource ${id} a bien été mis-à-jour.`,
        data: updatedRessourceType,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Internal server error", details: e });
    }
  }
);

export default router;
