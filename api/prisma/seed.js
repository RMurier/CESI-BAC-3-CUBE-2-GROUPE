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
const database_1 = __importDefault(require("../src/utils/database"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield database_1.default.category.create({
            data: {
                name: "Divers",
                description: "Contient des ressources diverses.",
            },
        });
        yield database_1.default.role.createMany({
            data: [
                { name: "Citoyen" },
                { name: "Modérateur" },
                { name: "Admin" },
                { name: "Super-Admin" },
            ],
        });
        yield database_1.default.ressourceType.createMany({
            data: [{ name: "Public" }, { name: "Privé" }],
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
