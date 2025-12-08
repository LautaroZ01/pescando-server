import User from "../models/User.js"
import cloudinary from "../config/cloudinary.js"

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

    static uploadPhoto = async (req, res) => {
        try {
            const userId = req.user._id
            const { photo, public_id } = req.body
            console.log(req.body);

            if (!photo) {
                return res.status(400).json({error: 'No se proporcionó ninguna imagen'})
            }

            const user = await User.findById(userId)

            if (!user) {
                return res.status(404).json({error: 'Usuario no encontrado'})
            }

            
            if (user.cloudinary_id) {
                await cloudinary.uploader.destroy(user.cloudinary_id)
            }

            // Actualizar usuario con la nueva foto 
            user.photo = photo
            user.cloudinary_id = public_id

            await user.save()

            res.json({
                message: 'Foto de perfil actualizada correctamente',
                photo: user.photo
            })
        } catch (error) {
            console.error('Error al subir foto:', error)
            res.status(500).json({error: 'Error al subir la foto de perfil'})
        }
    }

}