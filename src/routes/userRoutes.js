import { Router } from "express"
import { authenticate } from "../middleware/auth.js"
import { UserController } from "../controllers/UserController.js"

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

router.put("/",
    authenticate,
    UserController.updateProfile
)

router.post(
    "/photo",
    authenticate,
    UserController.uploadPhoto
)

export default router
