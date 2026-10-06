'use strict'

function getJwtSecret(env = process.env) {
    const secret = env.SECRET_KEY
    if (!secret) {
        throw new Error('SECRET_KEY debe estar configurada.')
    }
    if (secret.length < 32) {
        throw new Error('SECRET_KEY debe tener al menos 32 caracteres.')
    }
    return secret
}

module.exports = { getJwtSecret }
