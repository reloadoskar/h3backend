'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')
const express = require('express')
const cors = require('cors')
require('express-async-errors')
const { createApiErrorHandler } = require('../src/apiErrorHandler')

async function withServer(configure, run) {
  const app = express()
  app.use(cors())
  configure(app)
  app.use(createApiErrorHandler({ logger: () => {} }))
  const server = await new Promise(resolve => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance))
  })

  try {
    const address = server.address()
    await run(`http://127.0.0.1:${address.port}`)
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
}

test('async route failures return safe JSON with CORS instead of terminating the process', async () => {
  await withServer(
    app => app.get('/boom', async () => {
      throw new Error('sensitive internal details')
    }),
    async baseUrl => {
      const response = await fetch(`${baseUrl}/boom`, {
        headers: { Origin: 'https://hadria2.netlify.app' }
      })
      assert.equal(response.status, 500)
      assert.equal(response.headers.get('access-control-allow-origin'), '*')
      assert.deepEqual(await response.json(), {
        status: 'error',
        message: 'Ocurrió un error interno al procesar la solicitud.'
      })
    }
  )
})

test('unhandled duplicate writes return a safe conflict response', async () => {
  await withServer(
    app => app.post('/duplicate', async () => {
      throw Object.assign(new Error('duplicate details'), { code: 11000 })
    }),
    async baseUrl => {
      const response = await fetch(`${baseUrl}/duplicate`, { method: 'POST' })
      assert.equal(response.status, 409)
      assert.deepEqual(await response.json(), {
        status: 'error',
        message: 'Ya existe un registro con esos datos.'
      })
    }
  )
})
