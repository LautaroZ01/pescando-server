import { transporter } from "../config/nodemailer.js"

// Necesario para el envio de emails con Google
// import dotenv from "dotenv"
// dotenv.config()

export class AuthEmail {
    /**
     * Envía un correo de confirmación de cuenta
     * @param {User} user {email, firstname, token} - Usuario a confirmar
     * @returns {Promise<void>}
     */
    static sendConfirmationEmail = async (user) => {
        const from = process.env.EMAIL_USER || 'Pescando <admin@pescando.com>'
        
        const info = await transporter.sendMail({
            from,
            to: user.email,
            subject: 'Pescando - Confirma tu cuenta',
            text: 'Pescando - Confirma tu cuenta',
            html: `
            <p> Hola ${user.firstname}, has creado tu cuenta en el Pescando, ya casi esta todo listo, solo debes confirmar tu cuenta </p>
            <p>Visita el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account" >Confirmar cuenta</a>
            <p>Ingresa el codigo: <b>${user.token}</b></p>
            <p>Este token expira en 10 minutos</p>
            `
        })
    }
}