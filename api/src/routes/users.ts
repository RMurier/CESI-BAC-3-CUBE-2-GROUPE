import express from "express";
import prisma from "../utils/database";
import { User } from "@prisma/client";

const router = express.Router();

router.post<{}, any, User>("/", async (req, res) => {
  const { clerkUserId, email, name, roleId } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        clerkUserId,
        email,
        name,
        role: { connect: { id: roleId } },
      },
    });

    res.status(201).json({ data: newUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.get("/:clerkId", async (req, res) => {
  const id = req.params.clerkId;

  try {
    const user = await prisma.user.findFirst({
      where: {
        clerkUserId: id,
      },
    });

    res.status(200).json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

export default router;
