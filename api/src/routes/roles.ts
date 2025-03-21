import express, { Request, Response } from "express";
import prisma from "../utils/database";

const router = express.Router();

router.get("/:clerkId", async (req, res) => {
    try {
        const clerkId = req.params.clerkId;
        const user = await prisma.user.findFirst({where: {
            clerkUserId: clerkId
        }});

        if (!user) {
            res.status(404).json({ error: "User not found" });
          }        

          res
        .status(200)
        .json({user});
    } catch (e) {
        res
            .status(500)
            .json(
                "Internal server error. Please contact an administrateur or IT service."
            );
    }

});