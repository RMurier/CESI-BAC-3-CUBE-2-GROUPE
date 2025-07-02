import request from "supertest";
import express from "express";
import categoryRouter from "../routes/categories";
import prisma from "../utils/database";

const app = express();
app.use(express.json());
app.use("/categories", categoryRouter);

jest.mock("../utils/database", () => ({
  __esModule: true,
  default: {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    ressource: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe("Category API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /categories - should return all categories", async () => {
    (prisma.category.findMany as jest.Mock).mockResolvedValue([{ id: 1, name: "Test", description: "Desc", isActive: true }]);

    const res = await request(app).get("/categories");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test("POST /categories - should create a new category", async () => {
    const newCategory = { id: 1, name: "Test", description: "Desc", isActive: true };
    (prisma.category.create as jest.Mock).mockResolvedValue(newCategory);

    const res = await request(app).post("/categories").send({
      name: "Test",
      description: "Desc",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Test");
  });

  test("DELETE /categories/:id - should prevent deletion if category has resources", async () => {
    (prisma.ressource.findFirst as jest.Mock).mockResolvedValue({ id: "abc" });

    const res = await request(app).delete("/categories/1");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/liée à une ou plusieurs ressources/);
  });

  test("DELETE /categories/:id - should delete if no resources are linked", async () => {
    (prisma.ressource.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.category.delete as jest.Mock).mockResolvedValue({ id: 1 });

    const res = await request(app).delete("/categories/1");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/supprimée avec succès/);
  });

  test("GET /categories/:id - should return one category", async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 1, name: "Test", description: "Desc" });

    const res = await request(app).get("/categories/1");

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Test");
  });

  test("GET /categories/:id - should return 404 if not found", async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get("/categories/99");

    expect(res.status).toBe(404);
  });
});
