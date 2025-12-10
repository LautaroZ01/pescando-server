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
                //historial: []
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

            const habits = await Habit.find({ user: userId }).sort({ createdAt: -1 }).populate('categoria', 'name color icon');

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            // Verificar rachas antes de devolver
            for (const habit of habits) {
                if (habit.verificarRacha) {
                    habit.verificarRacha();
                }
                let modificado = false

                if (habit.completadoHoy && habit.ultimaCompletacion) {
                    const fechaUltima = new Date(habit.ultimaCompletacion)
                    fechaUltima.setHours(0,0,0,0)

                    if (fechaUltima.getTime() !== hoy.getTime()) {
                        habit.completadoHoy = false
                        modificado = true
                    }
                } else if (habit.completadoHoy && !habit.ultimaCompletacion) {
                    habit.completadoHoy = false
                    modificado = true
                }

                if(modificado) {
                    await habit.save();
                }

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

            const habit = await Habit.findOne({ _id: id, user: userId }).populate('categoria', 'name color icon');

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

            if (categoria) habit.categoria = categoria

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
            await habit.populate('categoria', 'name color icon')

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

            const hoyString = new Date().toDateString()

            if (!habit.historial) habit.historial = []

            // Si se marca como completada y NO se había completado hoy
            if (task.completado && !estabaCompletada && !habit.completadoHoy) {
                habit.actualizarRacha();
                // Guardamos la fecha en el historial si no existe
                const yaExiste = habit.historial.some(d => new Date(d).toDateString() === hoyString);
                if (!yaExiste) {
                    habit.historial.push(new Date());
                }
            }
            // Si se desmarca y era la única completada hoy, podríamos resetear completadoHoy
            else if (!task.completado && estabaCompletada) {
                // Verificar si quedan otras tareas completadas
                const hayOtrasCompletadas = habit.tareas.some(
                    t => t._id.toString() !== taskId && t.completado
                );
                
                if (!hayOtrasCompletadas) {
                    habit.completadoHoy = false;
                    // Quitamos la fecha del historial porque ya no está completo hoy
                    habit.historial = habit.historial.filter(d => new Date(d).toDateString() !== hoyString)
                }
            }

            await habit.save();
            await habit.populate('categoria', 'name color icon')

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
            const habits = await Habit.find({user: userId}).populate('categoria', 'name color')

            if (habits.length === 0) {
                return res.json([])
            }
            
            const distribution = {};

            habits.forEach(habit => {
                // Si la categoría existe (no fue borrada), usamos sus datos.
                // Si es null (borrada), usamos un fallback.
                const catName = habit.categoria ? habit.categoria.name : 'Sin categoría';
                const catColor = habit.categoria ? habit.categoria.color : '#9CA3AF'; // Gris

                if (!distribution[catName]) {
                    distribution[catName] = { count: 0, color: catColor };
                }
                distribution[catName].count += 1;
            });

            const data = Object.keys(distribution).map(key => ({
                name: key,
                value: distribution[key].count,
                fill: distribution[key].color
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

    // GET /api/habits/streaks-data
    static async getStreaksData(req, res) {
        try {
            const userId = req.user._id || req.user.id;

            // Buscamos hábitos con racha iniciada (>0), ordenados de mayor a menor
            const habits = await Habit.find({ 
                user: userId,
                diasConsecutivos: { $gt: 0 } 
            })
            .sort({ diasConsecutivos: -1 })
            .limit(5); // Top 5 mejores rachas

            const data = habits.map(habit => ({
                name: habit.nombre,
                streak: habit.diasConsecutivos,
                // Color dorado para el #1, naranja para el resto
                fill: habit.diasConsecutivos > 20 ? '#F59E0B' : '#FB923C' 
            }));

            res.json(data);

        } catch (error) {
            console.error('Error getStreaksData:', error);
            res.status(500).json({ error: 'Error al obtener rachas' });
        }
    }

    static async getCategoryPerformance(req, res) {
        try {
            const userId = req.user._id
            const habits = await Habit.find({user: userId}).populate('categoria', 'name')

            if (habits.length === 0) return res.json([])

            const tempStats = {}

            habits.forEach(habit => {
                const cat = habit.categoria ? habit.categoria.name : 'Sin categoría'

                if (!tempStats[cat]) {
                    tempStats[cat] = { total: 0, completed: 0}
                }

                const habitTotal = habit.tareas.length
                const habitCompleted = habit.tareas.filter( t => t.completado).length
                
                tempStats[cat].total += habitTotal;
                tempStats[cat].completed += habitCompleted
            })

            // Transformar a formato para Recharts (Radar)
            // { subject: 'Estudio', A: 80, fullMark: 100 }
            const data = Object.keys(tempStats).map(key => {
                const { total, completed } = tempStats[key];
                const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
                
                return {
                    subject: key,
                    A: percentage, // Valor del usuario
                    fullMark: 100  // Valor máximo (100%)
                };
            });

            res.json(data)
        } catch (error) {
            console.error('Error getCategoryPerformance:', error)
            res.status(500).json({error: 'Error al obtener rendimiento'})
        }
    }

    // GET /api/habits/history-stats
    static async getHistoryStats(req, res) {
        try {
            const userId = req.user._id;
            const habits = await Habit.find({ user: userId });

            const weeklyData = [];
            const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            
            // Generar los últimos 7 días
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                
                // CAMBIO CLAVE: Usamos toDateString() igual que en toggleTask
                // Esto crea un string tipo "Wed Dec 10 2025" y evita problemas de hora
                const fechaBuscadaString = d.toDateString();
                
                let completados = 0;
                
                habits.forEach(h => {
                    // Verificamos si historial existe y tiene datos
                    if (h.historial && h.historial.length > 0) {
                        // Comparamos String contra String
                        const cumplioEsteDia = h.historial.some(fechaGuardada => 
                            new Date(fechaGuardada).toDateString() === fechaBuscadaString
                        );
                        
                        if (cumplioEsteDia) {
                            completados++;
                        }
                    }
                });

                weeklyData.push({
                    name: diasSemana[d.getDay()], 
                    completados: completados,
                    meta: habits.length 
                });
            }

            res.json({ weeklyData });

        } catch (error) {
            console.error('Error getHistoryStats:', error);
            res.status(500).json({ error: 'Error al obtener historial' });
        }
    }
}