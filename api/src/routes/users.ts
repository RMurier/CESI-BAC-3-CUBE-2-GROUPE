import express from "express";
import prisma from "../utils/database";
import { User } from "@prisma/client";
import { createUser } from "../controllers/userController";

const router = express.Router();

router.post<{}, any, User>("/", createUser);

router.patch("/role/:id", async (req, res) => {
  const userId = req.params.id;
  const newRoleId = req.body.roleId;

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { roleId: newRoleId },
      include: { role: true },
    });

    res.status(200).json(user);
  } catch (ex) {
    console.error(ex);
    res.status(500).json("Internal server error");
  }
});

router.patch("/desactivate/:id", async (req, res) => {
  const userId = await req.params.id;
  const isActivated = await req.body.isActivated;
  try {
    const user = await prisma.user.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        isActivated: isActivated,
      },
    });

    res.status(200).json(user);
  } catch (ex) {
    console.error(ex);
    res.status(500).json("Internal server error");
  }
});

router.get("/", async (req, res) => {
  console.log("Route called:", req.method, req.url);

  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
    });

    console.log("Success, sending response");
    res.status(200).json({ data: users });
  } catch (ex: any) {
    console.error("Error in route:", ex);
    console.log("Sending error response");

    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Internal server error", details: ex.message });
    } else {
      console.log("Response already sent!");
    }
  }
});

router.get("/:clerkId", async (req, res) => {
  const id = req.params.clerkId;

  try {
    const user = await prisma.user.findFirst({
      where: {
        clerkUserId: id,
      },
      include: { role: true },
    });

    res.status(200).json({ data: user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

export default router;
