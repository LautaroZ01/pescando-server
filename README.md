# Server – API REST (Proyecto Pescando)

Backend basico para la aplicación de Pescando. Provee un endpoint de prueba de autenticación y configuración de CORS.

## Stack

- **Runtime**: Node.js (recomendado >= 18)
- **Framework**: Express 5
- **Librerías**: `dotenv`, `cors`

## Estructura

```
Server/
├─ index.js           # Punto de entrada (levanta el server)
├─ server.js          # Configuración de Express y rutas
├─ src/
│  ├─ config/cors.js  # Configuración de CORS
│  ├─ controllers/    # Controladores (AuthController)
│  ├─ routes/         # Rutas (authRoutes)
│  └─ ...
├─ package.json
└─ .env.local         # Variables de entorno (git-ignorado)
```

## Requisitos previos

- Node.js >= 18

## Variables de entorno

Crear un archivo `.env.local` en la raíz de `Server/` con las siguientes claves:

```
# Puerto del servidor (opcional, por defecto 3000)
PORT=3000

# Origen permitido para CORS (frontend)
FRONTEND_URL=http://localhost:5173
```

Notas:

- `PORT` es leído en `index.js`.
- `FRONTEND_URL` es usado en `src/config/cors.js` para permitir el origen del frontend. Si no se define, por defecto usa `http://localhost:5173`.

## Instalación

Crear una carpeta del proyecto `Pescando/`

```sh
mkdir Pescando
```

Crear una carpeta `Server/` y copiar el contenido del repositorio. Luego, desde la carpeta `Server/`:

```sh
cd Pescando
mkdir Server
```

```sh
git clone https://github.com/LautaroZ01/pescando-server.git ./
```

```sh
npm install
```

## Ejecución en local

```sh
npm run dev
```

Esto inicia el servidor con `node --watch` en `http://localhost:3000` (o el puerto definido en `PORT`).

## Endpoints

- **GET** `/api/auth/`
  - Respuesta de prueba:
    ```json
    { "message": "Auth test" }
    ```

Prueba rápida con curl:

```
curl http://localhost:3000/api/auth/
```

## CORS

El middleware de CORS está configurado en `src/config/cors.js`.

- Orígenes permitidos: `FRONTEND_URL` (o `http://localhost:5173` por defecto).
- Si la petición no incluye `Origin` (por ejemplo, `curl` local), se permite por defecto.
- Para errores tipo "Not allowed by CORS", revisa que `FRONTEND_URL` coincida exactamente con el origen del frontend.

## Scripts disponibles

En `package.json`:

- `dev`: levanta el servidor con recarga por cambios

## Solución de problemas

- **El servidor no arranca**: verifica Node >= 18 y que `.env.local` exista (o al menos `FRONTEND_URL`).
- **CORS bloqueado**: ajusta `FRONTEND_URL` en `.env.local` al origen real del frontend.

## Licencia

ISC

