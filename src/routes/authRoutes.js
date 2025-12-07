import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authenticate } from "../middleware/auth.js";
import passport from "../services/google.js";
import { handleInputErrors } from "../middleware/validation.js";
import { body } from "express-validator";

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

router.get("/me", AuthController.getCurrentUser);

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login` }),
    AuthController.sessionCallBack
);

router.post('/login',
    body('email').isEmail().withMessage('E-mail no valido'),
    body('password').notEmpty().withMessage('El password es obligatorio'),
    handleInputErrors,
    AuthController.login
)

router.get('/logout', AuthController.logout)

router.get('/user',
    authenticate,
    AuthController.user
)

router.post('/request-code',
    body('email').isEmail().withMessage('E-mail no valido'),
    handleInputErrors,
    AuthController.requestConfirmationCode
)

router.post('/confirm-account',
    body('token').notEmpty().withMessage('El Token es obligatorio'),
    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/validate-token',
    body('token').notEmpty().withMessage('El Token es obligatorio'),
    handleInputErrors,
    AuthController.validateToken
)

export default router