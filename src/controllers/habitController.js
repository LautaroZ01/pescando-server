import Habit from '../models/Habit.js';

export class HabitController {
    
    // CREATE - Crear un nuevo hábito
    static createHabit = async (req, res) => {
        try {
            const { nombre, categoria } = req.body;
            
            // Validar datos
            if (!nombre || !categoria) {
                return res.status(400).json({ 
                    error: 'Nombre y categoría son requeridos' 
                });
            }

            // Crear el hábito
            const newHabit = new Habit({
                nombre,
                categoria,
                userId: req.user.id // Asumiendo que tienes auth middleware
            });

            await newHabit.save();

            res.status(201).json({ 
                message: 'Hábito creado exitosamente',
                habit: newHabit 
            });
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al crear el hábito',
                details: error.message 
            });
        }
    };

    // READ - Obtener todos los hábitos del usuario
    static getHabits = async (req, res) => {
        try {
            const habits = await Habit.find({ 
                userId: req.user.id 
            }).sort({ fechaCreacion: -1 });

            res.json({ habits });
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al obtener hábitos',
                details: error.message 
            });
        }
    };

    // READ - Obtener un hábito por ID
    static getHabitById = async (req, res) => {
        try {
            const { id } = req.params;
            
            const habit = await Habit.findOne({ 
                _id: id, 
                userId: req.user.id 
            });

            if (!habit) {
                return res.status(404).json({ 
                    error: 'Hábito no encontrado' 
                });
            }

            res.json({ habit });
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al obtener el hábito',
                details: error.message 
            });
        }
    };

    // UPDATE - Actualizar un hábito
    static updateHabit = async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, categoria, completado } = req.body;

            const habit = await Habit.findOne({ 
                _id: id, 
                userId: req.user.id 
            });

            if (!habit) {
                return res.status(404).json({ 
                    error: 'Hábito no encontrado' 
                });
            }

            // Actualizar campos
            if (nombre) habit.nombre = nombre;
            if (categoria) habit.categoria = categoria;
            if (completado !== undefined) {
                habit.completado = completado;
                if (completado) {
                    habit.diasConsecutivos += 1;
                }
            }

            await habit.save();

            res.json({ 
                message: 'Hábito actualizado exitosamente',
                habit 
            });
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al actualizar el hábito',
                details: error.message 
            });
        }
    };

    // DELETE - Eliminar un hábito
    static deleteHabit = async (req, res) => {
        try {
            const { id } = req.params;

            const habit = await Habit.findOneAndDelete({ 
                _id: id, 
                userId: req.user.id 
            });

            if (!habit) {
                return res.status(404).json({ 
                    error: 'Hábito no encontrado' 
                });
            }

            res.json({ 
                message: 'Hábito eliminado exitosamente' 
            });
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al eliminar el hábito',
                details: error.message 
            });
        }
    };

    // EXTRA - Marcar hábito como completado del día
    static markAsComplete = async (req, res) => {
        try {
            const { id } = req.params;

            const habit = await Habit.findOne({ 
                _id: id, 
                userId: req.user.id 
            });

            if (!habit) {
                return res.status(404).json({ 
                    error: 'Hábito no encontrado' 
                });
            }

            habit.completado = true;
            habit.diasConsecutivos += 1;
            await habit.save();

            res.json({ 
                message: 'Hábito marcado como completado',
                habit 
            });
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al marcar hábito',
                details: error.message 
            });
        }
    };
}