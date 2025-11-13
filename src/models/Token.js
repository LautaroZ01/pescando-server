import mongoose, { Schema, Types } from "mongoose";

const tokenSchema = new Schema({
    token: {
        type: String,
        require: true
    },
    user: {
        type: Types.ObjectId,
        ref: 'User'
    },
    expiresAt: {
        type: Date,
        default: () => Date.now() + 10 * 60 * 1000,
        expires: 600
    }
})

const Token = mongoose.model('Token', tokenSchema)
export default Token