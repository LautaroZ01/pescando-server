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

            if(user.status === 'inactive'){
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