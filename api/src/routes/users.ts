import express from "express";
import prisma from "../utils/database";
import { User } from "@prisma/client";
import { startSession } from "mongoose";

const router = express.Router();

router.post<{}, any, User>("/", async (req, res) => {
  const { clerkUserId, email, name } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        clerkUserId,
        email,
        name
      },
    });

    res.status(201).json({ data: newUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.patch("/role/:id", async (req, res) => {
  const userId = req.params.id;
  const newRoleId = req.body.roleId;

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { roleId: newRoleId },
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
      data : {
        isActivated: isActivated,
      }
    })

    res.status(200).json(user);
  }
  catch (ex) {
    console.error(ex);
    res.status(500).json("Internal server error");
  }
})

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.status(200).json(users);
  }
  catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Internal server error", details: ex });
  }
})

router.get("/:clerkId", async (req, res) => {
  const id = req.params.clerkId;

  try {
    const user = await prisma.user.findFirst({
      where: {
        clerkUserId: id
      }
    });

    res.status(200).json(user);
  }
  catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
})

export default router;
