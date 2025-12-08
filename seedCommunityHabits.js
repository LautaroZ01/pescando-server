import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CommunityHabit from './src/models/CommunityHabit.js';
import User from './src/models/User.js';

dotenv.config();

const habitsData = [
    {
        nombre: 'Practicar JavaScript 30 minutos',
        descripcion: 'Dedicar media hora diaria a resolver ejercicios de algoritmos',
        categoria: 'Programación'
    },
    {
        nombre: 'Leer un capítulo de libro técnico',
        descripcion: 'Avanzar en mi lectura sobre Clean Code',
        categoria: 'Lectura'
    },
    {
        nombre: 'Hacer ejercicio matutino',
        descripcion: 'Rutina de cardio de 20 minutos antes del desayuno',
        categoria: 'Salud'
    },
    {
        nombre: 'Estudiar inglés',
        descripcion: 'Practicar vocabulario y gramática con Duolingo',
        categoria: 'Estudio'
    },
    {
        nombre: 'Meditar 10 minutos',
        descripcion: 'Sesión de meditación guiada para reducir estrés',
        categoria: 'Salud'
    },
    {
        nombre: 'Aprender React Hooks',
        descripcion: 'Ver tutoriales y hacer proyectos pequeños',
        categoria: 'Programación'
    },
    {
        nombre: 'Escribir en mi diario',
        descripcion: 'Reflexionar sobre el día y establecer metas',
        categoria: 'Otro'
    },
    {
        nombre: 'Repasar conceptos de matemáticas',
        descripcion: 'Resolver problemas de álgebra y cálculo',
        categoria: 'Estudio'
    },
    {
        nombre: 'Beber 2 litros de agua',
        descripcion: 'Mantenerme hidratado durante todo el día',
        categoria: 'Salud'
    },
    {
        nombre: 'Leer artículos de tecnología',
        descripcion: 'Estar al día con las últimas tendencias tech',
        categoria: 'Lectura'
    },
    {
        nombre: 'Practicar TypeScript',
        descripcion: 'Convertir proyectos existentes a TypeScript',
        categoria: 'Programación'
    },
    {
        nombre: 'Hacer yoga',
        descripcion: 'Sesión de yoga de 15 minutos para flexibilidad',
        categoria: 'Salud'
    },
    {
        nombre: 'Estudiar estructuras de datos',
        descripcion: 'Entender árboles, grafos y algoritmos de búsqueda',
        categoria: 'Estudio'
    },
    {
        nombre: 'Leer novela antes de dormir',
        descripcion: 'Dedicar 30 minutos a la lectura recreativa',
        categoria: 'Lectura'
    },
    {
        nombre: 'Contribuir a Open Source',
        descripcion: 'Hacer al menos un PR a un proyecto de GitHub',
        categoria: 'Programación'
    },
    {
        nombre: 'Caminar 30 minutos',
        descripcion: 'Paseo al aire libre para despejar la mente',
        categoria: 'Salud'
    },
    {
        nombre: 'Aprender diseño de APIs',
        descripcion: 'Estudiar REST y GraphQL',
        categoria: 'Estudio'
    },
    {
        nombre: 'Leer documentación técnica',
        descripcion: 'Explorar docs de nuevas tecnologías',
        categoria: 'Lectura'
    },
    {
        nombre: 'Practicar algoritmos',
        descripcion: 'Resolver 2 problemas en LeetCode',
        categoria: 'Programación'
    },
    {
        nombre: 'Cocinar comida saludable',
        descripcion: 'Preparar mis comidas en lugar de pedir delivery',
        categoria: 'Salud'
    }
];

async function seedCommunityHabits() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Conectado a la base de datos');

        // Obtener todos los usuarios
        const users = await User.find({ status: 'active' });
        
        if (users.length === 0) {
            console.log('❌ No hay usuarios en la base de datos. Primero crea usuarios.');
            process.exit(1);
        }

        console.log(`📊 Encontrados ${users.length} usuarios`);

        // Limpiar hábitos existentes (opcional)
        await CommunityHabit.deleteMany({});
        console.log('🗑️  Hábitos anteriores eliminados');

        // Crear hábitos aleatorios asignados a usuarios
        const habitsToInsert = habitsData.map(habit => {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            return {
                ...habit,
                userId: randomUser._id,
                userName: `${randomUser.firstname} ${randomUser.lastname}`.trim() || randomUser.email,
                likes: [],
                likesCount: Math.floor(Math.random() * 15), // Likes aleatorios entre 0-14
                fechaPublicacion: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Fecha aleatoria últimos 30 días
            };
        });

        await CommunityHabit.insertMany(habitsToInsert);
        console.log(`✅ ${habitsToInsert.length} hábitos insertados exitosamente`);

        // Mostrar estadísticas
        const stats = await CommunityHabit.aggregate([
            {
                $group: {
                    _id: '$categoria',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('\n📈 Estadísticas por categoría:');
        stats.forEach(stat => {
            console.log(`   ${stat._id}: ${stat.count} hábitos`);
        });

        console.log('\n✨ Seed completado exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al hacer seed:', error);
        process.exit(1);
    }
}

seedCommunityHabits();