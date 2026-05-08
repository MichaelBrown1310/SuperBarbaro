const axios = require('axios')
const fs = require('fs')
const path = require('path')
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const usuariosRoutes = require("./routes/usuariosRoutes");
const inventarioRoutes = require("./routes/inventarioRoutes");
const menuRoutes = require("./routes/menuRoutes");
const pedidosRoutes = require("./routes/pedidosRoutes");
const alertasRoutes = require("./routes/alertasRoutes");
const insumosRoutes = require("./routes/insumosRoutes");
const productosMenuRoutes = require("./routes/productosMenuRoutes");

const usuariosController = require("./controllers/usuariosController");
const pedidosController = require("./controllers/pedidosController");


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

usuariosController.setIO(io);

app.use(cors());
app.use(bodyParser.json());

app.use('/uploads', express.static('uploads'));

async function descargarImagen(url) {

  const nombre = Date.now() + '.jpg'

  const ruta = path.join(__dirname, 'uploads', nombre)

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  const writer = fs.createWriteStream(ruta)

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {

    writer.on('finish', () => {
      resolve(nombre)
    })

    writer.on('error', reject)

  })
}

app.use(usuariosRoutes);

pedidosController.setIO(io);

app.use(inventarioRoutes);
app.use(menuRoutes);
app.use(pedidosRoutes);
app.use(alertasRoutes);
app.use(insumosRoutes);
app.use(productosMenuRoutes);

io.on('connection', () => {
  console.log('Cliente conectado por socket');
});

server.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});
