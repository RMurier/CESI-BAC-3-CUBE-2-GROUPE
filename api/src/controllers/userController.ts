import { Request, Response } from "express";
import prisma from "../utils/database";

export const createUser = async (req: Request, res: Response) => {
  const { clerkUserId, email, name, roleId } = req.body;

  try {
    await prisma.user.create({
      data: {
        clerkUserId,
        email,
        name,
        role: { connect: { id: roleId } },
      },
    });

    const newUser = await prisma.user.findFirst({
      where: { clerkUserId },
      include: { role: true },
    });

    res.status(201).json({ data: newUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
};
