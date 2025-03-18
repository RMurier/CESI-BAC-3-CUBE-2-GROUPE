import "dotenv/config";
import express, { json } from "express";
import { rateLimit } from "express-rate-limit";
// import users from "./routes/users";
// import articles from "./routes/articles";
import prisma from "./utils/database";
// import auth from "./routes/auth";
import helmet from "helmet";
import "./utils/passport";
import passport from "passport";
import { clerkMiddleware } from "@clerk/express";

async function main() {
  const app = express();
  const port = 3000;

  app.use(passport.initialize());
  app.use(express.json());
  app.use(helmet());
  // app.use('/users', users);
  // app.use('/articles', articles);
  app.use(express.urlencoded({ extended: false }));
  app.use(clerkMiddleware());

  // app.use("/users", passport.authenticate("jwt", { session: false }), users);
  // app.use('/auth', auth);

  app.listen(port, () => {
    console.log(`App running and listening on http://127.0.0.1:${port}`);
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
