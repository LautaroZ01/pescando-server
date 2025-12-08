import mongoose from 'mongoose';

const { Schema } = mongoose;

// Subdocumento para cada tarea del hábito
const taskSchema = new Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    completado: {
        type: Boolean,
        default: false
    },
    diasConsecutivos: {
        type: Number,
        default: 0
    }
}, {
    _id: true,          // cada tarea tiene su propio _id
    timestamps: false
});

// Esquema del hábito
const habitSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        required: true,
        trim: true
    },

    // las tareas viven acá, no como un solo string
    tareas: [taskSchema],

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    fechaCreacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índice para mejorar búsquedas por usuario
habitSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Habit', habitSchema);
