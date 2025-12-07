import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        ref: 'Category',
        required: true
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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Habit', habitSchema);