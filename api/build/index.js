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
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("./utils/database"));
const ressources_1 = __importDefault(require("./routes/ressources"));
const ressourceTypes_1 = __importDefault(require("./routes/ressourceTypes"));
const comments_1 = __importDefault(require("./routes/comments"));
const stats_1 = __importDefault(require("./routes/stats"));
const users_1 = __importDefault(require("./routes/users"));
const roles_1 = __importDefault(require("./routes/roles"));
const categories_1 = __importDefault(require("./routes/categories"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_2 = require("@clerk/express");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        const port = 3000;
        app.use((0, cors_1.default)({
            origin: "*",
            credentials: true,
        }));
        app.use(express_1.default.json());
        app.use((0, helmet_1.default)());
        app.use(express_1.default.urlencoded({ extended: false }));
        app.use((0, express_2.clerkMiddleware)());
        // ROUTES
        app.use("/ressources", ressources_1.default);
        app.use("/ressourceTypes", ressourceTypes_1.default);
        app.use("/categories", categories_1.default);
        app.use("/users", users_1.default);
        app.use("/roles", roles_1.default);
        app.use("/categories", categories_1.default);
        app.use("/stats", stats_1.default);
        app.use("/comments", comments_1.default);
        app.listen(port, '0.0.0.0', () => {
            console.log(`App running and listening on http://localhost:${port}`);
        });
        app.get("/", (req, res) => {
            res.send("Hello World!");
        });
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield database_1.default.$disconnect();
    process.exit(1);
}));
