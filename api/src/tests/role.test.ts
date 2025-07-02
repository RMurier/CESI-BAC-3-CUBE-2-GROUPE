import request from "supertest";
import express from "express";
import roleRouter from "../routes/roles";
import prisma from "../utils/database";

const app = express();
app.use(express.json());
app.use("/roles", roleRouter);

// Mock Prisma
jest.mock("../utils/database", () => ({
  __esModule: true,
  default: {
    role: {
      findMany: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
  },
}));

describe("Role API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /roles - should return all roles", async () => {
    (prisma.role.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: "Admin" },
    ]);

    const res = await request(app).get("/roles");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Admin");
  });

  test("GET /roles/:clerkId - should return a user with a role", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      clerkUserId: "abc123",
      roleId: 1,
      name: "John",
    });

    const res = await request(app).get("/roles/abc123");
    expect(res.status).toBe(200);
    expect(res.body.user.clerkUserId).toBe("abc123");
  });

  test("GET /roles/:clerkId - should return 404 if user not found", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get("/roles/unknown");
    expect(res.status).toBe(404);
  });
});
