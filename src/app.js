const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(cors({origin: '*'}));
// app.options('*', cors());
// const corsOptions = {
//   origin: ['*'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Methods", "Access-Control-Request-Headers"],
//   enablePreflight: true
// };
// app.use(cors(corsOptions));
const FiwareInterface = require("./models/fiware-interface");
// import FiwareInterface from './src/models/fiware-interface.js';
let model = new FiwareInterface();

///////////////////////////////////////////SERVICES//////////////////////////////////////////////////////
////borrar bbd
// app.delete("/FiwareInterface/api/bbdd",async(req, res) => {
//   await db.dropDatabase();
// });

//get services
app.options("/FiwareInterface/api/services", cors());
app.get("/FiwareInterface/api/services", cors(),async (req, res) => {
  let services = await model.getServices();
  res.status(200).json(services);
});

//get services by apikey
app.get("/FiwareInterface/api/services/:apikey", async (req, res) => {
  let apikey = req.params.apikey;
  let service = await model.serviceByApiKey(apikey);
  if (!service)
    res.status(404).json({
      message: `Service con apikey
          ${apikey} no encontrado`,
    });
  else res.status(200).json(service);
});

app.options("/FiwareInterface/api/services", cors());
//actualizar lista de services
app.put("/FiwareInterface/api/services", cors(), async (req, res) => {
  // await model.deleteServices();
  // await model.deletePaths();
  // await model.deleteDevices();
  let services = req.body;

  // Verificar si services es un array de objetos con la estructura esperada
  if (!Array.isArray(services) || !services.every(s => s.apikey && s.fiwareService && Array.isArray(s.servicePaths) && s.servicePaths.every(p => p.pathName))) {
    return res.status(400).json({ error: "Invalid input format. Expected an array of objects with apikey, fiwareService, and servicePaths with pathName." });
  }

  try {
    // Procesar y agregar cada servicio
    await Promise.all(
      services.map(async (s) => {
        // Agregar el servicio a la base de datos
        await model.agregarService(s.apikey, s.fiwareService, s.servicePaths);
      })
    );

    // Obtener los servicios actualizados
    const updatedServices = await model.getServices();

    // Responder con los servicios actualizados
    res.status(200).json(updatedServices);
    console.log("servicio creado correctamente");
  } catch (error) {
    console.error("Error al procesar los servicios:", error);
    res.status(500).json({ error: error.message });
  }
});

app.options("/FiwareInterface/api/services/:apikey", cors());
//eliminar service
app.delete("/FiwareInterface/api/services/:apikey",cors(), async (req, res) => {
  let apikey = req.params.apikey;
  let service = await model.serviceByApiKey(apikey);
  if (!service)
    res
      .status(404)
      .json({ message: `Service con apikey ${apikey} no encontrado` });
  else {
    await model.eliminarServiceByApikey(apikey);
    console.log("servicio eliminado");
    res.status(200).json(service);
  }
});

// // //agregar service
// // app.post("/FiwareInterface/api/services", async (req, res) => {
// //   await model.deleteServices();
// //   let service = req.body;
// //   service = await model.agregarService(
// //     service.apikey,
// //     service.fiwareService,
// //     service.servicePaths
// //   );
// //   res.status(200).json(service);
// // });

// ///////////////////////////////////////////PATHS//////////////////////////////////////////////////////
//get paths
app.get("/FiwareInterface/api/paths", async (req, res) => {
  let paths = await model.getPaths();
  res.status(200).json(paths);
});

//obtener servicePaths de un Service
app.get("/FiwareInterface/api/services/:apikey/paths", async (req, res) => {
  let apikey = req.params.apikey;
  let service = await model.serviceByApiKey(apikey);
  if (!service)
    res.status(404).json({
      message: `Service con apikey
          ${apikey} no encontrado`,
    });
  else {
    let paths = await model.servicePathsByApiKey(apikey);
    res.status(200).json(paths);
  }
});


app.put("/FiwareInterface/api/paths/:apikey", async (req, res) => {
  // await model.deletePaths();
  let paths = req.body;
  let apikey = req.params.apikey;
  let path;
  paths = await Promise.all(
    paths.map(async (s) => {
      path = await model.agregarServicePath(s.pathName, s.devices, apikey);
      return path;
    })
  );
  res.status(200).json(paths);
});

// AÑADIR PATH A UN SERVICE
app.put("/FiwareInterface/api/services/:apikey/paths", async (req, res) => {
  try {
    // await model.deletePaths();
    let apikey = req.params.apikey;
    let paths = req.body;
    let spaths = await model.agregarServicePathToAService(paths, apikey);
    res.status(200).json(spaths);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// // //crear path
// // app.post("/FiwareInterface/api/paths/:service/:pathName", (req, res) => {
// //   let pathName = req.params.pathName;
// //   let service = req.params.service;
// //   let path = model.agregarPath(service,pathName);
// //   res.status(200).json(path);
// // });

app.options("/FiwareInterface/api/paths/:pathName/:apikey", cors());
//eliminar path by name y apikey
app.delete("/FiwareInterface/api/paths/:pathName/:apikey",cors(), async (req, res) => {
  try {
    let pathName = req.params.pathName;
    pathName = "/" + pathName;
    let apikey = req.params.apikey;
    let paths = await model.eliminarPathByNamendApikey(pathName, apikey);
    res.status(200).json(paths);
  } catch (error) {
    res.status(500).send(error.message); // Maneja errores y envía una respuesta de error
  }
});

// ///////////////////////////////////////////DEVICES//////////////////////////////////////////////////////

//get devices
app.get("/FiwareInterface/api/devices", async (req, res) => {
  let devices = await model.getDevices();
  res.status(200).json(devices);
});

//obtener devices de un servicePaths
app.get("/FiwareInterface/api/services/:apikey/devices", async (req, res) => {
  let apikey = req.params.apikey;
  let path = req.body;
  //paso1; obtenemos el servicio
  let service = await model.serviceByApiKey(apikey);
  if (!service)
    res.status(404).json({
      message: `Service con apikey
          ${apikey} no encontrado`,
    });
  else {
    //paso2: obtenemos los paths
    let paths = await model.servicePathsByApiKey(apikey);
    //paso2: obtenemos el path
    path = paths.find((p) => p.pathName === path.pathName);
    //paso 3: obtenemos sus devices
    let devices = path.devices;
    res.status(200).json(await model.getDevices());
  }
});

app.put("/FiwareInterface/api/devices", async (req, res) => {
  // await model.deleteDevices();
  let devices = req.body;
  let device;
  devices = await Promise.all(
    devices.map(async (s) => {
      device = await model.agregarDevice(s.device_id, s.attrs);
      return device;
    })
  );
  res.status(200).json(devices);
});

//AÑADIR DEVICES A UN PATH
app.options("/FiwareInterface/api/services/:apikey/:pathName/devices", cors());
app.put(
  "/FiwareInterface/api/services/:apikey/:pathName/devices",
  cors(),
  async (req, res) => {
    try {
      // await model.deleteServices();
      // await model.deletePaths();
      // await model.deleteDevices();
      let apikey = req.params.apikey;
      let pathName = req.params.pathName;
      pathName = '/' + pathName;
      let devices = req.body;
      if (Array.isArray(devices) && typeof devices[0] === 'string') {
        devices = devices.map(device_id => ({
          device_id: device_id,
          attrs: {}
        }));
      }
      await model.agregarDeviceToAServicePath(apikey, pathName, devices);
      console.log("device creado/añadido correctamente");
      res.status(200).json(await model.getDevices());
    } catch (error) {
      res.status(500).send(error.message); // Maneja errores y envía una respuesta de error
    }
  }
);

//eliminar device
app.options("/FiwareInterface/api/services/:apikey/:pathName/devices/:device_id", cors());
app.delete(
  "/FiwareInterface/api/services/:apikey/:pathName/devices/:device_id", cors(),  async (req, res) => {
    try {
      let apikey = req.params.apikey;
      let pathName = req.params.pathName;
      pathName = "/" + pathName;
      let device_id = req.params.device_id;
      // let device_id = device.device_id;
      // let device_id = device;
      let deviceR = await model.eliminarDevice(device_id, pathName, apikey);
      console.log("device eliminado")
      res.status(200).json(deviceR);
    } catch (error) {
      res.status(500).send(error.message); // Maneja errores y envía una respuesta de error
    }
  }
);

// app.put("/FiwareInterface/api/devices/:did/attrs", async (req, res) => {
//   try {
//     const  did  = req.params;
//     const  attrs  = req.body;
//     const device = await model.agregarAttrsDevice(did, attrs);
//     res.status(200).json(device);
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// });

const mongoose = require("mongoose");
const { Service, ServicePath, Device } = require("./models/Models");
var uri = "mongodb://127.0.0.1/FiwareInterface";
mongoose.Promise = global.Promise;

// app.use('/api/services', cors(corsOptions));
// app.use('/api/devices', cors(corsOptions));
// app.use('/api/paths', cors(corsOptions));
var db = mongoose.connection;
db.on("connecting", function () {
  console.log("Connecting to ", uri);
});
db.on("connected", function () {
  console.log("Connected to ", uri);
});
db.on("disconnecting", function () {
  console.log("Disconnecting from ", uri);
});
db.on("disconnected", function () {
  console.log("Disconnected from ", uri);
});
db.on("error", function (err) {
  console.error("Error ", err.message);
});
(async function () {
  try {
    await mongoose.connect(uri);
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log("Ejecutando Servidor en el puerto " + PORT);
    });
  } catch (err) {
    console.error("Error", err.message);
  } finally {
    // await mongoose.disconnect();
  }
})();
