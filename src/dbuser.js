const mongoose = require('mongoose');
const mongoUri = process.env.APP_MONGODB_URI

function normalizeTenantUser(user) {
    const normalized = typeof user === 'string'
        ? { nombre: 'Usuario autenticado', database: user }
        : { nombre: user && user.nombre, database: user && user.database }
    if (!normalized.database || typeof normalized.database !== 'string') {
        throw new Error('El tenant autenticado no es válido.')
    }
    return normalized
}

async function conexionCliente(user) {
    const tenantUser = normalizeTenantUser(user)
    console.log("DB> Hola: "+tenantUser.nombre);

    const conn = mongoose.createConnection(mongoUri, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
              connectTimeoutMS: 9000,
              maxPoolSize: 10,
              dbName: "HDR_USR_"+tenantUser.database,
          })
          conn.model('Balance', require('../schemas/balance'));
          conn.model('Cliente', require('../schemas/cliente'));
          conn.model('CompraItem', require('../schemas/compra_item'));
          conn.model('Compra', require('../schemas/compra'));
          conn.model('Concepto', require('../schemas/concepto'));
          conn.model('Corte', require('../schemas/corte'));
          conn.model('Egreso', require('../schemas/egreso'));
          conn.model('Empaque', require('../schemas/empaque'));
          conn.model('Empleado', require('../schemas/empleado'));
          conn.model('Empresa', require('../schemas/empresa'));
          conn.model('Ingreso', require('../schemas/ingreso'));
          conn.model('Insumo', require('../schemas/insumo'));
          conn.model('Inversion', require('../schemas/inversion'));
          conn.model('Movimiento', require('../schemas/movimiento'));
          conn.model('Pago', require('../schemas/pago'));
          conn.model('PorCobrarCuenta', require('../schemas/porCobrarCuenta'));
          conn.model('PorPagarCuenta', require('../schemas/porPagarCuenta'));
          conn.model('Produccion', require('../schemas/produccion'));
          conn.model('ProduccionItem', require('../schemas/produccionItem'));
          conn.model('Producto', require('../schemas/producto'));
          conn.model('Provedor', require('../schemas/provedor'));
          conn.model('Status', require('../schemas/status'));
          conn.model('TipoCompra', require('../schemas/tipoCompra'));
          conn.model('TipoPago', require('../schemas/tipoPago'));
          conn.model('TipoVenta', require('../schemas/tipoVenta'));
          conn.model('Ubicacion', require('../schemas/ubicacion'));
          conn.model('Unidad', require('../schemas/unidad'));
          conn.model('Venta', require('../schemas/venta'));
          conn.model('VentaItem', require('../schemas/venta_item'));
          conn.model('Liquidacion', require('../schemas/liquidacion'));
          conn.model('Cambio', require('../schemas/cambio'));
          
          conn.on('connected', function(){
            console.log("BD> Bienvenido. ✅")
          })
          conn.on('disconnected', function(){
            mongoose.connection.close(() => {
              console.log("BD> Hasta luego "+ tenantUser.nombre +" 🤖🖖");
            })
          })
          conn.on('error', function(err){
            console.log("BD> ERROR!!! " + err.message)
            // mongoose.disconnect()
          })
    return conn; 
}

module.exports = conexionCliente
module.exports.normalizeTenantUser = normalizeTenantUser
