import bcrypt from 'bcrypt'

/**
 * Genera un hash de una contraseña
 * @param {string} password - Contraseña a hashear
 * @returns {Promise<string>} - Hash de la contraseña
 */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS))
    return await bcrypt.hash(password, salt)
}