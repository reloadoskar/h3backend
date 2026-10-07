'use strict'

function createApiErrorHandler({ logger = console.error } = {}) {
    return function apiErrorHandler(error, req, res, next) {
        if (res.headersSent) return next(error)

        const duplicate = error && error.code === 11000
        const statusCode = duplicate ? 409 : 500
        logger('API request failed', {
            code: duplicate ? 11000 : 'INTERNAL_ERROR',
            method: req.method,
            path: req.path
        })

        return res.status(statusCode).send({
            status: 'error',
            message: duplicate
                ? 'Ya existe un registro con esos datos.'
                : 'Ocurrió un error interno al procesar la solicitud.'
        })
    }
}

module.exports = { createApiErrorHandler }
