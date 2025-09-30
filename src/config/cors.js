import cors from 'cors';

// Lista de URLs permitidas por el servidor
const ACCEPTED_ORIGINS = [
    process.env.FRONTEND_URL || 'http://localhost:5173'
]

// Funcion para verificar si la URL que hace la peticion es permitida
export const corsConfig = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
    origin: (origin, callback) => {
        if (acceptedOrigins.includes(origin)) {
            return callback(null, true);
        }

        if (!origin) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    },
    credentials: true
})