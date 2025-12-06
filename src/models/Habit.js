import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        required: true,
        enum: ['Estudio', 'Programación', 'Salud', 'Lectura', 'Otro']
    },
    diasConsecutivos: {
        type: Number,
        default: 0
    },
    completado: {
        type: Boolean,
        default: false
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Habit', habitSchema);