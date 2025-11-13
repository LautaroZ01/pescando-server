import { AuthEmail } from "../email/AuthEmail.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { checkPassword, hashPassword } from "../util/auth.js";
import { generateJWT } from "../util/jwt.js";
import { generateToken } from "../util/token.js";

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export class AuthController {

    static createAccount = async (req, res) => {
        try {
            const { password, email } = req.body;

            // Previene que se creen cuentas con el mismo email
            const userExist = await User.findOne({ email });
            if (userExist) {
                return res.status(400).json({ error: 'El email ya esta en uso' });
            }

            // Crea un usuario
            const user = new User(req.body)

            // Hashea la contraseña
            user.password = await hashPassword(password)

            // Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                firstname: user.firstname,
                token: token.token
            })

            await Promise.all([user.save(), token.save()])
            res.status(201).send('Cuenta creada, revisa tu email para confirmarla')

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    static sessionCallBack = async (req, res) => {
        try {

            if (!req.user) {
                const error = new Error('Le usuario no existe')
                res.status(401).json({ error: error.message })
                return
            }

            // req.user viene del callback de passport
            const user = req.user;
            const token = generateJWT({ id: user.id });

            // cookie httpOnly (no accesible desde JS) & redirige al frontend
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            }).redirect(FRONTEND_URL);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    static login = async (req, res) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })

            if (!user) {
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            if (user.status === 'inactive') {
                const error = new Error('La cuenta no ha sido desactivada')
                res.status(401).json({ error: error.message })
                return
            }

            if (!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                // Enviar email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    firstname: user.firstname,
                    token: token.token
                })

                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un email de confirmacion')
                res.status(401).json({ error: error.message })
                return
            }

            // Verifica la contraseña
            const isPasswordCorrect = await checkPassword(password, user.password)

            if (!isPasswordCorrect) {
                const error = new Error('La contraseña es incorrecta')
                res.status(404).json({ error: error.message })
                return
            }

            const token = generateJWT({ id: user.id })

            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV == 'production', // la cookie solo se puede acceder en https
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            }).send('Login correcto')

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error' });

        }
    }

    static logout = (req, res) => {
        res.clearCookie('access_token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' }).send('Sesion cerrada')
    }

    static user = async (req, res) => {
        res.json(req.user)
    }

    static requestConfirmationCode = async (req, res) => {
        try {
            const { email } = req.body

            // Busca al usuario
            const user = await User.findOne({ email })

            // Si el usuario no existe
            if (!user) {
                const error = new Error('El Usuario no esta registrado')
                res.status(404).json({ error: error.message })
                return
            }

            // Si el usuario ya esta confirmado
            if (user.confirmed) {
                const error = new Error('El Usuario ya esta confirmado')
                res.status(403).json({ error: error.message })
                return
            }

            // Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            // Enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                firstname: user.firstname,
                token: token.token
            })

            // Guarda el token y el usuario
            await Promise.allSettled([user.save(), token.save()])
            res.send('Se envio un nuevo token a tu email')
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static confirmAccount = async (req, res) => {
        try {
            const { token } = req.body

            // Busca el token
            const tokenExists = await Token.findOne({ token })

            // Si el token no existe
            if (!tokenExists) {
                const error = new Error('Token no valido')
                res.status(404).json({ error: error.message })
                return
            }

            // Busca al usuario
            const user = await User.findById(tokenExists.user)

            // Confirma la cuenta del usuario
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuanta confirmada correctamente')
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Hubo un error' })

        }
    }

    static validateToken = async (req, res) => {
        try {
            const { token } = req.body

            // Busca el token
            const tokenExists = await Token.findOne({ token })

            // Si el token no existe
            if (!tokenExists) {
                const error = new Error('Token no valido')
                res.status(404).json({ error: error.message })
                return
            }
            
            res.send('Token valido, define tu nueva contraseña')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })

        }
    }

}