import { Router } from "express";
import { CommunityController } from "../controllers/communityController.js";
import { authenticate } from "../middleware/auth.js";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// CREATE - Publicar hábito nuevo en la comunidad
router.post("/",
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('descripcion')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
    body('categoria')
        .notEmpty().withMessage('La categoría es obligatoria')
        .isIn(['Estudio', 'Programación', 'Salud', 'Lectura', 'Otro']).withMessage('Categoría no válida'),
    handleInputErrors,
    CommunityController.publishHabit
);

// CREATE - Compartir un hábito existente desde "Mis Hábitos"
router.post("/share/:habitId",
    param('habitId')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    CommunityController.shareMyHabit
);

// CREATE - Copiar un hábito de la comunidad a "Mis Hábitos"
router.post("/:id/copy",
    param('id')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    CommunityController.copyToMyHabits
);

// READ - Obtener todos los hábitos de la comunidad (con filtros opcionales)
router.get("/", 
    CommunityController.getCommunityHabits
);

// READ - Obtener hábitos por categoría específica
router.get("/category/:categoria",
    param('categoria')
        .isIn(['Estudio', 'Programación', 'Salud', 'Lectura', 'Otro']).withMessage('Categoría no válida'),
    handleInputErrors,
    CommunityController.getHabitsByCategory
);

// READ - Obtener mis hábitos publicados
router.get("/my-habits", 
    CommunityController.getMyPublishedHabits
);

// READ - Obtener un hábito por ID
router.get("/:id",
    param('id')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    CommunityController.getHabitById
);

// UPDATE - Reaccionar a un hábito (corazón o like)
router.patch("/:id/react",
    param('id')
        .isMongoId().withMessage('ID no válido'),
    body('type')
        .isIn(['heart', 'like']).withMessage('Tipo de reacción no válido. Use "heart" o "like"'),
    handleInputErrors,
    CommunityController.toggleReaction
);

// UPDATE - Valorar un hábito (1-5 estrellas)
router.patch("/:id/rate",
    param('id')
        .isMongoId().withMessage('ID no válido'),
    body('stars')
        .isInt({ min: 1, max: 5 }).withMessage('La valoración debe ser entre 1 y 5'),
    handleInputErrors,
    CommunityController.rateHabit
);

// DELETE - Eliminar hábito publicado (solo el autor)
router.delete("/:id",
    param('id')
        .isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    CommunityController.deleteHabit
);

export default router;