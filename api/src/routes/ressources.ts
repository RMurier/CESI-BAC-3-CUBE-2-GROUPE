import express, { Request, Response } from "express";
import prisma from "../utils/database";
import { RessourceEntity } from "../types/ressources";
import commentsRouter from "./comments";
import { Ressource } from "@prisma/client";
import { requireAuth } from "@clerk/express";

const router = express.Router();
router.use("/:ressourceId/comments", commentsRouter);

router.get("/", requireAuth() ,async (req, res) => {
  try {
    const ressources = await prisma.ressource.findMany({
      include: {
        category: true,
        ressourceType: true,
      },
    });
    if (ressources && ressources.length > 0)
      res.status(200).json({ success: true, data: ressources });
    else res.status(404).json({ message: "No ressources found." });
  } catch (e) {
    res
      .status(500)
      .json(
        "Internal server error. Please contact an administrateur or IT service."
      );
  }
});

router.get(
  "/accessible",
  async (req: Request<{}, {}, {}, { clerkUserId?: string }>, res: any) => {
    const { clerkUserId } = req.query;

    if (!clerkUserId) {
      return res
        .status(400)
        .json({ error: "clerkUserId requis dans les paramètres." });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { clerkUserId },
      });

      if (!user) {
        return res.status(404).json({ error: "Utilisateur introuvable." });
      }

      const ressources: Ressource[] = await prisma.ressource.findMany({
        where: {
          OR: [
            { ressourceType: { name: "Public" } },
            { userId: user.id },
            { sharedWithUsers: { some: { userId: user.id } } },
          ],
        },
        include: {
          category: true,
          ressourceType: true,
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({ success: true, data: ressources });
    } catch (error) {
      console.error("Erreur récupération ressources accessibles :", error);
      return res
        .status(500)
        .json({ error: "Erreur interne du serveur", details: error });
    }
  }
);

router.get("/public", async (req, res) => {
  try {
    const ressources = await prisma.ressource.findMany({
      where: {
        ressourceType: {
          name: "Public",
        },
      },
      include: {
        category: true,
        ressourceType: true,
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ success: true, data: ressources });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des ressources publiques :",
      error
    );
    res.status(500).json({
      error: "Erreur serveur lors de la récupération des ressources publiques.",
    });
  }
});

router.get("/:ressourceId", async (req, res) => {
  try {
    const id = req.params.ressourceId;

    const ressource = await prisma.ressource.findFirst({
      where: { id },
      include: {
        category: true,
        ressourceType: true,
      },
    });
    if (ressource) res.status(200).json({ success: true, data: ressource });
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
  const { title, description, categoryId, isActive, ressourceTypeId, userId } =
    req.body;
  try {
    const category = await prisma.category.findFirst({
      where: { id: Number(categoryId) },
    });

    if (!category) {
      res.status(400).json({ error: "Category not found" });
      return;
    }
    const newRessource = await prisma.ressource.create({
      data: {
        title,
        description,
        user: {
          connect: { clerkUserId: userId as string },
        },
        ressourceType: {
          connect: { id: ressourceTypeId },
        },
        category: {
          connect: { id: Number(categoryId) },
        },
        isActive,
      },
    });

    res.status(201).json({ success: true, data: newRessource });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ success: false, error: "Internal server error", details: e });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await prisma.ressource.delete({
      where: {
        id: id,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Ressource supprimée avec succès." });
  } catch (e) {
    console.log(e);
    res.status(500).json("Internal server error");
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

    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur lors de la modification" });
  }
});

router.post("/:id/share", async (req: Request, res: any) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId requis" });
  }

  try {
    const existing = await prisma.sharedRessource.findUnique({
      where: {
        userId_ressourceId: {
          userId,
          ressourceId: id,
        },
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ error: "Déjà partagé avec cet utilisateur" });
    }

    const shared = await prisma.sharedRessource.create({
      data: {
        userId,
        ressourceId: id,
      },
    });

    return res.status(201).json({ data: shared });
  } catch (e) {
    console.error("Erreur de partage :", e);
    return res.status(500).json({ error: "Erreur serveur", details: e });
  }
});

export default router;
