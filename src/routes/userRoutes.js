import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { UserController } from "../controllers/UserController"

const router = Router()

/**
 * @route GET /api/user/
 * @desc Obtener el perfil del usuario autenticado
 * @access Privado (Requiere token/Cookie)
 */

router.get(
    "/",
    authenticate,
    UserController.getProfile
)

export default router
