import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";

import { corsConfig } from "./src/config/cors.js";

import authRoutes from "./src/routes/authRoutes.js";
import habitRoutes from "./src/routes/habitRoutes.js";
import habitRoutes from "./src/routes/habitRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import communityRoutes from "./src/routes/communityRoutes.js";
import { connectDB } from "./src/config/db.js";
import cookieParser from "cookie-parser";
import passport from "passport";

// Configura para las variables de entorno
dotenv.config()

// Conectar a la base de datos
connectDB()

// Inicializa el servidor
const app = express()

// Configuracion para el cookie parser
app.use(cookieParser());

// Configuracion para el cors - revisar que funcione
app.use(corsConfig())

// Configuracion para passport
app.use(passport.initialize());

// Logging
app.use(morgan('dev'))

// Configuracion para el body parser
app.use(express.json())


// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/habits", habitRoutes); 
app.use("/api/habits", habitRoutes); 
app.use("/api/category", categoryRoutes)
app.use("/api/community", communityRoutes)

export default app;