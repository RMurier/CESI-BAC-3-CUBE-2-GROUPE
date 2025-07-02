import request from "supertest";
import express from "express";
import statsRouter from "../routes/stats";
import prisma from "../utils/database";

const app = express();
app.use(express.json());
app.use("/stats", statsRouter);

jest.mock("../utils/database", () => ({
  __esModule: true,
  default: {
    ressource: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
  },
}));

describe("Stats API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /stats/resources-by-category - should return grouped categories", async () => {
    (prisma.ressource.groupBy as jest.Mock).mockResolvedValue([
      { categoryId: 1, _count: 5 },
    ]);
    (prisma.category.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: "Test" },
    ]);

    const res = await request(app).get("/stats/resources-by-category");

    expect(res.status).toBe(200);
  });

  test("GET /stats/resources-by-date - should group resources by date", async () => {
    (prisma.ressource.findMany as jest.Mock).mockResolvedValue([
      { createdAt: new Date("2024-01-01") },
      { createdAt: new Date("2024-01-15") },
    ]);

    const res = await request(app).get("/stats/resources-by-date");

    expect(res.status).toBe(200);
  });

  test("GET /stats/user-count - should return user count", async () => {
    (prisma.user.count as jest.Mock).mockResolvedValue(42);

    const res = await request(app).get("/stats/user-count");

    expect(res.status).toBe(200);
  });

  test("GET /stats/resources-by-category - handles server error", async () => {
    (prisma.ressource.groupBy as jest.Mock).mockRejectedValue(new Error("Test error"));

    const res = await request(app).get("/stats/resources-by-category");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erreur serveur.");
  });

  test("GET /stats/resources-by-date - handles server error", async () => {
    (prisma.ressource.findMany as jest.Mock).mockRejectedValue(new Error("Test error"));

    const res = await request(app).get("/stats/resources-by-date");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erreur serveur.");
  });

  test("GET /stats/user-count - handles server error", async () => {
    (prisma.user.count as jest.Mock).mockRejectedValue(new Error("Test error"));

    const res = await request(app).get("/stats/user-count");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erreur serveur.");
  });
});
