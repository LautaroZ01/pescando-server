# 🐟 Pescando – Server (Backend)

Backend de Pescando, una aplicación web orientada a la creación de hábitos, el aprendizaje constante y la motivación en comunidad.
Este repositorio contiene la API REST, desarrollada con Node.js y Express, encargada de la lógica de negocio, autenticación de usuarios y persistencia de datos en MongoDB.

## 🌱 Descripción

El servidor de Pescando se encarga de:
- Autenticación y autorización de usuarios
- Gestión de hábitos y tareas
- Registro de progreso y estadísticas
- Funcionalidades de comunidad
- Comunicación segura con el frontend
- La arquitectura mantiene una separación clara entre cliente y servidor.

## 🧩 Tecnologías Utilizadas
- **Node.js** – Entorno de ejecución
- **Express.js** – Framework web rápido y minimalista
- **MongoDB + Mongoose** – Base de datos NoSQL y ODM
- **JWT (JSON Web Tokens)** – Estrategia de autenticación segura
- **Passport.js** – Middleware de autenticación (integraciones OAuth)
- **Cloudinary** – Gestión y almacenamiento de imágenes
- **Nodemailer** – Envío de correos electrónicos (SMTP)
- **Express Validator** – Validación de datos de entrada
- **Bcrypt** – Hashing seguro de contraseñas
- **Dotenv** – Manejo de variables de entorno
- **Morgan** – Logger de peticiones HTTP
- **CORS** – Manejo de orígenes cruzados

## 📁 Estructura del Proyecto
```bash
server/
├── src/
│   ├── config/          # Configuraciones (DB, Cloudinary, Nodemailer, CORS)
│   ├── controllers/     # Lógica de negocio y controladores de rutas
│   ├── email/           # Plantillas y lógica de envío de emails
│   ├── middleware/      # Middlewares (Auth, Validaciones, uploads)
│   ├── models/          # Esquemas y modelos de Mongoose
│   ├── routes/          # Definición de rutas y endpoints de la API
│   ├── services/        # Lógica de servicios (separación de preocupaciones)
│   ├── util/            # Utilidades y funciones helpers
│   └── ...
├── index.js             # Punto de entrada de la aplicación
├── server.js            # Configuración de la aplicación Express
├── .env                 # Variables de entorno (no trackeado)
├── package.json         # Dependencias y scripts
└── README.md            # Documentación del proyecto
```

## 🚀 Instalación y Uso

### 1️⃣ Clonar el repositorio

git clone https://github.com/tu-usuario/pescando-server.git

cd pescando-server

### 2️⃣ Instalar dependencias

npm install

### 3️⃣ Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto (`server/`) y definir las siguientes variables:

```env
# Servidor
PORT=3000
FRONTEND_URL=http://localhost:5173

# Base de Datos
DATABASE_URL=mongodb://localhost:27017/pescando

# Seguridad (JWT)
JWT_SECRET=tu_secreto_super_seguro

# Cloudinary (Imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Nodemailer (Emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# Google OAuth (Opcional si se usa)
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
```

FRONTEND_URL=http://localhost:5173

### 4️⃣ Ejecutar el servidor

npm run dev (desarrollo)

npm start (producción)

El servidor se ejecutará en:
http://localhost:3000

## 🔐 Autenticación

La API utiliza JWT para la autenticación:
- Login y registro generan un token
- El token se envía en el header Authorization
- Middleware protege las rutas privadas

## 🔗 Conexión con el Frontend

Este backend está diseñado para ser consumido por el repositorio Pescando – Client, mediante una API REST con CORS configurado.

## 👥 Equipo de Desarrollo

Proyecto realizado en el marco de Fundación Pescar 2025.

- Eduardo Colque
- Agustina Insfran
- Diana Pereyra
- Khiara Razzolini
- Lautaro Zuleta

## 🎯 Objetivo

Proveer una API robusta, segura y escalable que respalde una aplicación enfocada en la disciplina, el aprendizaje constante y el crecimiento en comunidad.

# Pescando hábitos, construyendo futuro.
