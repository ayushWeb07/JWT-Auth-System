import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { bootstrapServer } from "./utils/server/bootstrap.server.ts";
import v1Router from "./routers/v1/index.router.ts";
import { errorHandler } from "./middlewares/error.middleware.ts";

// create server instance
const app = express();

// setup global middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// setup version routes
app.use("/api/v1", v1Router);

// setup the error middleware
app.use(errorHandler);

// spin up the server + DB
bootstrapServer(app);
