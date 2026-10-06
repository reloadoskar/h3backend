'use strict'

const jwt = require('jsonwebtoken')
const { getJwtSecret } = require('./jwtSecret')

const PUBLIC_PATHS = new Set(['/user/login', '/client/register'])

function createAuthenticateApi({ secret = getJwtSecret() } = {}) {
  return function authenticateApi(req, res, next) {
    if (req.method === 'OPTIONS' || PUBLIC_PATHS.has(req.path)) return next()

    const authorization = req.headers && req.headers.authorization
    const match = typeof authorization === 'string' && authorization.match(/^Bearer\s+(.+)$/i)
    if (!match) {
      return res.status(401).send({ status: 'error', message: 'Sesión no válida o expirada.' })
    }

    try {
      const decoded = jwt.verify(match[1], secret, { algorithms: ['HS256'] })
      if (!decoded._id || typeof decoded.database !== 'string' || !decoded.database || !Number.isFinite(decoded.level)) {
        throw new Error('JWT claims inválidos')
      }
      const authenticatedUser = {
        _id: decoded._id,
        nombre: decoded.nombre,
        apellido: decoded.apellido,
        email: decoded.email,
        ubicacion: decoded.ubicacion,
        level: decoded.level,
        database: decoded.database,
        tryPeriodEnds: decoded.tryPeriodEnds,
        paidPeriodEnds: decoded.paidPeriodEnds
      }
      req.auth = authenticatedUser
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) req.body = {}
      req.body.database = authenticatedUser.database
      req.body.user = authenticatedUser
      return next()
    } catch (error) {
      return res.status(401).send({ status: 'error', message: 'Sesión no válida o expirada.' })
    }
  }
}

function enforceAuthenticatedDatabase(req, res, next, requestedDatabase) {
  const authenticatedDatabase = req.auth && req.auth.database
  if (!authenticatedDatabase || requestedDatabase !== authenticatedDatabase) {
    return res.status(403).send({ status: 'error', message: 'No tiene acceso a esta empresa.' })
  }
  req.params.bd = authenticatedDatabase
  return next()
}

module.exports = { createAuthenticateApi, enforceAuthenticatedDatabase }
