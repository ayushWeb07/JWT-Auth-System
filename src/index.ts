import express from "express"
import morgan from "morgan"
import {bootstrapServer} from "./utils/server/bootstrap.server.ts";

// create server instance
const app= express()

// setup global middlewares
app.use(express.json())
app.use(morgan("dev"))

// spin up the server + DB
bootstrapServer(app)