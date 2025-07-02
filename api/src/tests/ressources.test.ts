import request from "supertest";
import express from "express";
import prisma from "../utils/database";
import ressourcesRouter from "../routes/ressources";

jest.mock("../utils/database", () => ({
  __esModule: true,
  default: {
    ressource: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    sharedRessource: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use("/ressources", ressourcesRouter);

describe("Ressource API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /ressources - should return ressources", async () => {
    (prisma.ressource.findMany as jest.Mock).mockResolvedValue([{ id: "abc", title: "Test" }]);

    const res = await request(app).get("/ressources");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test("GET /ressources/public - should return public ressources", async () => {
    (prisma.ressource.findMany as jest.Mock).mockResolvedValue([{ id: "abc", title: "Public Test" }]);

    const res = await request(app).get("/ressources/public");
    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe("Public Test");
  });

  test("GET /ressources/:id - should return single ressource", async () => {
    (prisma.ressource.findFirst as jest.Mock).mockResolvedValue({ id: "abc", title: "Single" });

    const res = await request(app).get("/ressources/abc");
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Single");
  });

  test("POST /ressources - should create a ressource", async () => {
    (prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.ressource.create as jest.Mock).mockResolvedValue({ id: "abc", title: "Created" });

    const res = await request(app).post("/ressources").send({
      title: "Created",
      description: "Test desc",
      categoryId: 1,
      isActive: true,
      ressourceTypeId: 2,
      userId: "clerk123",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Created");
  });

  test("DELETE /ressources/:id - should delete ressource", async () => {
    (prisma.ressource.delete as jest.Mock).mockResolvedValue({});

    const res = await request(app).delete("/ressources/abc");
    expect(res.status).toBe(200);
  });

  test("PATCH /ressources/:id - should update ressource", async () => {
    (prisma.ressource.update as jest.Mock).mockResolvedValue({ id: "abc", title: "Updated" });

    const res = await request(app).patch("/ressources/abc").send({
      title: "Updated",
      description: "Updated desc",
      isActive: true,
      categoryId: 1,
    });

    expect(res.status).toBe(200);
  });

  test("POST /ressources/:id/share - should share ressource", async () => {
    (prisma.sharedRessource.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.sharedRessource.create as jest.Mock).mockResolvedValue({ userId: 1, ressourceId: "abc" });

    const res = await request(app).post("/ressources/abc/share").send({ userId: 1 });
    expect(res.status).toBe(201);
    expect(res.body.data.ressourceId).toBe("abc");
  });

  test("POST /ressources/:id/share - should prevent duplicate sharing", async () => {
    (prisma.sharedRessource.findUnique as jest.Mock).mockResolvedValue({ userId: 1, ressourceId: "abc" });

    const res = await request(app).post("/ressources/abc/share").send({ userId: 1 });
    expect(res.status).toBe(409);
  });
});
    