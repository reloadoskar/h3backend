'use strict'

const assert = require('node:assert/strict')
const test = require('node:test')

const dbuserPath = require.resolve('../src/dbuser')
const controllerPath = require.resolve('../controllers/producto')

function loadController(create) {
  let closeCalls = 0
  const connection = {
    model() {
      return { create }
    },
    async close() {
      closeCalls += 1
    }
  }

  require.cache[dbuserPath] = {
    id: dbuserPath,
    filename: dbuserPath,
    loaded: true,
    exports: async () => connection
  }
  delete require.cache[controllerPath]

  return {
    controller: require(controllerPath),
    getCloseCalls: () => closeCalls
  }
}

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    send(body) {
      this.body = body
      return this
    }
  }
}

const validRequest = {
  body: {
    user: { database: 'TEST' },
    data: {
      clave: 'abc',
      descripcion: 'Producto de prueba',
      unidad: '507f1f77bcf86cd799439011',
      empaque: '507f1f77bcf86cd799439012'
    }
  }
}

test('producto save normalizes fields and returns the persisted product', async () => {
  let createdData
  const savedProduct = {
    _id: '507f1f77bcf86cd799439013',
    async populate() {}
  }
  const { controller, getCloseCalls } = loadController(async data => {
    createdData = data
    return savedProduct
  })
  const response = createResponse()
  const request = {
    body: {
      ...validRequest.body,
      data: {
        ...validRequest.body.data,
        clave: ' abc ',
        descripcion: ' producto de prueba '
      }
    }
  }

  await controller.save(request, response)

  assert.equal(response.statusCode, 200)
  assert.equal(response.body.status, 'success')
  assert.equal(response.body.producto, savedProduct)
  assert.equal(createdData.clave, 'ABC')
  assert.equal(createdData.descripcion, 'PRODUCTO DE PRUEBA')
  assert.equal(getCloseCalls(), 1)
})

test('producto save accepts populated unidad and empaque objects sent by the product form', async () => {
  let createdData
  const savedProduct = {
    _id: '507f1f77bcf86cd799439013',
    async populate() {}
  }
  const { controller, getCloseCalls } = loadController(async data => {
    createdData = data
    return savedProduct
  })
  const response = createResponse()
  const request = {
    body: {
      ...validRequest.body,
      data: {
        ...validRequest.body.data,
        unidad: {
          _id: validRequest.body.data.unidad,
          unidad: 'Cajas',
          abr: 'Cjs'
        },
        empaque: {
          _id: validRequest.body.data.empaque,
          empaque: 'Cajas',
          abr: 'Cjs'
        }
      }
    }
  }

  await controller.save(request, response)

  assert.equal(response.statusCode, 200)
  assert.equal(createdData.unidad, validRequest.body.data.unidad)
  assert.equal(createdData.empaque, validRequest.body.data.empaque)
  assert.equal(getCloseCalls(), 1)
})

test('producto save returns 409 for duplicate clave without rejecting or killing the process', async () => {
  const duplicate = Object.assign(new Error('duplicate'), {
    code: 11000,
    keyPattern: { clave: 1 }
  })
  const { controller, getCloseCalls } = loadController(async () => { throw duplicate })
  const response = createResponse()

  await assert.doesNotReject(() => controller.save(validRequest, response))

  assert.equal(response.statusCode, 409)
  assert.deepEqual(response.body, {
    status: 'error',
    message: 'Ya existe un producto con esa clave.'
  })
  assert.equal(getCloseCalls(), 1)
})

test('producto save returns 409 for duplicate descripcion', async () => {
  const duplicate = Object.assign(new Error('duplicate'), {
    code: 11000,
    keyPattern: { descripcion: 1 }
  })
  const { controller, getCloseCalls } = loadController(async () => { throw duplicate })
  const response = createResponse()

  await controller.save(validRequest, response)

  assert.equal(response.statusCode, 409)
  assert.deepEqual(response.body, {
    status: 'error',
    message: 'Ya existe un producto con esa descripción.'
  })
  assert.equal(getCloseCalls(), 1)
})

test('producto save returns a safe 500 response for unexpected persistence errors', async () => {
  const { controller, getCloseCalls } = loadController(async () => {
    throw new Error('internal database details')
  })
  const response = createResponse()

  await assert.doesNotReject(() => controller.save(validRequest, response))

  assert.equal(response.statusCode, 500)
  assert.deepEqual(response.body, {
    status: 'error',
    message: 'No fue posible guardar el producto.'
  })
  assert.equal(getCloseCalls(), 1)
})

test('producto save reports success if populate fails after the product was persisted', async () => {
  const savedProduct = {
    _id: '507f1f77bcf86cd799439013',
    clave: 'ABC',
    descripcion: 'PRODUCTO DE PRUEBA',
    async populate() {
      throw new Error('populate failed after insert')
    }
  }
  const { controller, getCloseCalls } = loadController(async () => savedProduct)
  const response = createResponse()

  await assert.doesNotReject(() => controller.save(validRequest, response))

  assert.equal(response.statusCode, 200)
  assert.equal(response.body.status, 'success')
  assert.equal(response.body.producto, savedProduct)
  assert.equal(getCloseCalls(), 1)
})

test('producto save rejects invalid unidad and empaque before opening a tenant connection', async () => {
  const { controller, getCloseCalls } = loadController(async () => {
    throw new Error('create must not run')
  })
  const response = createResponse()
  const request = {
    body: {
      user: { database: 'TEST' },
      data: { clave: 'ABC', descripcion: 'Producto', unidad: 'invalid', empaque: '' }
    }
  }

  await assert.doesNotReject(() => controller.save(request, response))

  assert.equal(response.statusCode, 400)
  assert.deepEqual(response.body, {
    status: 'error',
    message: 'La unidad y el empaque del producto no son válidos.'
  })
  assert.equal(getCloseCalls(), 0)
})

test('producto save rejects populated references with non-canonical ObjectIds', async () => {
  const { controller, getCloseCalls } = loadController(async () => {
    throw new Error('create must not run')
  })

  for (const invalidReference of [{ _id: 12 }, { _id: 'abcdefghijkl' }, {}]) {
    const response = createResponse()
    const request = {
      body: {
        ...validRequest.body,
        data: {
          ...validRequest.body.data,
          unidad: invalidReference
        }
      }
    }

    await controller.save(request, response)

    assert.equal(response.statusCode, 400)
    assert.equal(response.body.message, 'La unidad y el empaque del producto no son válidos.')
  }

  assert.equal(getCloseCalls(), 0)
})

test('producto save returns a safe generic conflict for an obsolete unknown index', async () => {
  const duplicate = Object.assign(new Error('duplicate'), {
    code: 11000,
    keyPattern: { nombre: 1 }
  })
  const { controller } = loadController(async () => { throw duplicate })
  const response = createResponse()

  await controller.save(validRequest, response)

  assert.equal(response.statusCode, 409)
  assert.equal(response.body.message, 'Ya existe un producto con esos datos.')
})
