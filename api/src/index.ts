import "dotenv/config";
import express, { json } from "express";
import prisma from "./utils/database";
import ressources from "./routes/ressources";

import ressourceTypes from "./routes/ressourceTypes";
import comments from "./routes/comments";
import stats from "./routes/stats"
import users from "./routes/users";
import roles from "./routes/roles";
import categories from "./routes/categories";
import helmet from "helmet";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

async function main() {
  const app = express();
  const port = 3000;
  app.use(cors({
    origin: "*",
    credentials: true,
  }));
  app.use(express.json());
  app.use(helmet());
  app.use(express.urlencoded({ extended: false }));
  app.use(clerkMiddleware());

  // ROUTES
  app.use("/ressources", ressources);
  app.use("/ressourceTypes", ressourceTypes);
  app.use("/categories", categories);
  app.use("/users", users);
  app.use("/roles", roles);
  app.use("/categories", categories);
  app.use("/stats", stats);
  app.use("/comments", comments);

  app.listen(port, () => {
    console.log(`App running and listening on http://localhost:${port}`);
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
