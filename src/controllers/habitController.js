// pescando-server/src/controllers/habitController.js
const Habit = require('../models/Habit');
const Task = require('../models/Task');

// Obtener todos los hábitos del usuario
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ usuario: req.user.id })
      .sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener hábitos', error: error.message });
  }
};

// Obtener hábitos de hoy
exports.getTodayHabits = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const habits = await Habit.find({ 
      usuario: req.user.id,
      createdAt: { $lte: hoy }
    }).sort({ createdAt: -1 });
    
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener hábitos de hoy', error: error.message });
  }
};

// Obtener un hábito específico con sus tareas
exports.getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      usuario: req.user.id 
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Hábito no encontrado' });
    }
    
    const tasks = await Task.find({ habito: habit._id }).sort({ orden: 1 });
    
    res.json({ habit, tasks });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener hábito', error: error.message });
  }
};

// Crear nuevo hábito
exports.createHabit = async (req, res) => {
  try {
    const { nombre, categoria, color } = req.body;
    
    const newHabit = new Habit({
      usuario: req.user.id,
      nombre,
      categoria,
      color: color || '#8B5CF6'
    });
    
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear hábito', error: error.message });
  }
};

// Actualizar hábito
exports.updateHabit = async (req, res) => {
  try {
    const { nombre, categoria, color } = req.body;
    
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user.id },
      { nombre, categoria, color },
      { new: true, runValidators: true }
    );
    
    if (!habit) {
      return res.status(404).json({ message: 'Hábito no encontrado' });
    }
    
    res.json(habit);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar hábito', error: error.message });
  }
};

// Marcar hábito como completado
exports.completeHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      usuario: req.user.id 
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Hábito no encontrado' });
    }
    
    habit.marcarCompletado();
    await habit.save();
    
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Error al completar hábito', error: error.message });
  }
};

// Eliminar hábito (y sus tareas)
exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ 
      _id: req.params.id, 
      usuario: req.user.id 
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Hábito no encontrado' });
    }
    
    // Eliminar todas las tareas asociadas
    await Task.deleteMany({ habito: req.params.id });
    
    res.json({ message: 'Hábito eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar hábito', error: error.message });
  }
};

// Obtener estadísticas del hábito
exports.getHabitStats = async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      usuario: req.user.id 
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Hábito no encontrado' });
    }
    
    const totalTareas = await Task.countDocuments({ habito: req.params.id });
    const tareasCompletadas = await Task.countDocuments({ 
      habito: req.params.id, 
      completada: true 
    });
    
    res.json({
      diasConsecutivos: habit.diasConsecutivos,
      totalCompletados: habit.historialCompletados.length,
      totalTareas,
      tareasCompletadas,
      porcentajeCompletado: totalTareas > 0 ? 
        Math.round((tareasCompletadas / totalTareas) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};