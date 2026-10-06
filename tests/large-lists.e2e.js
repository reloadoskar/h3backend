'use strict'

const assert = require('assert')
const http = require('http')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { getJwtSecret } = require('../src/jwtSecret')
require('dotenv').config()

let authToken = null

function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body)
    const request = http.request({
      hostname: '127.0.0.1',
      port: 8080,
      path,
      method: 'POST',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      }
    }, response => {
      let raw = ''
      response.setEncoding('utf8')
      response.on('data', chunk => { raw += chunk })
      response.on('end', () => {
        try {
          resolve({ status: response.statusCode, data: JSON.parse(raw) })
        } catch (error) {
          reject(new Error(`Respuesta inválida de ${path}: ${raw.slice(0, 200)}`))
        }
      })
    })
    request.on('timeout', () => request.destroy(new Error(`Timeout en ${path}`)))
    request.on('error', reject)
    request.end(payload)
  })
}

function get(path) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      hostname: '127.0.0.1',
      port: 8080,
      path,
      method: 'GET',
      timeout: 60000,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    }, response => {
      let raw = ''
      response.setEncoding('utf8')
      response.on('data', chunk => { raw += chunk })
      response.on('end', () => {
        try {
          resolve({ status: response.statusCode, data: JSON.parse(raw) })
        } catch (error) {
          reject(new Error(`Respuesta inválida de ${path}: ${raw.slice(0, 200)}`))
        }
      })
    })
    request.on('timeout', () => request.destroy(new Error(`Timeout en ${path}`)))
    request.on('error', reject)
    request.end()
  })
}

async function getTenantFixture() {
  const master = await mongoose.createConnection(process.env.APP_MONGODB_URI, {
    dbName: 'DB_HADRIA2_MASTER',
    serverSelectionTimeoutMS: 10000
  }).asPromise()
  const User = master.model('User', require('../schemas/user'))
  const users = await User.find({ database: { $type: 'string' } }).select('nombre database').lean()

  let fixture = null
  for (const user of users) {
    const tenant = await mongoose.createConnection(process.env.APP_MONGODB_URI, {
      dbName: `HDR_USR_${user.database}`,
      serverSelectionTimeoutMS: 10000
    }).asPromise()
    const CompraItem = tenant.model('CompraItem', require('../schemas/compra_item'))
    const Compra = tenant.model('Compra', require('../schemas/compra'))
    const Movimiento = tenant.model('Movimiento', require('../schemas/movimiento'))
    const activeItems = await CompraItem.countDocuments({ stock: { $gt: 0 } })
    const latestPurchase = await Compra.findOne({ fecha: /^\d{4}-\d{2}-\d{2}$/ }).select('fecha').sort({ fecha: -1 }).lean()
    const latestMovement = await Movimiento.findOne({ fecha: /^\d{4}-\d{2}-\d{2}$/ }).select('fecha').sort({ createdAt: -1 }).lean()
    if (!fixture || activeItems > fixture.activeItems) {
      fixture = {
        user: { _id: user._id, nombre: user.nombre || 'QA', database: user.database, level: 1 },
        activeItems,
        purchaseMonth: latestPurchase ? latestPurchase.fecha.slice(0, 7) : null,
        movementDate: latestMovement ? latestMovement.fecha : null
      }
    }
    await tenant.close()
  }
  await master.close()
  return fixture
}

async function run() {
  const fixture = await getTenantFixture()
  assert(fixture && fixture.user, 'No se encontró tenant para la regresión')
  authToken = jwt.sign(fixture.user, getJwtSecret(), { expiresIn: '5m' })

  const profile = await get('/api/profile')
  assert.strictEqual(profile.status, 200)
  assert.strictEqual(profile.data.message, 'success')
  assert.ok(profile.data.user)
  assert.strictEqual(Object.prototype.hasOwnProperty.call(profile.data.user, 'password'), false)

  const mismatchedTenant = await post('/api/OTHER_TENANT/status/save', { nombre: 'No permitido' })
  assert.strictEqual(mismatchedTenant.status, 403)
  assert.strictEqual(mismatchedTenant.data.message, 'No tiene acceso a esta empresa.')

  const missingDate = await post('/api/inventario/movimientos', {
    user: fixture.user,
    pagination: { limit: 10 }
  })
  assert.strictEqual(missingDate.status, 400)
  assert.match(missingDate.data.message, /fecha/i)

  const invalidDateCursor = Buffer.from(JSON.stringify({createdAt: 'x', id: '507f1f77bcf86cd799439011'})).toString('base64')
  const invalidItemsCursor = await post('/api/items', {
    user: fixture.user,
    pagination: {limit: 25, cursor: invalidDateCursor}
  })
  assert.strictEqual(invalidItemsCursor.status, 400)

  const items = await post('/api/items', {
    user: fixture.user,
    pagination: { limit: 25 }
  })
  assert.strictEqual(items.status, 200)
  assert(items.data.items.length <= 25)
  assert(items.data.pagination)
  assert.strictEqual(typeof items.data.pagination.hasMore, 'boolean')
  if (items.data.items[0]) {
    assert.deepStrictEqual(
      Object.keys(items.data.items[0].compra).sort(),
      ['_id', 'clave', 'folio'].sort()
    )
    assert.deepStrictEqual(
      Object.keys(items.data.items[0].producto).sort(),
      ['_id', 'descripcion'].sort()
    )
    const term = String(items.data.items[0].producto.descripcion || '').trim().slice(0, 4)
    if (term) {
      const searchResult = await post('/api/items', {
        user: fixture.user,
        search: term,
        pagination: { limit: 25 }
      })
      assert.strictEqual(searchResult.status, 200)
      assert(searchResult.data.items.length <= 25)
      assert(searchResult.data.items.some(item =>
        String(item.producto && item.producto.descripcion || '').toLowerCase().includes(term.toLowerCase())
      ))
    }
  }
  if (items.data.pagination.hasMore) {
    const secondItems = await post('/api/items', {
      user: fixture.user,
      pagination: { limit: 25, cursor: items.data.pagination.nextCursor }
    })
    const firstIds = new Set(items.data.items.map(item => String(item._id)))
    assert(secondItems.data.items.every(item => !firstIds.has(String(item._id))))
  }

  if (fixture.movementDate) {
    const invalidMovementsCursor = await post('/api/inventario/movimientos', {
      user: fixture.user,
      fecha: fixture.movementDate,
      pagination: {limit: 5, cursor: invalidDateCursor}
    })
    assert.strictEqual(invalidMovementsCursor.status, 400)

    const movements = await post('/api/inventario/movimientos', {
      user: fixture.user,
      fecha: fixture.movementDate,
      pagination: { limit: 5 }
    })
    assert.strictEqual(movements.status, 200)
    assert(movements.data.movimientos.length <= 5)
    assert(movements.data.pagination)
    if (movements.data.pagination.hasMore) {
      const secondMovements = await post('/api/inventario/movimientos', {
        user: fixture.user,
        fecha: fixture.movementDate,
        pagination: { limit: 5, cursor: movements.data.pagination.nextCursor }
      })
      const firstIds = new Set(movements.data.movimientos.map(item => String(item._id)))
      assert(secondMovements.data.movimientos.every(item => !firstIds.has(String(item._id))))
    }
  }

  if (fixture.purchaseMonth) {
    const purchases = await post('/api/compras', {
      user: fixture.user,
      mesAnio: fixture.purchaseMonth,
      pagination: { limit: 10 }
    })
    assert.strictEqual(purchases.status, 200)
    assert(purchases.data.compras.length <= 10)
    assert(purchases.data.pagination)
    assert(purchases.data.totals)
    assert.strictEqual(typeof purchases.data.totals.operations, 'number')
    if (purchases.data.compras[0]) {
      const summary = purchases.data.compras[0]
      assert.strictEqual(summary.items, undefined)
      assert.strictEqual(summary.gastos, undefined)
      assert.strictEqual(summary.pagos, undefined)
      assert.strictEqual(summary.ventaItems, undefined)
      assert.strictEqual(typeof summary.totalVenta, 'number')
      assert.strictEqual(typeof summary.totalGastos, 'number')
      assert.strictEqual(typeof summary.totalPagos, 'number')
      assert.strictEqual(typeof summary.stock, 'number')
      assert.strictEqual(typeof summary.empaquesStock, 'number')
    }
    if (purchases.data.compras[0]) {
      const detail = await post('/api/compra/', {
        user: fixture.user,
        id: purchases.data.compras[0]._id
      })
      assert.strictEqual(detail.status, 200)
      assert(detail.data.data && detail.data.data.compra)
      assert.strictEqual(String(detail.data.data.compra._id), String(purchases.data.compras[0]._id))
      const detailCompra = detail.data.data.compra
      const sumImporte = rows => (rows || []).reduce((sum, row) => sum + Number(row && row.importe || 0), 0)
      const assertMoneyEqual = (actual, expected) => assert(Math.abs(actual - expected) < 0.001, `${actual} != ${expected}`)
      assertMoneyEqual(purchases.data.compras[0].totalVenta, sumImporte(detailCompra.ventaItems))
      assertMoneyEqual(purchases.data.compras[0].totalGastos, sumImporte(detailCompra.gastos))
      assertMoneyEqual(purchases.data.compras[0].totalPagos, sumImporte(detailCompra.pagos))
    }
    if (purchases.data.pagination.hasMore) {
      const secondPurchases = await post('/api/compras', {
        user: fixture.user,
        mesAnio: fixture.purchaseMonth,
        pagination: { limit: 10, cursor: purchases.data.pagination.nextCursor },
        includeTotals: false
      })
      assert.strictEqual(secondPurchases.data.totals, null)
      const firstIds = new Set(purchases.data.compras.map(item => String(item._id)))
      assert(secondPurchases.data.compras.every(item => !firstIds.has(String(item._id))))
    }
  }

  console.log('PASS listados grandes exigen filtros y respetan límites')
}

run().catch(error => {
  console.error(error.stack || error)
  process.exitCode = 1
})
