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
router.get("/resources-by-category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, categoryId } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        if (categoryId) {
            where.categoryId = Number(categoryId);
        }
        const result = yield database_1.default.ressource.groupBy({
            by: ["categoryId"],
            _count: true,
            where,
        });
        const categories = yield database_1.default.category.findMany();
        const formatted = result.map((r) => {
            const category = categories.find((c) => c.id === r.categoryId);
            return {
                category: (category === null || category === void 0 ? void 0 : category.name) || "Inconnue",
                count: r._count,
            };
        });
        res.status(200).json(formatted);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
}));
router.get("/resources-by-date", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, categoryId } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        if (categoryId) {
            where.categoryId = Number(categoryId);
        }
        const ressources = yield database_1.default.ressource.findMany({ where });
        const grouped = {};
        ressources.forEach((r) => {
            const dateKey = new Date(r.createdAt).toISOString().slice(0, 7);
            grouped[dateKey] = (grouped[dateKey] || 0) + 1;
        });
        const data = Object.entries(grouped).map(([date, count]) => ({ date, count }));
        res.status(200).json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
}));
router.get("/user-count", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        const count = yield database_1.default.user.count({ where });
        res.status(200).json({ count });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur." });
    }
}));
exports.default = router;
