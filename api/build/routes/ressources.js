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
const comments_1 = __importDefault(require("./comments"));
const router = express_1.default.Router();
router.use("/:ressourceId/comments", comments_1.default);
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ressources = yield database_1.default.ressource.findMany({
            include: {
                category: true,
                ressourceType: true,
            },
        });
        if (ressources && ressources.length > 0)
            res.status(200).json({ data: ressources });
        else
            res.status(404).json({ message: "No ressources found." });
    }
    catch (e) {
        res
            .status(500)
            .json("Internal server error. Please contact an administrateur or IT service.");
    }
}));
router.get("/accessible", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clerkUserId } = req.query;
    if (!clerkUserId) {
        return res.status(400).json({ error: "clerkUserId requis dans les paramètres." });
    }
    try {
        const user = yield database_1.default.user.findUnique({
            where: { clerkUserId },
        });
        if (!user) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }
        const ressources = yield database_1.default.ressource.findMany({
            where: {
                OR: [
                    { ressourceType: { name: "Public" } },
                    { userId: user.id },
                    { sharedWithUsers: { some: { userId: user.id } } },
                ],
            },
            include: {
                category: true,
                ressourceType: true,
                user: {
                    select: { id: true, name: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return res.status(200).json({ data: ressources });
    }
    catch (error) {
        console.error("Erreur récupération ressources accessibles :", error);
        return res.status(500).json({ error: "Erreur interne du serveur", details: error });
    }
}));
router.get("/public", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ressources = yield database_1.default.ressource.findMany({
            where: {
                ressourceType: {
                    name: "Public",
                },
            },
            include: {
                category: true,
                ressourceType: true,
                user: {
                    select: { id: true, name: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json({ data: ressources });
    }
    catch (error) {
        console.error("Erreur lors de la récupération des ressources publiques :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des ressources publiques." });
    }
}));
router.get("/:ressourceId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.ressourceId;
        const ressource = yield database_1.default.ressource.findFirst({
            where: { id },
            include: {
                category: true,
                ressourceType: true,
            },
        });
        if (ressource)
            res.status(200).json({ data: ressource });
        else
            res.status(404).json({ message: "Ressource not found." });
    }
    catch (e) {
        res
            .status(500)
            .json("Internal server error. Please contact an administrateur or IT service.");
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, categoryId, isActive, ressourceTypeId, userId } = req.body;
    try {
        const category = yield database_1.default.category.findFirst({
            where: { id: Number(categoryId) },
        });
        if (!category) {
            res.status(400).json({ error: "Category not found" });
            return;
        }
        const newRessource = yield database_1.default.ressource.create({
            data: {
                title,
                description,
                user: {
                    connect: { clerkUserId: userId },
                },
                ressourceType: {
                    connect: { id: ressourceTypeId },
                },
                category: {
                    connect: { id: Number(categoryId) },
                },
                isActive,
            },
        });
        res.status(201).json({ data: newRessource });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        yield database_1.default.ressource.delete({
            where: {
                id: id,
            },
        });
        res.status(200).json("Ressource supprimée avec succès.");
    }
    catch (e) {
        console.log(e);
        res.status(500).json("Internal server error");
    }
}));
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { title, description, isActive, categoryId } = req.body;
    try {
        const updated = yield database_1.default.ressource.update({
            where: { id },
            data: {
                title,
                description,
                isActive,
                categoryId,
            },
            include: {
                category: true,
            },
        });
        res.status(200).json(updated);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur lors de la modification" });
    }
}));
router.post("/:id/share", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: "userId requis" });
    }
    try {
        const existing = yield database_1.default.sharedRessource.findUnique({
            where: {
                userId_ressourceId: {
                    userId,
                    ressourceId: id,
                },
            },
        });
        if (existing) {
            return res.status(409).json({ error: "Déjà partagé avec cet utilisateur" });
        }
        const shared = yield database_1.default.sharedRessource.create({
            data: {
                userId,
                ressourceId: id,
            },
        });
        return res.status(201).json({ data: shared });
    }
    catch (e) {
        console.error("Erreur de partage :", e);
        return res.status(500).json({ error: "Erreur serveur", details: e });
    }
}));
exports.default = router;
