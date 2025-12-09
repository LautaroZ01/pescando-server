import Habit from '../models/Habit.js';
import Category from '../models/Category.js';
    
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
                completado: false
            }));

            const habit = await Habit.create({
                user: userId,
                nombre,
                categoria,
                tareas: tareasDocs,
                diasConsecutivos: 0,
                ultimaCompletacion: null,
                completadoHoy: false
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

            // Verificar rachas antes de devolver
            for (const habit of habits) {
                habit.verificarRacha();
                await habit.save();
            }

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

            // Verificar racha
            habit.verificarRacha();
            await habit.save();

            res.json({ habit });
        } catch (error) {
            console.error('Error getHabitById:', error);
            res.status(500).json({
                error: 'Error al obtener hábito',
                details: error.message,
            });
        }
    }

    // PUT /api/habits/:id - MODIFICADO para NO resetear racha
    static async updateHabit(req, res) {
        try {
            const userId = req.user._id || req.user.id;
            const { id } = req.params;
            const { nombre, categoria, tareas } = req.body;

            const habit = await Habit.findOne({ _id: id, user: userId });

            if (!habit) {
                return res.status(404).json({ error: 'Hábito no encontrado' });
            }

            // Actualizar solo los campos editables, SIN tocar la racha
            if (typeof nombre === 'string' && nombre.trim() !== '') {
                habit.nombre = nombre.trim();
            }

            if (typeof categoria === 'string' && categoria.trim() !== '') {
                habit.categoria = categoria.trim();
            }

            // Si vienen tareas, actualizar SOLO las tareas, manteniendo el estado de completado
            if (Array.isArray(tareas) && tareas.length > 0) {
                const tareasLimpias = tareas
                    .map((t) => t && t.toString().trim())
                    .filter(Boolean);

                // Mantener el estado de completado de las tareas existentes si coinciden
                const tareasActualizadas = tareasLimpias.map((nuevoTitulo, index) => {
                    const tareaExistente = habit.tareas[index];
                    return {
                        titulo: nuevoTitulo,
                        completado: tareaExistente ? tareaExistente.completado : false
                    };
                });

                habit.tareas = tareasActualizadas;
            }

            // NO tocar diasConsecutivos, ultimaCompletacion ni completadoHoy
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

    // PATCH /api/habits/:habitId/tasks/:taskId/toggle - MODIFICADO con lógica de racha
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

            const estabaCompletada = task.completado;
            task.completado = !task.completado;

            // Si se marca como completada y NO se había completado hoy
            if (task.completado && !estabaCompletada && !habit.completadoHoy) {
                habit.actualizarRacha();
            }
            // Si se desmarca y era la única completada hoy, podríamos resetear completadoHoy
            else if (!task.completado && estabaCompletada) {
                // Verificar si quedan otras tareas completadas
                const hayOtrasCompletadas = habit.tareas.some(
                    t => t._id.toString() !== taskId && t.completado
                );
                
                if (!hayOtrasCompletadas) {
                    habit.completadoHoy = false;
                }
            }

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

            // Si no quedan tareas, borrar el hábito completo
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

            // Verificar rachas antes de calcular stats
            for (const habit of habits) {
                habit.verificarRacha();
                await habit.save();
            }

            const totalHabits = habits.length;

            const totalTasks = habits.reduce(
                (sum, h) => sum + h.tareas.length,
                0
            );

            const completedTasks = habits.reduce(
                (sum, h) => sum + h.tareas.filter((t) => t.completado).length,
                0
            );

            // Obtener la racha máxima de todos los hábitos
            const maxStreak = habits.reduce((max, h) => {
                return Math.max(max, h.diasConsecutivos || 0);
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

    static async getCategoryDistribution(req, res) {
        try {
            const userId = req.user._id 
            
            // Busco todos los hábitos del usuario
            const habits = await Habit.find({user: userId})

            if (habits.length === 0) {
                return res.json([])
            }

            // Agrupamos por categoría 
            const distribution = habits.reduce((acc, habit) => {
                const cat = habit.categoria || 'Sin categoría'
                acc[cat] = (acc[cat] || 0) + 1
                return acc
            }, {})

            const categoryNames = Object.keys(distribution);

            const categoriesInfo = await Category.find({ 
                name: { $in: categoryNames } 
            });

            const colorMap = {};
            categoriesInfo.forEach(cat => {
                colorMap[cat.name] = cat.color;
            });

            const data = categoryNames.map(catName => ({
                name: catName,
                value: distribution[catName],
                fill: colorMap[catName] || '#9CA3AF' 
            }));

            res.json(data);

        } catch (error) {
            console.error('Error getCategoryDistribution:', error);
            res.status(500).json({
                error: 'Error al obtener distribución de categorías',
                details: error.message
            });
        }
    }
}