'use strict'

const assert = require('assert')
const http = require('http')

const payload = JSON.stringify({
  usuario: 'qa-no-existe@invalid.local',
  password: 'credencial-invalida'
})

const request = http.request({
  hostname: '127.0.0.1',
  port: 8080,
  path: '/api/user/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  },
  timeout: 30000
}, response => {
  let body = ''
  response.setEncoding('utf8')
  response.on('data', chunk => { body += chunk })
  response.on('end', () => {
    try {
      const data = JSON.parse(body)
      assert.strictEqual(response.statusCode, 401)
      assert.strictEqual(data.status, 'error')
      assert.strictEqual(data.message, 'Usuario o contraseña incorrectos.')
      assert.strictEqual(Object.prototype.hasOwnProperty.call(data, 'err'), false)
      console.log('PASS login inválido devuelve un error seguro y útil')
    } catch (error) {
      console.error(error.stack || error)
      process.exitCode = 1
    }
  })
})

request.on('timeout', () => request.destroy(new Error('Timeout al probar el login')))
request.on('error', error => {
  console.error(error.stack || error)
  process.exitCode = 1
})
request.end(payload)
