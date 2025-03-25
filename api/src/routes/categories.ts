import express from "express";
import prisma from "../utils/database";
import { TypedRequestBody } from "../types/express";
import { CategoryCreateBody, CategoryEntity } from "../types/category";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany();

    if (categories && categories.length > 0)
      res.status(200).json({ data: categories });
    else res.status(404).json({ message: "No categories found." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.get("/:categoryId", async (req, res) => {
  try {
    const id = parseInt(req.params.categoryId);

    const category = await prisma.category.findFirst({
      where: { id },
    });

    if (!category) {
      res.status(404).json({ error: "Category not found" });
    } else {
      res.status(200).json({ data: category });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.post<{}, any, CategoryEntity>(
  "/",
  async (req: TypedRequestBody<CategoryCreateBody>, res) => {
    try {
      const { name, description } = req.body;

      const newCategory = await prisma.category.create({
        data: {
          name,
          description,
        },
      });

      res.status(201).json({ data: newCategory });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error", details: e });
    }
  }
);

router.delete("/:categoryId", async (req, res) => {
  try {
    const id = parseInt(req.params.categoryId);

    const category = await prisma.category.findFirst({
      where: { id },
    });

    if (!category) res.status(404).json({ error: "Category not found." });

    await prisma.category.update({
      where: { id },
      data: { isActive: !category!.isActive },
    });

    res
      .status(204)
      .json({
        message: `La catégorie (id:${id}) a été supprimée avec succès.`,
      });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.put(
  "/:ressourceTypeId",
  async (req: TypedRequestBody<CategoryEntity>, res) => {
    try {
      const id = parseInt(req.params.ressourceTypeId);

      const { name, description, isActive } = req.body;

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: { name, description, isActive },
      });

      res.status(200).json({
        message: `La catégorie ${id} a bien été mise-à-jour.`,
        data: updatedCategory,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Internal server error", details: e });
    }
  }
);

export default router;
