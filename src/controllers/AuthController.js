
// Controlador de autenticacion -> Se crea una clase para mejorar la legibilidad

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export class AuthController {
    /**
     * Que se resive y envia de una peticion HTTP
     * req: Request -> Lo que llega desde el cliente
     * res: Response -> Lo que envia el servidor
     */
    // Primera funcion de prueba
    static authTest = async (req, res) => {
        // Envio una respuesta en formato JSON
        res.json({ message: "Auth test desde rama Dev" })
    }

    static createAccount = async (req, res) => {
        res.json({ message: "Create account" })
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