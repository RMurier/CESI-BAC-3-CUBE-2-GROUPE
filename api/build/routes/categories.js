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
const router = express_1.default.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield database_1.default.category.findMany();
        res.status(200).json({ data: categories });
    }
    catch (ex) {
        console.error(ex);
        res.status(500).json("Internal server error");
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const newCategory = yield database_1.default.category.create({
            data: {
                name,
                description,
            },
        });
        res.status(201).json({ data: newCategory });
    }
    catch (ex) {
        console.error(ex);
        res.status(500).json("Internal server error");
    }
}));
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { name, description } = req.body;
        const updated = yield database_1.default.category.update({
            where: { id },
            data: { name, description },
        });
        res.status(200).json(updated);
    }
    catch (ex) {
        console.error(ex);
        res.status(500).json("Internal server error");
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: "ID invalide." });
        return;
    }
    try {
        const related = yield database_1.default.ressource.findFirst({
            where: { categoryId: id },
        });
        if (related) {
            res.status(400).json({
                error: "Cette catégorie est liée à une ou plusieurs ressources.",
            });
            return;
        }
        yield database_1.default.category.delete({ where: { id } });
        res.status(200).json({ message: "Catégorie supprimée avec succès." });
    }
    catch (error) {
        console.error("Erreur lors de la suppression :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
}));
router.put("/:ressourceTypeId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.ressourceTypeId);
        const { name, description } = req.body;
        const updatedCategory = yield database_1.default.category.update({
            where: { id },
            data: { name, description },
        });
        res.status(200).json({
            message: `La catégorie ${id} a bien été mise-à-jour.`,
            data: updatedCategory,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.get("/:categoryId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.categoryId);
        const category = yield database_1.default.category.findFirst({
            where: { id },
        });
        if (!category) {
            res.status(404).json({ error: "Category not found" });
        }
        else {
            res.status(200).json({ data: category });
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.get("/:name/public", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.params.name;
    try {
        const category = yield database_1.default.category.findFirst({
            where: { name },
        });
        if (!category) {
            return res.status(404).json({ message: "Catégorie non trouvée" });
        }
        const ressources = yield database_1.default.ressource.findMany({
            where: {
                categoryId: category.id,
                ressourceType: {
                    name: {
                        equals: "Public", // Attention à la casse dans la base
                        mode: "insensitive",
                    },
                },
            },
            include: {
                category: true,
                ressourceType: true,
            },
        });
        return res.status(200).json({ data: ressources });
    }
    catch (err) {
        console.error("Erreur récupération ressources publiques :", err);
        return res.status(500).json({ message: "Erreur serveur", error: err });
    }
}));
router.get("/:name/accessible", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.params.name;
    const { clerkUserId } = req.query;
    if (typeof clerkUserId !== "string") {
        return res.status(400).json({ error: "clerkUserId requis sous forme de chaîne" });
    }
    try {
        const category = yield database_1.default.category.findFirst({
            where: { name },
        });
        if (!category) {
            return res.status(404).json({ message: "Catégorie non trouvée" });
        }
        const user = yield database_1.default.user.findUnique({
            where: { clerkUserId },
        });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }
        const ressources = yield database_1.default.ressource.findMany({
            where: {
                categoryId: category.id,
                OR: [
                    {
                        ressourceType: {
                            name: {
                                equals: "Public",
                                mode: "insensitive",
                            },
                        },
                    },
                    {
                        userId: user.id,
                    },
                    {
                        sharedWithUsers: {
                            some: { userId: user.id },
                        },
                    },
                ],
            },
            include: {
                category: true,
                ressourceType: true,
                user: true,
            },
        });
        return res.status(200).json({ data: ressources });
    }
    catch (err) {
        console.error("Erreur récupération ressources accessibles :", err);
        return res.status(500).json({ message: "Erreur serveur", error: err });
    }
}));
exports.default = router;
