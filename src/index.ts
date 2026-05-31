import express from "express"
import morgan from "morgan"

// create server instance
const app= express()

// setup global middlewares
app.use(express.json())
app.use(morgan("dev"))