import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import passport from "../config/passport.js";
import { authenticate } from "../middleware/auth.js";

// Inicializa el router
const router = Router()

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

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

router.post("/create-account",
    body('firstname').notEmpty().withMessage('El nombre es obligatorio'),
    body('lastname').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('E-mail no valido'),
    body('password').isLength({ min: 8 }).withMessage('El password es muy corto, minimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las constraseñas no coinciden')
        }
        return true
    }),
    handleInputErrors,
    AuthController.createAccount
)

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login` }),
    AuthController.sessionCallBack
);

router.get('/user',
    authenticate,
    AuthController.user
)

router.post('/logout', AuthController.logout)

export default router