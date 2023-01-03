const mongoose = require('mongoose');

const mongoUri = process.env.APP_MONGODB_URI

module.exports = function conexionLobby(){
  const conn = mongoose.createConnection(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 9000,
    maxTimeMS:20000,
    dbName: "DB_HADRIA2_MASTER",
  });
  conn.model('User', require('../schemas/user'))
  conn.once("open", function() {
      console.log("CONECTADO CON LA BD 🖖🤖");
  });
  conn.on('error',(err) =>{
    conn.close()
    console.log(err)
  })
  conn.on('close', () => {
    conn.close()
    console.log("BD CLOSED!! 👾")
  })
  conn.on('disconnect', () => {
    conn.close()
    console.log('BD OUT!! 👾')
  })
  return conn
}