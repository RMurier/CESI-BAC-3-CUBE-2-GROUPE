import "dotenv/config";
import express, { json } from "express";
import prisma from "./utils/database";
import ressources from "./routes/ressources";
import ressourceTypes from "./routes/ressourceTypes";
import categories from "./routes/categories";
import comments from "./routes/comments";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";

async function main() {
  const app = express();
  const port = 3000;

  app.use(express.json());
  app.use(helmet());
  app.use(express.urlencoded({ extended: false }));
  app.use(clerkMiddleware());

  // ROUTES
  app.use("/ressources", ressources);
  app.use("/ressourceTypes", ressourceTypes);
  app.use("/categories", categories);

  app.listen(port, () => {
    console.log(`App running and listening on http://127.0.0.1:${port}`);
  });
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
