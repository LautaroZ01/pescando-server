import mongoose from 'mongoose';

const communityHabitSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: 500
    },
    categoria: {
        type: String,
        required: true,
        enum: ['Estudio', 'Programación', 'Salud', 'Lectura', 'Otro']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    // Referencia al hábito original si fue compartido desde "Mis Hábitos"
    originalHabitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit'
    },
    // Sistema de reacciones
    reactions: {
        hearts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    // Contador de reacciones
    reactionsCount: {
        hearts: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        }
    },
    // Sistema de valoraciones (1-5 estrellas)
    ratings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        stars: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Promedio de valoración
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    // Contador de veces que fue copiado
    copiedCount: {
        type: Number,
        default: 0
    },
    fechaPublicacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índices para búsqueda y rendimiento
communityHabitSchema.index({ categoria: 1 });
communityHabitSchema.index({ fechaPublicacion: -1 });
communityHabitSchema.index({ averageRating: -1 });
communityHabitSchema.index({ 'reactionsCount.likes': -1 });

// Método para calcular el promedio de valoraciones
communityHabitSchema.methods.calculateAverageRating = function() {
    if (this.ratings.length === 0) {
        this.averageRating = 0;
        this.totalRatings = 0;
    } else {
        const sum = this.ratings.reduce((acc, rating) => acc + rating.stars, 0);
        this.averageRating = sum / this.ratings.length;
        this.totalRatings = this.ratings.length;
    }
};

export default mongoose.model('CommunityHabit', communityHabitSchema);