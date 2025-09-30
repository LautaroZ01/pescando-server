import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";

// Inicializa el router
const router = Router()

/**
 * Metodos de http
 * GET: Obtener datos
 * POST: Crear datos
 * PUT: Actualizar datos
 * PATCH: Actualizar datos parciales
 * DELETE: Borrar datos
 */
// Ruta de prueba
router.get("/", AuthController.authTest)

export default router