import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController.js";
import { authenticate, checkRole } from "../middleware/auth.js";
import { handleInputErrors } from "../middleware/validation.js";
import { body, param } from "express-validator";

const router = Router();

// Validación personalizada para código hexadecimal de color
const isValidHexColor = (value) => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(value)) {
        throw new Error('El color debe ser un código hexadecimal válido (ej: #FF5733)');
    }
    return true;
};

// POST /api/category - Crear categoría (solo admin)
router.post('/',
    authenticate,
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio')
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('description')
        .notEmpty().withMessage('La descripción es obligatoria')
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('La descripción debe tener entre 5 y 200 caracteres'),
    body('color')
        .notEmpty().withMessage('El color es obligatorio')
        .trim()
        .custom(isValidHexColor),
    body('icon')
        .trim(),
    handleInputErrors,
    CategoryController.createCategory
);

// GET /api/category - Obtener todas las categorías (público)
router.get('/',
    CategoryController.getAllCategories
);

// GET /api/category/user - Obtener todas las categorías (público)
router.get('/user',
    authenticate,
    CategoryController.getAllCategoriesByUser
);

// GET /api/category/:id - Obtener categoría por ID (público)
router.get('/:id',
    param('id')
        .isMongoId().withMessage('ID de categoría no válido'),
    handleInputErrors,
    CategoryController.getCategoryById
);

// PUT /api/category/:id - Actualizar categoría (solo admin)
router.put('/:id',
    authenticate,
    param('id')
        .isMongoId().withMessage('ID de categoría no válido'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('La descripción debe tener entre 5 y 200 caracteres'),
    body('color')
        .optional()
        .trim()
        .custom(isValidHexColor),
    body('icon')
        .optional()
        .trim(),
    handleInputErrors,
    CategoryController.updateCategory
);

// DELETE /api/category/:id - Eliminar categoría (solo admin)
router.delete('/:id',
    authenticate,
    checkRole(['admin', 'user']),
    param('id')
        .isMongoId().withMessage('ID de categoría no válido'),
    handleInputErrors,
    CategoryController.deleteCategory
);

export default router;
