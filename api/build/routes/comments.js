"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../utils/database"));
const router = express_1.default.Router({ mergeParams: true });
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ressourceId } = req.params;
        const comments = yield database_1.default.comment.findMany({
            where: { ressourceId },
            include: { author: true },
        });
        res.status(200).json({ data: comments });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.get("/:commentId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.commentId;
        const comment = yield database_1.default.comment.findFirst({
            include: { author: true },
            where: { id },
        });
        if (!comment)
            res
                .status(404)
                .json({ message: `Le commentaire (id:${id}) est introuvable.` });
        else
            res.status(200).json({ data: comment });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ressourceId } = req.params;
        const { authorId, content, parentId } = req.body;
        console.log("AUTHOR ID", authorId);
        const data = {
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
        const newComment = yield database_1.default.comment.create({ data });
        res.status(200).json({ data: newComment });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.delete("/:commentId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { commentId } = req.params;
        const id = commentId;
        yield database_1.default.comment.delete({
            where: { id },
        });
        res.status(204).json({
            message: `Le commentaire (id:${id}) a été supprimé avec succès.`,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.put("/:commentId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { commentId } = req.params;
        const id = commentId;
        const comment = yield database_1.default.comment.findFirst({
            where: { id },
        });
        const { content } = req.body;
        if (!comment)
            res
                .status(404)
                .json({ message: `Le commentaire (id:${id}) est introuvable.` });
        const updatedComment = yield database_1.default.comment.update({
            where: { id },
            data: {
                content,
            },
        });
        res.status(200).json({
            message: `Le commentaire (id:${id}) a bien été mise-à-jour.`,
            data: updatedComment,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.post("/:commentId/like", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("liking or disliking");
        const { commentId } = req.params;
        const userId = req.body.userId; // Assuming user ID is available from auth middleware
        // Check if comment exists
        const comment = yield database_1.default.comment.findUnique({
            where: { id: commentId },
        });
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
        }
        // Check if the user has already liked this comment
        const existingLike = yield database_1.default.commentLike.findUnique({
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
            result = yield database_1.default.commentLike.delete({
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
        }
        else {
            // If like doesn't exist, create it (like)
            result = yield database_1.default.commentLike.create({
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
    }
    catch (error) {
        console.error("Error toggling comment like:", error);
        res.status(500).json({
            message: "Failed to process like operation",
            error: error.message,
        });
    }
}));
router.get("/:commentId/likes/count", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { commentId } = req.params;
        const likesCount = yield database_1.default.commentLike.count({
            where: { commentId },
        });
        res.status(200).json({ count: likesCount });
    }
    catch (error) {
        console.error("Error getting comment likes count:", error);
        res.status(500).json({
            message: "Failed to get likes count",
            error: error.message,
        });
    }
}));
exports.default = router;
