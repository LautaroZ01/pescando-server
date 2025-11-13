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

/**
 * Verifica si una contraseña es correcta
 * @param {string} enteredPassword - Contraseña ingresada por el usuario
 * @param {string} storedHash - Hash almacenado en la base de datos
 * @returns {Promise<boolean>} - True si la contraseña es correcta, false en caso contrario
 */
export const checkPassword = async (enteredPassword, storedHash) => {
    return await bcrypt.compare(enteredPassword, storedHash)
}