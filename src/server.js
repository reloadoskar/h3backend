require('dotenv').config()
var app = require('./app');
var mongoose = require('mongoose')
const PORT = process.env.PORT || 8000
mongoose.Promise = global.Promise;

const server = app.listen(PORT, () => {
    console.log('HADRIA 3 SERVER -- Escuchando desde el puerto: '+PORT);
    console.log("Corriendo en ambiente: "  + process.env.NODE_ENV);
})

process.on('uncaughtException', err => {
    console.log(`ERROR DE CONEXION: ${err.message}`)
    // process.exit(1)
  })

process.on('SIGINT', function(err) {
    console.log("APAGANDO SERVIDOR.")
    mongoose.connection.close()
    process.exit(err ? 1 : 0)
})