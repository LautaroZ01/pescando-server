import mongoose from 'mongoose';

const tareaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    completado: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const habitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    tareas: [tareaSchema],
    
    // Sistema de rachas
    diasConsecutivos: {
        type: Number,
        default: 0
    },
    ultimaCompletacion: {
        type: Date,
        default: null
    },
    completadoHoy: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Método para verificar y actualizar la racha
habitSchema.methods.actualizarRacha = function() {
    const ahora = new Date();
    const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    
    // Si no hay última completación, es la primera vez
    if (!this.ultimaCompletacion) {
        this.diasConsecutivos = 1;
        this.ultimaCompletacion = ahora;
        this.completadoHoy = true;
        return;
    }
    
    const ultimaCompletacionInicio = new Date(
        this.ultimaCompletacion.getFullYear(),
        this.ultimaCompletacion.getMonth(),
        this.ultimaCompletacion.getDate()
    );
    
    const diferenciaDias = Math.floor((hoyInicio - ultimaCompletacionInicio) / (1000 * 60 * 60 * 24));
    
    // Si ya completó hoy, no hacer nada
    if (diferenciaDias === 0) {
        return;
    }
    
    // Si pasó exactamente 1 día, incrementar racha
    if (diferenciaDias === 1) {
        this.diasConsecutivos += 1;
        this.ultimaCompletacion = ahora;
        this.completadoHoy = true;
    } 
    // Si pasaron más de 1 día, reiniciar racha
    else if (diferenciaDias > 1) {
        this.diasConsecutivos = 1;
        this.ultimaCompletacion = ahora;
        this.completadoHoy = true;
    }
};

// Método para verificar si la racha debe resetearse
habitSchema.methods.verificarRacha = function() {
    if (!this.ultimaCompletacion) return;
    
    const ahora = new Date();
    const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    
    const ultimaCompletacionInicio = new Date(
        this.ultimaCompletacion.getFullYear(),
        this.ultimaCompletacion.getMonth(),
        this.ultimaCompletacion.getDate()
    );
    
    const diferenciaDias = Math.floor((hoyInicio - ultimaCompletacionInicio) / (1000 * 60 * 60 * 24));
    
    // Si pasaron más de 1 día sin completar, resetear racha
    if (diferenciaDias > 1) {
        this.diasConsecutivos = 0;
        this.completadoHoy = false;
    }
    // Si es un nuevo día, marcar como no completado hoy
    else if (diferenciaDias === 1) {
        this.completadoHoy = false;
    }
};

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;