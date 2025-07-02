import request from "supertest";
import express from "express";
import ressourceTypeRouter from "../routes/ressourceTypes";
import prisma from "../utils/database";

const app = express();
app.use(express.json());
app.use("/ressourcetypes", ressourceTypeRouter);

jest.mock("../utils/database", () => ({
  __esModule: true,
  default: {
    ressourceType: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("RessourceType API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /ressourcetypes - should return all types", async () => {
    (prisma.ressourceType.findMany as jest.Mock).mockResolvedValue([{ id: 1, name: "Public", isActive: true }]);

    const res = await request(app).get("/ressourcetypes");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  test("GET /ressourcetypes/:id - should return one type", async () => {
    (prisma.ressourceType.findFirst as jest.Mock).mockResolvedValue({ id: 1, name: "Public", isActive: true });

    const res = await request(app).get("/ressourcetypes/1");
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Public");
  });

  test("GET /ressourcetypes/:id - should return 400 if not found", async () => {
    (prisma.ressourceType.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get("/ressourcetypes/1");
    expect(res.status).toBe(400);
  });

  test("POST /ressourcetypes - should create a new type", async () => {
    const newType = { id: 2, name: "Privé", isActive: true };
    (prisma.ressourceType.create as jest.Mock).mockResolvedValue(newType);

    const res = await request(app).post("/ressourcetypes").send({ name: "Privé" });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Privé");
  });

  test("PUT /ressourcetypes/:id - should update type", async () => {
    const updated = { id: 1, name: "Updated", isActive: false };
    (prisma.ressourceType.update as jest.Mock).mockResolvedValue(updated);

    const res = await request(app).put("/ressourcetypes/1").send({ name: "Updated", isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated");
  });

  test("DELETE /ressourcetypes/:id - should soft-delete", async () => {
    (prisma.ressourceType.findFirst as jest.Mock).mockResolvedValue({ id: 1, isActive: true });
    (prisma.ressourceType.update as jest.Mock).mockResolvedValue({ id: 1, isActive: false });

    const res = await request(app).delete("/ressourcetypes/1");
    expect(res.status).toBe(204);
  });
});
