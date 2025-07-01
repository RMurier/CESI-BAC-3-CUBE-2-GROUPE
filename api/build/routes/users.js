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
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clerkUserId, email, name, roleId } = req.body;
    try {
        const newUser = yield database_1.default.user.create({
            data: {
                clerkUserId,
                email,
                name,
                role: { connect: { id: roleId } },
            },
        });
        res.status(201).json({ data: newUser });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
router.patch("/role/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const newRoleId = req.body.roleId;
    try {
        const user = yield database_1.default.user.update({
            where: { id: parseInt(userId) },
            data: { roleId: newRoleId },
        });
        res.status(200).json(user);
    }
    catch (ex) {
        console.error(ex);
        res.status(500).json("Internal server error");
    }
}));
router.patch("/desactivate/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = yield req.params.id;
    const isActivated = yield req.body.isActivated;
    try {
        const user = yield database_1.default.user.update({
            where: {
                id: parseInt(userId),
            },
            data: {
                isActivated: isActivated,
            },
        });
        res.status(200).json(user);
    }
    catch (ex) {
        console.error(ex);
        res.status(500).json("Internal server error");
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield database_1.default.user.findMany({
            include: {
                role: true,
            },
        });
        res.status(200).json({ data: users });
    }
    catch (ex) {
        console.error(ex);
        res.status(500).json({ error: "Internal server error", details: ex });
    }
}));
router.get("/:clerkId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.clerkId;
    try {
        const user = yield database_1.default.user.findFirst({
            where: {
                clerkUserId: id,
            },
        });
        res.status(200).json({ data: user });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error", details: e });
    }
}));
exports.default = router;
