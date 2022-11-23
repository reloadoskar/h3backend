require('dotenv').config()
var app = require('./app');
var mongoose = require('mongoose')
const PORT = process.env.PORT || 8000
mongoose.Promise = global.Promise;

const server = app.listen(PORT, () => {
    console.log('HADRIA 3 SERVER -- Escuchando desde el puerto: '+PORT);
    console.log("Corriendo en ambiente: "  + process.env.NODE_ENV);
})

process.on('SIGINT', function(err) {
    console.log("APAGANDO SERVIDOR.")
    process.exit(err ? 1 : 0)
})