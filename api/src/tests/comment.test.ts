import request from "supertest";
import express from "express";
import commentRouter from "../routes/comments";
import prisma from "../utils/database";

const app = express();
app.use(express.json());
app.use("/ressources/:ressourceId/comments", commentRouter);

jest.mock("../utils/database", () => ({
  __esModule: true,
  default: {
    comment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    commentLike: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("Comment API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /ressources/:ressourceId/comments - should return all comments for a ressource", async () => {
    (prisma.comment.findMany as jest.Mock).mockResolvedValue([{ id: "abc", content: "test" }]);
    const res = await request(app).get("/ressources/abc/comments");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  test("POST /ressources/:ressourceId/comments - should create a new comment", async () => {
    (prisma.comment.create as jest.Mock).mockResolvedValue({ id: "abc", content: "test" });
    const res = await request(app)
      .post("/ressources/abc/comments")
      .send({ authorId: 1, content: "test" });
    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe("test");
  });

  test("DELETE /ressources/:ressourceId/comments/:id - should delete a comment", async () => {
    (prisma.comment.delete as jest.Mock).mockResolvedValue({});
    const res = await request(app).delete("/ressources/abc/comments/123");
    expect(res.status).toBe(204);
  });

  test("PUT /ressources/:ressourceId/comments/:id - should update a comment", async () => {
    (prisma.comment.findFirst as jest.Mock).mockResolvedValue({ id: "abc" });
    (prisma.comment.update as jest.Mock).mockResolvedValue({ id: "abc", content: "updated" });
    const res = await request(app)
      .put("/ressources/abc/comments/123")
      .send({ content: "updated" });
    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe("updated");
  });

  test("POST /ressources/:ressourceId/comments/:id/like - should like a comment", async () => {
    (prisma.comment.findUnique as jest.Mock).mockResolvedValue({ id: "abc" });
    (prisma.commentLike.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.commentLike.create as jest.Mock).mockResolvedValue({});
    const res = await request(app)
      .post("/ressources/abc/comments/abc/like")
      .send({ userId: 1 });
    expect(res.status).toBe(201);
    expect(res.body.liked).toBe(true);
  });

  test("GET /ressources/:ressourceId/comments/:id/likes/count - should return likes count", async () => {
    (prisma.commentLike.count as jest.Mock).mockResolvedValue(3);
    const res = await request(app).get("/ressources/abc/comments/abc/likes/count");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
  });
});
