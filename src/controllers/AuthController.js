
import { AuthEmail } from "../email/AuthEmail.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { hashPassword } from "../util/auth.js";
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

    static user = async (req, res) => {
        res.json(req.user)
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

    static logout = (req, res) => {
        res.clearCookie('access_token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' }).send('Sesion cerrada')
    };
}