// src/controllers/habitController.js
import Habit from '../models/Habit.js';

export class HabitController {
    // POST /api/habits
    static async createHabit(req, res) {
        try {
            const userId = req.user._id || req.user.id;
            const { nombre, categoria, tareas } = req.body;

            if (!nombre || !categoria || !Array.isArray(tareas) || tareas.length === 0) {
                return res.status(400).json({
                    error: 'Nombre, categoría y al menos una tarea son obligatorios',
                });
            }

            const tareasDocs = tareas.map((t) => ({
                titulo: t,
                completado: false,
                diasConsecutivos: 0,
            }));

            const habit = await Habit.create({
                user: userId,
                nombre,
                categoria,
                tareas: tareasDocs,
            });

            res.status(201).json({ habit });
        } catch (error) {
            console.error('Error createHabit:', error);
            res.status(500).json({
                error: 'Error al crear hábito',
                details: error.message,
            });
        }
    }

    // GET /api/habits
    static async getHabits(req, res) {
        try {
            const userId = req.user._id || req.user.id;

            const habits = await Habit.find({ user: userId }).sort({ createdAt: -1 });

            res.json({ habits });
        } catch (error) {
            console.error('Error getHabits:', error);
            res.status(500).json({
                error: 'Error al obtener hábitos',
                details: error.message,
            });
        }
    }

    // GET /api/habits/:id
    static async getHabitById(req, res) {
        try {
            const userId = req.user._id || req.user.id;
            const { id } = req.params;

            const habit = await Habit.findOne({ _id: id, user: userId });

            if (!habit) {
                return res.status(404).json({ error: 'Hábito no encontrado' });
            }

            res.json({ habit });
        } catch (error) {
            console.error('Error getHabitById:', error);
            res.status(500).json({
                error: 'Error al obtener hábito',
                details: error.message,
            });
        }
    }

    // PUT /api/habits/:id
    static async updateHabit(req, res) {
        try {
            const userId = req.user._id || req.user.id;
            const { id } = req.params;
            const { nombre, categoria, tareas } = req.body;

            const habit = await Habit.findOne({ _id: id, user: userId });

            if (!habit) {
                return res.status(404).json({ error: 'Hábito no encontrado' });
            }

            if (typeof nombre === 'string' && nombre.trim() !== '') {
                habit.nombre = nombre.trim();
            }

            if (typeof categoria === 'string' && categoria.trim() !== '') {
                habit.categoria = categoria.trim();
            }

            // 👉 Si viene un array de tareas, reemplazamos las actuales
            if (Array.isArray(tareas) && tareas.length > 0) {
                const tareasLimpias = tareas
                    .map((t) => t && t.toString().trim())
                    .filter(Boolean);

                habit.tareas = tareasLimpias.map((t) => ({
                    titulo: t,
                    completado: false,       // se reinicia estado
                    diasConsecutivos: 0,     // se reinicia racha
                }));
            }

            await habit.save();

            res.json({
                message: 'Hábito actualizado exitosamente',
                habit,
            });
        } catch (error) {
            console.error('Error updateHabit:', error);
            res.status(500).json({
                error: 'Error al actualizar el hábito',
                details: error.message,
            });
        }
    }

    // DELETE /api/habits/:id
    static async deleteHabit(req, res) {
        try {
            const userId = req.user._id || req.user.id;
            const { id } = req.params;

            await Habit.deleteOne({ _id: id, user: userId });

            res.json({ message: 'Hábito eliminado' });
        } catch (error) {
            console.error('Error deleteHabit:', error);
            res.status(500).json({
                error: 'Error al eliminar hábito',
                details: error.message,
            });
        }
    }

    // PATCH /api/habits/:habitId/tasks/:taskId/toggle
    static async toggleTask(req, res) {
        try {
            const userId = req.user._id || req.user.id;
            const { habitId, taskId } = req.params;

            const habit = await Habit.findOne({ _id: habitId, user: userId });

            if (!habit) {
                return res.status(404).json({ error: 'Hábito no encontrado' });
            }

            const task = habit.tareas.id(taskId);
            if (!task) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            task.completado = !task.completado;
            // TODO: acá podés actualizar diasConsecutivos según la fecha

            await habit.save();

            res.json({ habit });
        } catch (error) {
            console.error('Error toggleTask:', error);
            res.status(500).json({
                error: 'Error al actualizar tarea',
                details: error.message,
            });
        }
    }

    // DELETE /api/habits/:habitId/tasks/:taskId
    static async deleteTask(req, res) {
        try {
            const userId = req.user._id || req.user.id;
            const { habitId, taskId } = req.params;

            const habit = await Habit.findOne({ _id: habitId, user: userId });

            if (!habit) {
                return res.status(404).json({ error: 'Hábito no encontrado' });
            }

            const task = habit.tareas.id(taskId);
            if (!task) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            task.deleteOne();
            await habit.save();

            // si no quedan tareas, podés borrar el hábito completo
            if (!habit.tareas.length) {
                await Habit.deleteOne({ _id: habitId, user: userId });
                return res.json({ habit: null });
            }

            res.json({ habit });
        } catch (error) {
            console.error('Error deleteTask:', error);
            res.status(500).json({
                error: 'Error al eliminar tarea',
                details: error.message,
            });
        }
    }

    // GET /api/habits/stats
    static async getStats(req, res) {
        try {
            const userId = req.user._id || req.user.id;
            const habits = await Habit.find({ user: userId });

            const totalHabits = habits.length;

            const totalTasks = habits.reduce(
                (sum, h) => sum + h.tareas.length,
                0
            );

            const completedTasks = habits.reduce(
                (sum, h) => sum + h.tareas.filter((t) => t.completado).length,
                0
            );

            const maxStreak = habits.reduce((max, h) => {
                const habitMax = h.tareas.reduce(
                    (m, t) => Math.max(m, t.diasConsecutivos || 0),
                    0
                );
                return Math.max(max, habitMax);
            }, 0);

            const progressToday =
                totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            res.json({
                totalHabits,
                completedHabits: completedTasks,
                maxStreak,
                progressToday,
            });
        } catch (error) {
            console.error('Error getStats:', error);
            res.status(500).json({
                error: 'Error al obtener estadísticas',
                details: error.message,
            });
        }
    }

    // GET /api/habits/getGraphData
    static async getGraphData(req, res) {
        try {
            const userId = req.user._id 
            // Busco los hábitos del usuario 
            const habits = await Habit.find({user: userId})

            const data = habits.map(habit => {
                const totalTasks = habit.tareas.length
                const completedTasks = habit.tareas.filter(t => t.completado).length
                const porcentaje = totalTasks > 0 ? Math.round((completedTasks / totalTasks) *100) : 0

                return {
                    name: habit.nombre,
                    total: totalTasks,
                    completadas: completedTasks,
                    porcentaje: porcentaje,
                    fill: porcentaje === 100 ? '#10B981' : '#F97316'
                }
            })

            res.json(data)
        } catch (error) {
            console.error('Error getStats:', error)
            res.status(500).json({
                error: 'Error al obtener datos para la gráfica',
                details: error.message
            })
            
        }
    }
}
