import { Router } from "express";
import { HabitController } from "../controllers/habitController.js";
// import { authenticate } from "../middleware/auth.js"; // Cuando tengas auth

const router = Router();

// CREATE - Crear hábito
router.post("/", HabitController.createHabit);

// READ - Obtener todos los hábitos
router.get("/", HabitController.getHabits);

// READ - Obtener un hábito por ID
router.get("/:id", HabitController.getHabitById);

// UPDATE - Actualizar hábito
router.put("/:id", HabitController.updateHabit);

// DELETE - Eliminar hábito
router.delete("/:id", HabitController.deleteHabit);

// EXTRA - Marcar como completado
router.patch("/:id/complete", HabitController.markAsComplete);

export default router;