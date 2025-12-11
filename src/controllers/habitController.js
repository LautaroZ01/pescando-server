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
                completadoHoy: false,
                historial: []
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
            const { status } = req.query;

            const habits = await Habit.find({ user: userId })
                .sort({ createdAt: -1 })
                .populate('categoria', 'name color icon');

            const hoy = new Date();
            const hoyString = hoy.toDateString();

            for (const habit of habits) {
                // 1. Verificamos si realmente todas las tareas están completas
                const todasTareasCompletadas = habit.tareas.length > 0 && habit.tareas.every(t => t.completado);
                
                // 2. Verificamos historial
                const estaEnHistorialHoy = habit.historial && habit.historial.some(fecha => 
                    new Date(fecha).toDateString() === hoyString
                );

                // 3. Verificamos cuándo fue la última vez que se tocó este hábito
                const ultimaActualizacion = new Date(habit.updatedAt);
                const seTocoHoy = ultimaActualizacion.toDateString() === hoyString;

                let huboCambios = false;

                if (!seTocoHoy && !estaEnHistorialHoy) {
                    const tieneBasura = habit.tareas.some(t => t.completado) || habit.completadoHoy;
                    if (tieneBasura) {
                        habit.completadoHoy = false;
                        habit.tareas.forEach(t => t.completado = false);
                        huboCambios = true;
                    }
                }

                if (habit.completadoHoy && !todasTareasCompletadas) {
                    habit.completadoHoy = false;
                    if (estaEnHistorialHoy) {
                        habit.historial = habit.historial.filter(d => new Date(d).toDateString() !== hoyString);
                    }
                    huboCambios = true;
                }

                if (!habit.completadoHoy && todasTareasCompletadas) {
                    habit.completadoHoy = true;
                    if (!estaEnHistorialHoy) habit.historial.push(hoy);
                    huboCambios = true;
                }

                // Verificar Racha
                if (habit.verificarRacha) {
                    const rachaCambio = habit.verificarRacha();
                    if (rachaCambio) huboCambios = true;
                }

                if (huboCambios || habit.isModified()) {
                    await habit.save();
                }
            }

            // Filtrado final
            let filteredHabits = habits;
            if (status === 'completed') {
                filteredHabits = habits.filter(h => h.completadoHoy === true);
            } else if (status === 'pending') {
                filteredHabits = habits.filter(h => h.completadoHoy === false);
            }

            res.json({ habits: filteredHabits });

        } catch (error) {
            console.error('Error getHabits:', error);
            return res.status(500).json({ error: 'Error al obtener hábitos' });
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

    // PATCH /api/habits/:habitId/tasks/:taskId/toggle
    static async toggleTask(req, res) {
        try {
            const userId = req.user._id || req.user.id;
            const { habitId, taskId } = req.params;

            const habit = await Habit.findOne({ _id: habitId, user: userId });
            if (!habit) return res.status(404).json({ error: 'Hábito no encontrado' });

            const task = habit.tareas.id(taskId);
            if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

            // 1. Invertir estado de la tarea
            task.completado = !task.completado;

            // 2. Gestionar Historial
            const hoy = new Date();
            const hoyString = hoy.toDateString();
            
            if (!habit.historial) habit.historial = [];

            // Verificamos el estado global
            const todasCompletadas = habit.tareas.every(t => t.completado);

            if (todasCompletadas) {
                habit.completadoHoy = true;
                habit.ultimaCompletacion = new Date();
                // Agregar al historial si no está
                if (!habit.historial.some(d => new Date(d).toDateString() === hoyString)) {
                    habit.historial.push(new Date());
                }
            } else {
                habit.completadoHoy = false;
                // Quitar del historial si está
                habit.historial = habit.historial.filter(d => new Date(d).toDateString() !== hoyString);
            }

            // 3. RECALCULAR RACHA (La magia ✨)
            // No sumamos ni restamos. Contamos hacia atrás desde hoy (o ayer) para ver la racha real.
            
            let racha = 0;
            let fechaCheck = new Date(hoy); // Empezamos a verificar desde Hoy

            // Si HOY no está completado, la racha válida es la que traías hasta AYER.
            // Así que empezamos a contar desde ayer hacia atrás.
            if (!habit.completadoHoy) {
                fechaCheck.setDate(fechaCheck.getDate() - 1);
            }

            // Bucle: Mientras encontremos la fecha en el historial, sumamos racha y retrocedemos un día
            while (true) {
                const fechaString = fechaCheck.toDateString();
                const existeEnHistorial = habit.historial.some(h => 
                    new Date(h).toDateString() === fechaString
                );

                if (existeEnHistorial) {
                    racha++;
                    fechaCheck.setDate(fechaCheck.getDate() - 1); // Retroceder 1 día
                } else {
                    break; // Se cortó la racha
                }
            }

            // Asignamos el valor real calculado
            habit.diasConsecutivos = racha;

            await habit.save();
            await habit.populate('categoria', 'name color icon');

            res.json({ habit });
        } catch (error) {
            console.error('Error toggleTask:', error);
            res.status(500).json({ error: 'Error al actualizar tarea', details: error.message });
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
            const { from, to } = req.query;
            const habits = await Habit.find({ user: userId });

            let startDate, endDate;

            if (from && to) {
                startDate = new Date(from);
                endDate = new Date(to);
            } else {
                endDate = new Date();
                startDate = new Date();
                startDate.setDate(endDate.getDate() - 6);
            }

            // Normalizar horas
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            const weeklyData = [];
            
            // Bucle día por día
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                
                const fechaBuscadaString = d.toDateString();
                let completados = 0;

                habits.forEach(h => {
                    if (h.historial && h.historial.length > 0) {
                        const cumplioEsteDia = h.historial.some(fechaGuardada => 
                            new Date(fechaGuardada).toDateString() === fechaBuscadaString
                        );
                        if (cumplioEsteDia) completados++;
                    }
                });

                // Formatear etiqueta (10/12)
                const dia = d.getDate().toString().padStart(2, '0');
                const mes = (d.getMonth() + 1).toString().padStart(2, '0');
                const label = `${dia}/${mes}`; 

                weeklyData.push({
                    name: label,
                    date: d.toISOString().split('T')[0],
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