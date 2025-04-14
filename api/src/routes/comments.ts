import express, { response } from "express";
import prisma from "../utils/database";
import { TypedRequestBody } from "../types/express";
import { CommentEntity } from "../types/comment";
import { connect } from "mongoose";

const router = express.Router({ mergeParams: true });

type RessourceParams = {
  ressourceId: string;
};

router.get("/", async (req, res) => {
  try {
    const { ressourceId } = req.params as RessourceParams;
    const parsedRessourceId = parseInt(ressourceId);

    const comments = await prisma.comment.findMany({
      where: { ressourceId: parsedRessourceId },
      include: { author: true },
    });

    res.status(200).json({ data: comments });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.get("/:commentId", async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const id = parseInt(commentId);

    const comment = await prisma.comment.findFirst({
      where: { id },
    });

    if (!comment)
      res
        .status(404)
        .json({ message: `Le commentaire (id:${id}) est introuvable.` });
    else res.status(200).json({ data: comment });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.post("/", async (req: TypedRequestBody<CommentEntity>, res) => {
  try {
    const { ressourceId } = req.params;
    const ressourceIdParsed = parseInt(ressourceId);

    const { authorId, content } = req.body as {
      authorId: string;
      content: string;
    };
    console.log("AUTHOR ID", authorId);
    const newComment = await prisma.comment.create({
      data: {
        author: {
          connect: { clerkUserId: authorId },
        },
        content,
        ressource: {
          connect: { id: ressourceIdParsed },
        },
      },
    });

    res.status(200).json({ data: newComment });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.delete("/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;

    const id = parseInt(commentId);

    await prisma.comment.delete({
      where: { id },
    });

    res.status(204).json({
      message: `Le commentaire (id:${id}) a été supprimé avec succès.`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.put("/:commentId", async (req: TypedRequestBody<CommentEntity>, res) => {
  try {
    const { commentId } = req.params;
    const id = parseInt(commentId);

    const comment = await prisma.comment.findFirst({
      where: { id },
    });

    const { content } = req.body;

    if (!comment)
      res
        .status(404)
        .json({ message: `Le commentaire (id:${id}) est introuvable.` });

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content,
      },
    });

    res.status(200).json({
      message: `Le commentaire (id:${id}) a bien été mise-à-jour.`,
      data: updatedComment,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

export default router;
