import mongoose from "mongoose";

// Aqui se definen los modelos de datos para la base de datos
export const roles = ['user', 'admin']
export const status = ['active', 'inactive', 'suspended']
export const providers = ['local', 'google']

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: roles,
        default: 'user'
    },
    status: {
        type: String,
        enum: status,
        default: 'active'
    },
    provider: {
        type: String,
        enum: providers,
        default: 'local'
    },
    providerId: {
        type: String,
    },
    photo: {
        type: String,
        default: ''
    }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
export default User