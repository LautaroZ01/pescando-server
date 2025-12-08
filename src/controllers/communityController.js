import CommunityHabit from '../models/CommunityHabit.js';
import Habit from '../models/Habit.js';

export class CommunityController {
    
    // CREATE - Publicar un hábito nuevo en la comunidad
    static publishHabit = async (req, res) => {
        try {
            const { nombre, descripcion, categoria } = req.body;
            
            const communityHabit = new CommunityHabit({
                nombre,
                descripcion,
                categoria,
                userId: req.user._id,
                userName: `${req.user.firstname} ${req.user.lastname}`.trim() || req.user.email
            });

            await communityHabit.save();

            res.status(201).json({ 
                message: 'Hábito publicado exitosamente en la comunidad',
                habit: communityHabit 
            });
        } catch (error) {
            console.error('Error publishHabit:', error);
            res.status(500).json({ 
                error: 'Error al publicar el hábito',
                details: error.message 
            });
        }
    };

    // CREATE - Compartir un hábito existente desde "Mis Hábitos"
    static shareMyHabit = async (req, res) => {
        try {
            const { habitId } = req.params;

            // Verificar que el hábito existe y pertenece al usuario
            const myHabit = await Habit.findOne({
                _id: habitId,
                user: req.user._id
            });

            if (!myHabit) {
                return res.status(404).json({ 
                    error: 'Hábito no encontrado o no tienes permiso' 
                });
            }

            // Verificar si ya fue compartido
            const alreadyShared = await CommunityHabit.findOne({
                originalHabitId: habitId,
                userId: req.user._id
            });

            if (alreadyShared) {
                return res.status(400).json({ 
                    error: 'Este hábito ya fue compartido en la comunidad' 
                });
            }

            // Crear descripción mejorada con las tareas del hábito
            let tareasDescripcion = '';
            if (myHabit.tareas && myHabit.tareas.length > 0) {
                const tareasTitulos = myHabit.tareas.map(t => t.titulo).join(', ');
                tareasDescripcion = `Tareas: ${tareasTitulos}`;
            } else {
                tareasDescripcion = 'Hábito compartido desde mis hábitos personales';
            }

            // Crear el hábito compartido
            const communityHabit = new CommunityHabit({
                nombre: myHabit.nombre,
                descripcion: tareasDescripcion,
                categoria: myHabit.categoria,
                userId: req.user._id,
                userName: `${req.user.firstname} ${req.user.lastname}`.trim() || req.user.email,
                originalHabitId: myHabit._id
            });

            await communityHabit.save();

            res.status(201).json({ 
                message: 'Hábito compartido exitosamente',
                habit: communityHabit 
            });
        } catch (error) {
            console.error('Error shareMyHabit:', error);
            res.status(500).json({ 
                error: 'Error al compartir el hábito',
                details: error.message 
            });
        }
    };

    // CREATE - Copiar un hábito de la comunidad a "Mis Hábitos"
    static copyToMyHabits = async (req, res) => {
        try {
            const { id } = req.params;

            const communityHabit = await CommunityHabit.findById(id);

            if (!communityHabit) {
                return res.status(404).json({ 
                    error: 'Hábito no encontrado' 
                });
            }

            // Verificar que no sea el propio hábito
            if (communityHabit.userId.toString() === req.user._id.toString()) {
                return res.status(400).json({ 
                    error: 'No puedes copiar tu propio hábito' 
                });
            }

            // Crear hábito con estructura de tareas
            let tareas = [];
            if (communityHabit.descripcion && communityHabit.descripcion.includes('Tareas:')) {
                const tareasStr = communityHabit.descripcion.replace('Tareas:', '').trim();
                const tareasTitulos = tareasStr.split(',').map(t => t.trim()).filter(Boolean);
                tareas = tareasTitulos.map(titulo => ({
                    titulo,
                    completado: false,
                    diasConsecutivos: 0
                }));
            }

            // Si no hay tareas, crear una tarea por defecto con el nombre del hábito
            if (tareas.length === 0) {
                tareas = [{
                    titulo: communityHabit.nombre,
                    completado: false,
                    diasConsecutivos: 0
                }];
            }

            const myNewHabit = new Habit({
                nombre: communityHabit.nombre,
                categoria: communityHabit.categoria,
                user: req.user._id,
                tareas: tareas
            });

            await myNewHabit.save();

            // Incrementar contador de copias
            communityHabit.copiedCount += 1;
            await communityHabit.save();

            res.status(201).json({ 
                message: 'Hábito copiado a tus hábitos personales',
                habit: myNewHabit 
            });
        } catch (error) {
            console.error('Error copyToMyHabits:', error);
            res.status(500).json({ 
                error: 'Error al copiar el hábito',
                details: error.message 
            });
        }
    };

    // READ - Obtener todos los hábitos de la comunidad (PÚBLICO)
    static getCommunityHabits = async (req, res) => {
        try {
            const { categoria, sortBy = 'recent' } = req.query;
            
            const filter = {};
            if (categoria && categoria !== 'Todos') {
                filter.categoria = categoria;
            }

            let sortOption = { fechaPublicacion: -1 }; // Por defecto: más recientes

            if (sortBy === 'rating') {
                sortOption = { averageRating: -1, totalRatings: -1 };
            } else if (sortBy === 'popular') {
                sortOption = { 'reactionsCount.likes': -1, 'reactionsCount.hearts': -1 };
            }

            const habits = await CommunityHabit.find(filter)
                .sort(sortOption)
                .populate('userId', 'firstname lastname email photo');

            // Si hay usuario autenticado, agregar información personalizada
            if (req.user) {
                const habitsWithUserReactions = habits.map(habit => {
                    const habitObj = habit.toObject();
                    habitObj.userHasLiked = habit.reactions.likes.some(
                        id => id.toString() === req.user._id.toString()
                    );
                    habitObj.userHasHearted = habit.reactions.hearts.some(
                        id => id.toString() === req.user._id.toString()
                    );
                    habitObj.userRating = habit.ratings.find(
                        r => r.userId.toString() === req.user._id.toString()
                    )?.stars || 0;
                    return habitObj;
                });

                return res.json({ 
                    habits: habitsWithUserReactions,
                    count: habits.length 
                });
            }

            // Usuario no autenticado - devolver datos básicos
            const habitsPublic = habits.map(habit => {
                const habitObj = habit.toObject();
                habitObj.userHasLiked = false;
                habitObj.userHasHearted = false;
                habitObj.userRating = 0;
                return habitObj;
            });

            res.json({ 
                habits: habitsPublic,
                count: habits.length 
            });
        } catch (error) {
            console.error('Error getCommunityHabits:', error);
            res.status(500).json({ 
                error: 'Error al obtener hábitos de la comunidad',
                details: error.message 
            });
        }
    };

    // READ - Obtener hábitos por categoría (PÚBLICO)
    static getHabitsByCategory = async (req, res) => {
        try {
            const { categoria } = req.params;

            const habits = await CommunityHabit.find({ categoria })
                .sort({ fechaPublicacion: -1 })
                .populate('userId', 'firstname lastname email photo');

            res.json({ 
                categoria,
                habits,
                count: habits.length 
            });
        } catch (error) {
            console.error('Error getHabitsByCategory:', error);
            res.status(500).json({ 
                error: 'Error al obtener hábitos por categoría',
                details: error.message 
            });
        }
    };

    // READ - Obtener un hábito específico por ID (PÚBLICO)
    static getHabitById = async (req, res) => {
        try {
            const { id } = req.params;
            
            const habit = await CommunityHabit.findById(id)
                .populate('userId', 'firstname lastname email photo')
                .populate('ratings.userId', 'firstname lastname');

            if (!habit) {
                return res.status(404).json({ 
                    error: 'Hábito no encontrado' 
                });
            }

            res.json({ habit });
        } catch (error) {
            console.error('Error getHabitById:', error);
            res.status(500).json({ 
                error: 'Error al obtener el hábito',
                details: error.message 
            });
        }
    };

    // UPDATE - Dar/quitar reacción (corazón o like)
    static toggleReaction = async (req, res) => {
        try {
            const { id } = req.params;
            const { type } = req.body;
            const userId = req.user._id;

            if (!['heart', 'like'].includes(type)) {
                return res.status(400).json({ 
                    error: 'Tipo de reacción inválido. Use "heart" o "like"' 
                });
            }

            const habit = await CommunityHabit.findById(id);

            if (!habit) {
                return res.status(404).json({ 
                    error: 'Hábito no encontrado' 
                });
            }

            const reactionArray = type === 'heart' ? habit.reactions.hearts : habit.reactions.likes;
            const hasReacted = reactionArray.some(id => id.toString() === userId.toString());

            if (hasReacted) {
                // Quitar reacción
                if (type === 'heart') {
                    habit.reactions.hearts = habit.reactions.hearts.filter(
                        id => id.toString() !== userId.toString()
                    );
                    habit.reactionsCount.hearts -= 1;
                } else {
                    habit.reactions.likes = habit.reactions.likes.filter(
                        id => id.toString() !== userId.toString()
                    );
                    habit.reactionsCount.likes -= 1;
                }
            } else {
                // Agregar reacción
                if (type === 'heart') {
                    habit.reactions.hearts.push(userId);
                    habit.reactionsCount.hearts += 1;
                } else {
                    habit.reactions.likes.push(userId);
                    habit.reactionsCount.likes += 1;
                }
            }

            await habit.save();

            res.json({ 
                message: hasReacted ? 'Reacción removida' : 'Reacción agregada',
                habit,
                hasReacted: !hasReacted
            });
        } catch (error) {
            console.error('Error toggleReaction:', error);
            res.status(500).json({ 
                error: 'Error al procesar la reacción',
                details: error.message 
            });
        }
    };

    // UPDATE - Valorar un hábito (1-5 estrellas)
    static rateHabit = async (req, res) => {
        try {
            const { id } = req.params;
            const { stars } = req.body;
            const userId = req.user._id;

            if (!stars || stars < 1 || stars > 5) {
                return res.status(400).json({ 
                    error: 'La valoración debe ser entre 1 y 5 estrellas' 
                });
            }

            const habit = await CommunityHabit.findById(id);

            if (!habit) {
                return res.status(404).json({ 
                    error: 'Hábito no encontrado' 
                });
            }

            // Verificar si el usuario ya valoró
            const existingRatingIndex = habit.ratings.findIndex(
                r => r.userId.toString() === userId.toString()
            );

            if (existingRatingIndex !== -1) {
                // Actualizar valoración existente
                habit.ratings[existingRatingIndex].stars = stars;
                habit.ratings[existingRatingIndex].createdAt = Date.now();
            } else {
                // Agregar nueva valoración
                habit.ratings.push({ userId, stars });
            }

            // Recalcular promedio
            habit.calculateAverageRating();

            await habit.save();

            res.json({ 
                message: 'Valoración registrada exitosamente',
                habit,
                averageRating: habit.averageRating,
                totalRatings: habit.totalRatings
            });
        } catch (error) {
            console.error('Error rateHabit:', error);
            res.status(500).json({ 
                error: 'Error al valorar el hábito',
                details: error.message 
            });
        }
    };

    // DELETE - Eliminar un hábito publicado (solo el autor)
    static deleteHabit = async (req, res) => {
        try {
            const { id } = req.params;

            const habit = await CommunityHabit.findOne({ 
                _id: id, 
                userId: req.user._id 
            });

            if (!habit) {
                return res.status(404).json({ 
                    error: 'Hábito no encontrado o no tienes permiso para eliminarlo' 
                });
            }

            await CommunityHabit.findByIdAndDelete(id);

            res.json({ 
                message: 'Hábito eliminado exitosamente de la comunidad' 
            });
        } catch (error) {
            console.error('Error deleteHabit:', error);
            res.status(500).json({ 
                error: 'Error al eliminar el hábito',
                details: error.message 
            });
        }
    };

    // READ - Obtener mis hábitos publicados
    static getMyPublishedHabits = async (req, res) => {
        try {
            const habits = await CommunityHabit.find({ 
                userId: req.user._id 
            }).sort({ fechaPublicacion: -1 });

            res.json({ 
                habits,
                count: habits.length 
            });
        } catch (error) {
            console.error('Error getMyPublishedHabits:', error);
            res.status(500).json({ 
                error: 'Error al obtener tus hábitos publicados',
                details: error.message 
            });
        }
    };
}