import express, { Response, Request } from "express";
import prisma from "../utils/database";
import { TypedRequestBody } from "../types/express";
import { CommentEntity } from "../types/comment";

const router = express.Router({ mergeParams: true });

type RessourceParams = {
  ressourceId: string;
};

router.get("/", async (req, res) => {
  try {
    const { ressourceId } = req.params as RessourceParams;

    const comments = await prisma.comment.findMany({
      where: { ressourceId },
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
    const id = req.params.commentId;

    const comment = await prisma.comment.findFirst({
      include: { author: true },
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

    const { authorId, content, parentId } = req.body;

    console.log("AUTHOR ID", authorId);

    const data: any = {
      author: {
        connect: { id: authorId },
      },
      content,
      ressource: {
        connect: { id: ressourceId },
      },
    };

    // Only add parentId if it exists and is not null
    if (parentId) {
      data.parent = { connect: { id: parentId } };
    }
    const newComment = await prisma.comment.create({ data });

    res.status(200).json({ data: newComment });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error", details: e });
  }
});

router.delete("/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;

    const id = commentId;

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
    const id = commentId;

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

type CommentLike = {
  commentId: string;
  userId: number;
};
interface LikeCommentRequest extends Request {
  params: {
    commentId: string;
  };
  body: {
    userId: number;
  };
}

router.post(
  "/:commentId/like",
  async (req: LikeCommentRequest, res: Response) => {
    try {
      console.log("liking or disliking");

      const { commentId } = req.params;
      const userId = req.body.userId; // Assuming user ID is available from auth middleware

      // Check if comment exists
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
      }

      // Check if the user has already liked this comment
      const existingLike = await prisma.commentLike.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });

      let result;

      if (existingLike) {
        // If like exists, remove it (unlike)
        result = await prisma.commentLike.delete({
          where: {
            commentId_userId: {
              commentId,
              userId,
            },
          },
        });

        res.status(200).json({
          liked: false,
          message: "Comment unliked successfully",
        });
      } else {
        // If like doesn't exist, create it (like)
        result = await prisma.commentLike.create({
          data: {
            comment: { connect: { id: commentId } },
            user: { connect: { id: userId } },
          },
        });

        res.status(201).json({
          liked: true,
          message: "Comment liked successfully",
        });
      }
    } catch (error: any) {
      console.error("Error toggling comment like:", error);
      res.status(500).json({
        message: "Failed to process like operation",
        error: error.message,
      });
    }
  }
);

router.get(
  "/:commentId/likes/count",
  async (req: TypedRequestBody<{ commentId: string }>, res) => {
    try {
      const { commentId } = req.params;

      const likesCount = await prisma.commentLike.count({
        where: { commentId },
      });

      res.status(200).json({ count: likesCount });
    } catch (error: any) {
      console.error("Error getting comment likes count:", error);
      res.status(500).json({
        message: "Failed to get likes count",
        error: error.message,
      });
    }
  }
);

export default router;
