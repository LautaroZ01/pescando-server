import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        required: true,
        trim: true,
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'El color debe ser un código hexadecimal válido']
    },
    icon: {
        type: String,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        default: null
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

categorySchema.index({name: 1, user: 1}, {unique: true})

const Category = mongoose.model('Category', categorySchema)
export default Category
