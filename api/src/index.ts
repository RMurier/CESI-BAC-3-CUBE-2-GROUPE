import "dotenv/config";
import express, { json } from "express";
import prisma from "./utils/database";
import ressources from "./routes/ressources";

import ressourceTypes from "./routes/ressourceTypes";
import comments from "./routes/comments";
import stats from "./routes/stats";
import users from "./routes/users";
import roles from "./routes/roles";
import categories from "./routes/categories";
import helmet from "helmet";
import cors from "cors";

async function main() {
  const app = express();
  const port = 3000;
  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(helmet());
  app.use(express.urlencoded({ extended: false }));

  const jwtSecret = process.env.JWT_SECRET;
  // ROUTES
  app.use("/ressources", ressources);
  app.use("/ressourceTypes", ressourceTypes);
  app.use("/users", users);
  app.use("/roles", roles);
  app.use("/categories", categories);
  app.use("/stats", stats);
  app.use("/comments", comments);

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`App running and listening on http://localhost:${port}`);
  });

  // app.use("*", (req, res) => {
  //   res.status(404).json({ error: "Endpoint not found" });
  // });
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
