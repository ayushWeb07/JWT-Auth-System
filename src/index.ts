import express from "express";
import morgan from "morgan";
import { bootstrapServer } from "./utils/server/bootstrap.server.ts";
import v1Router from "./routers/v1/index.router.ts";

// create server instance
const app = express();

// setup global middlewares
app.use(express.json());
app.use(morgan("dev"));

// setup version routes
app.use("/api/v1", v1Router);

// spin up the server + DB
bootstrapServer(app);
