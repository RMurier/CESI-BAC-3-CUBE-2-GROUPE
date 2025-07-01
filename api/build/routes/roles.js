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
        const roles = yield database_1.default.role.findMany();
        res.status(200).json(roles);
    }
    catch (ex) {
        console.error(ex);
        res.status(500).json("Internal server error");
    }
}));
router.get("/:clerkId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clerkId = req.params.clerkId;
        const user = yield database_1.default.user.findFirst({ where: {
                clerkUserId: clerkId
            } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
        }
        res
            .status(200)
            .json({ user });
    }
    catch (e) {
        res
            .status(500)
            .json("Internal server error. Please contact an administrateur or IT service.");
    }
}));
exports.default = router;
