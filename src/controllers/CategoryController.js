import Category from "../models/Category.js";

export class CategoryController {

    static createCategory = async (req, res) => {
        try {
            const { name, description, color, icon } = req.body;
            const userId = req.user._id
            const isAdmin = req.user.role === 'admin'
            
            // Si es admin busca si ya existe una categoría pública con ese nombre
            // Si es user, busca si ya tiene una cat pública con ese nombre
            const query = {
                name: { $regex: new RegExp(`^${name}$`, 'i')},
                user: isAdmin ? null : userId
            }


            const categoryExists = await Category.findOne({query})

            if (categoryExists) {
                return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
            }

            // Crear nueva categoría
            const category = new Category({
                name,
                description,
                color,
                icon,
                user: isAdmin ? null : userId,
                isPublic: isAdmin
            });

            await category.save();
            res.status(201).send('Categoría creada correctamente');

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al crear la categoría' });
        }
    }

    static getAllCategories = async (req, res) => {
        try {
            const categories = await Category.find({
                $or: [
                    { isPublic: true },
                    { user: req.user._id }
                ]
            }).sort({ name: 1 });
            res.json(categories);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al obtener las categorías' });
        }
    }

    static getCategoryById = async (req, res) => {
        try {
            const { id } = req.params;

            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({ error: 'Categoría no encontrada' });
            }

            res.json(category);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al obtener la categoría' });
        }
    }

    static updateCategory = async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, color, icon } = req.body;

            // Verificar que la categoría existe
            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({ error: 'Categoría no encontrada' });
            }

            // Si se está actualizando el nombre, verificar que no exista otra categoría con ese nombre
            if (name && name !== category.name) {
                const nameExists = await Category.findOne({
                    name: { $regex: new RegExp(`^${name}$`, 'i') },
                    _id: { $ne: id }
                });

                if (nameExists) {
                    return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
                }
            }

            // Actualizar campos
            if (name) category.name = name;
            if (description) category.description = description;
            if (color) category.color = color;
            if (icon) category.icon = icon;

            await category.save();
            res.send('Categoría actualizada correctamente');

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al actualizar la categoría' });
        }
    }

    static deleteCategory = async (req, res) => {
        try {
            const { id } = req.params;

            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json({ error: 'Categoría no encontrada' });
            }

            // TODO: Verificar si la categoría está asociada a hábitos existentes
            // Esto se implementará cuando se cree el modelo de Hábitos
            // const habitsCount = await Habit.countDocuments({ category: id });
            // if (habitsCount > 0) {
            //     return res.status(400).json({ 
            //         error: 'No se puede eliminar la categoría porque tiene hábitos asociados' 
            //     });
            // }

            await category.deleteOne();
            res.send('Categoría eliminada correctamente');

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al eliminar la categoría' });
        }
    }

}
