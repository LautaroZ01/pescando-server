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
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- dotenv
- CORS
- Postman
- Cloudinary

## 📁 Estructura del Proyecto
```
server/
├── src/
│   ├── controllers/     # Lógica de negocio
│   ├── models/          # Esquemas de MongoDB
│   ├── routes/          # Definición de rutas
│   ├── middlewares/     # Autenticación y validaciones
│   ├── config/          # Configuración (DB, env)
│   └── utils/           # Funciones auxiliares
├── index.js             # Punto de entrada
├── .env
├── package.json
└── README.md
```

## 🚀 Instalación y Uso

### 1️⃣ Clonar el repositorio

git clone https://github.com/tu-usuario/pescando-server.git

cd pescando-server

### 2️⃣ Instalar dependencias

npm install

### 3️⃣ Configurar variables de entorno

Crear un archivo .env con las siguientes variables:

PORT=3000

MONGO_URI=mongodb://localhost:27017/pescando

JWT_SECRET=tu_secreto_jwt

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
