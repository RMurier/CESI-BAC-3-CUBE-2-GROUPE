import express from "express";
import prisma from "../utils/database";
import { requireAuth } from "@clerk/express";
import { checkRole } from "../middlewares/roleCheck";

const router = express.Router();

router.get(
  "/",
  requireAuth(),
  checkRole(["Admin"]) as any,
  async (req: any, res: any) => {
    try {
      const roles = await prisma.role.findMany();
      res.status(200).json(roles);
    } catch (ex) {
      console.error(ex);
      res.status(500).json("Internal server error");
    }
  }
);
router.get("/:clerkId", async (req, res) => {
  try {
    const clerkId = req.params.clerkId;
    const user = await prisma.user.findFirst({
      where: {
        clerkUserId: clerkId,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (e) {
    res
      .status(500)
      .json(
        "Internal server error. Please contact an administrateur or IT service."
      );
  }
});

export default router;
