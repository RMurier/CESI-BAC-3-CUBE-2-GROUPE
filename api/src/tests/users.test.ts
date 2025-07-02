import request from "supertest";
import express from "express";
import usersRouter from "../routes/users";
import prisma from "../utils/database";

// Mock de Prisma
jest.mock("../utils/database", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use("/users", usersRouter);

describe("Users API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /users - should create a new user", async () => {
    const user = {
      id: 1,
      clerkUserId: "abc123",
      email: "test@test.com",
      name: "Test",
      roleId: "role1",
    };
    (prisma.user.create as jest.Mock).mockResolvedValue(user);

    const res = await request(app).post("/users").send(user);

    expect(res.status).toBe(201);
  });

  test("PATCH /users/role/:id - should update user role", async () => {
    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: 1,
      roleId: "new-role",
    });

    const res = await request(app)
      .patch("/users/role/1")
      .send({ roleId: "new-role" });

    expect(res.status).toBe(200);
    expect(res.body.roleId).toBe("new-role");
  });

  test("PATCH /users/desactivate/:id - should toggle activation", async () => {
    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: 1,
      isActivated: false,
    });

    const res = await request(app)
      .patch("/users/desactivate/1")
      .send({ isActivated: false });

    expect(res.status).toBe(200);
    expect(res.body.isActivated).toBe(false);
  });

  test("GET /users - should return all users", async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: "User", role: { id: "1", name: "Admin" } },
    ]);

    const res = await request(app).get("/users");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toHaveLength(1);
  });

  test("GET /users/:clerkId - should return a user by clerkId", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      clerkUserId: "abc123",
    });

    const res = await request(app).get("/users/abc123");

    expect(res.status).toBe(200);
    expect(res.body.data.clerkUserId).toBe("abc123");
  });

  test("GET /users - handles server error", async () => {
    (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error("fail"));

    const res = await request(app).get("/users");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal server error");
  });
});
