
// Controlador de autenticacion -> Se crea una clase para mejorar la legibilidad
export class AuthController {
    /**
     * Que se resive y envia de una peticion HTTP
     * req: Request -> Lo que llega desde el cliente
     * res: Response -> Lo que envia el servidor
     */
    // Primera funcion de prueba
    static authTest = async (req, res) => {
        // Envio una respuesta en formato JSON
        res.json({ message: "Auth test" })
    }
}