import express from "express";
import dotenv from "dotenv";

import { corsConfig } from "./src/config/cors.js";

import authRoutes from "./src/routes/authRoutes.js";

// Configura para las variables de entorno
dotenv.config()

// Inicializa el servidor
const server = express()

// Configuracion para el cors
server.use(corsConfig())

// Configuracion para el body parser
server.use(express.json())

// Rutas
server.use("/api/auth", authRoutes)

export default server