import { Router } from "express";
import { HabitController } from "../controllers/habitController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// HÁBITOS
router.post("/", HabitController.createHabit);
router.get("/", HabitController.getHabits);
router.get("/stats", HabitController.getStats);
router.get("/graph-data", HabitController.getGraphData)
router.get("/category-distribution", HabitController.getCategoryDistribution)
router.get("/streaks-data", HabitController.getStreaksData)
router.get("/category-performance", HabitController.getCategoryPerformance)
router.get("/history-stats", HabitController.getHistoryStats)
router.get("/:id", HabitController.getHabitById);
router.put("/:id", HabitController.updateHabit);
router.delete("/:id", HabitController.deleteHabit);

// TAREAS dentro de un hábito
router.patch("/:habitId/tasks/:taskId/toggle", HabitController.toggleTask);
router.delete("/:habitId/tasks/:taskId", HabitController.deleteTask);


export default router;
