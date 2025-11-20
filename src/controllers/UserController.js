

export class UserController {
    static getProfile = async (req, res) => {
        try {
            if (!req.user) {
                return res.status(404).json({error: 'Usuario no encontrado'})
            }
            res.json(req.user)
        } catch (error) {
            console.error(error)
            res.status(500).json({error: 'Error interno del servidor'})
        }
    }
}