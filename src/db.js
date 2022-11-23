const mongoose = require('mongoose');

const mongoUri = process.env.APP_MONGODB_URI

module.exports = function conexionLobby(){
  const conn = mongoose.createConnection(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 9000,
    dbName: "DB_HADRIA2_MASTER",
  });
  conn.model('User', require('../schemas/user'))
  conn.once("open", function() {
      console.log("HADRIA_2 On-Line");
  });
  conn.on('error',(err) =>{
    conn.close()
    console.log(err)
  })
  conn.on('close', () => {
    conn.close()
    console.log("Hasta luego")
  })
  conn.on('disconnect', () => {
    conn.close()
    console.log('Desconectado')
  })
  return conn
}