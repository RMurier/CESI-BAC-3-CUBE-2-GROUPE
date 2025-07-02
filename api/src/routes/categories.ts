import express from "express";
import prisma from "../utils/database";
import { Category } from "@prisma/client";
import { TypedRequestBody } from "../types/express";
import { CategoryEntity } from "../types/category";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // console.log("Auth header:", req.headers.authorization);
    const categories = await prisma.category.findMany();

    res.status(200).json({ data: categories });
  } catch (ex) {
    console.error(ex);
    res.status(500).json("Internal server error");
  }
});

router.post<{}, any, Category>("/", requireAuth(), async (req, res) => {
  try {
    const { name, description } = req.body;

    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({ data: newCategory });
  } catch (ex) {
    console.error(ex);
    res.status(500).json("Internal server error");
  }
});

router.patch("/:id", requireAuth(), async (req, res) => {
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

router.delete("/:id", requireAuth(), async (req, res) => {
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

    res
      .status(200)
      .json({ success: true, message: "Catégorie supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

router.put(
  "/:ressourceTypeId",
  requireAuth(),
  async (req: TypedRequestBody<CategoryEntity>, res) => {
    try {
      const id = parseInt(req.params.ressourceTypeId);

      const { name, description } = req.body;

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: { name, description },
      });

      res.status(200).json({
        success: true,
        message: `La catégorie ${id} a bien été mise-à-jour.`,
        data: updatedCategory,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Internal server error", details: e });
    }
  }
);

router.get("/:categoryId", requireAuth(), async (req, res) => {
  try {
    const id = parseInt(req.params.categoryId);

    const category = await prisma.category.findFirst({
      where: { id },
    });

    if (!category) {
      res.status(404).json({ error: "Category not found" });
    } else {
      res.status(200).json({ success: true, data: category });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.get("/:name/public", async (req, res: any) => {
  const name = req.params.name;

  try {
    const category = await prisma.category.findFirst({
      where: { name },
    });

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    const ressources = await prisma.ressource.findMany({
      where: {
        categoryId: category.id,
        ressourceType: {
          name: {
            equals: "Public",
            mode: "insensitive",
          },
        },
      },
      include: {
        category: true,
        ressourceType: true,
      },
    });

    return res.status(200).json({ success: true, data: ressources });
  } catch (err) {
    console.error("Erreur récupération ressources publiques :", err);
    return res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

router.get("/:name/accessible", async (req, res: any) => {
  const name = req.params.name;
  const { clerkUserId } = req.query;

  if (typeof clerkUserId !== "string") {
    return res
      .status(400)
      .json({ error: "clerkUserId requis sous forme de chaîne" });
  }

  try {
    const category = await prisma.category.findFirst({
      where: { name },
    });

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const ressources = await prisma.ressource.findMany({
      where: {
        categoryId: category.id,
        OR: [
          {
            ressourceType: {
              name: {
                equals: "Public",
                mode: "insensitive",
              },
            },
          },
          {
            userId: user.id,
          },
          {
            sharedWithUsers: {
              some: { userId: user.id },
            },
          },
        ],
      },
      include: {
        category: true,
        ressourceType: true,
        user: true,
      },
    });

    return res.status(200).json({ success: true, data: ressources });
  } catch (err) {
    console.error("Erreur récupération ressources accessibles :", err);
    return res.status(500).json({ message: "Erreur serveur", error: err });
  }
});

export default router;
