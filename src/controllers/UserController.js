import User from "../models/User.js"
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

    static updateProfile = async (req, res) => {
        try {
            const  userId  = req.user._id
            const { firstname, lastname } = req.body

            const user = await User.findById(userId)

            if (!user) {
                return res.status(404).json({error: 'Usuario no encontrado'})
            }

            if (firstname) user.firstname = firstname
            if (lastname) user.lastname = lastname

            await user.save()

            res.json({
                message: 'Perfil actualizado correctamente',
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email

            })
        } catch (error) {
            console.error(error)
            res.status(500).json({error: 'Hubo un error al actualizar el perfil'})
        }
    }
}