import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
    const token = req.cookies.access_token

    if (!token) {
        const error = new Error('No Autorizado')
        res.status(401).json({ error: error.message })
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (typeof decoded === 'object' && decoded.id) {
            const user = await User.findById(decoded.id).select('_id firstname lastname email role photo status')

            if (user.status === 'inactive') {
                const error = new Error('La cuenta no ha sido desactivada')
                res.status(401).json({ error: error.message })
                return
            }

            if (user) {
                req.user = user
                next()
            } else {
                res.status(500).json({ error: 'Token No Valido' })
                return
            }
        }

    } catch (error) {
        res.status(500).json({ error: 'Token No Valido' })
        return
    }
}

/**
 * Middleware factory para verificar roles de usuario.
 *
 * Esta función de orden superior toma un array de roles permitidos
 * y devuelve un middleware de Express que verifica si el usuario
 * autenticado tiene uno de esos roles.
 *
 * @param {string[]} allowedRoles - Array de strings con los roles permitidos (ej: ['admin', 'user']).
 * @returns {function} Middleware de Express.
 */
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // Verificar si el usuario está autenticado
        if (!req.user) {
            return res.status(401).json({ error: 'No Autorizado' })
        }

        // Extraer el rol del usuario
        const { role } = req.user

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ error: 'Acceso Denegado' })
        }

        next()
    }

}