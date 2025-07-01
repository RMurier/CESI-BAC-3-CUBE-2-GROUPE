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
        const ressourceTypes = yield database_1.default.ressourceType.findMany();
        if (ressourceTypes && ressourceTypes.length > 0)
            res.status(200).json({ data: ressourceTypes });
        else
            res.status(404).json({ message: "No ressource types found." });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.get("/:ressourceTypeId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.ressourceTypeId);
        const ressourceType = yield database_1.default.ressourceType.findFirst({
            where: { id },
        });
        if (!ressourceType) {
            res.status(400).json({ error: "Ressource type not found" });
        }
        else {
            res.status(200).json({ data: ressourceType });
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const newRessourceType = yield database_1.default.ressourceType.create({
            data: {
                name,
            },
        });
        res.status(201).json({ data: newRessourceType });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.delete("/:ressourceTypeId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.ressourceTypeId);
        const ressourceType = yield database_1.default.ressourceType.findFirst({
            where: { id },
        });
        if (!ressourceType)
            res.status(404).json({ error: "Ressource type not found." });
        yield database_1.default.ressourceType.update({
            where: { id },
            data: { isActive: !ressourceType.isActive },
        });
        res.status(204).json({
            message: `Le type de ressource (id:${id}) a été supprimé avec succès.`,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.put("/:ressourceTypeId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.ressourceTypeId);
        const { name, isActive } = req.body;
        const updatedRessourceType = yield database_1.default.ressourceType.update({
            where: { id },
            data: { name, isActive },
        });
        res.status(200).json({
            message: `Le type de ressource ${id} a bien été mis-à-jour.`,
            data: updatedRessourceType,
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
exports.default = router;
