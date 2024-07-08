// import mongoose from 'mongoose';
// import { Service } from './models/Models';
const mongoose = require('mongoose');
const { Service, ServicePath } = require('./models/Models'); 
var uri = 'mongodb://127.0.0.1/FiwareInterface';
mongoose.Promise = global.Promise;


var db = mongoose.connection;
db.on('connecting', function () {console.log('Connecting to ', uri);});
db.on('connected', function () {console.log('Connected to ', uri);});
db.on('disconnecting', function () {console.log('Disconnecting from ', uri);});
db.on('disconnected', function () {console.log('Disconnected from ', uri);});
db.on('error', function (err) {console.error('Error ', err.message);});
(async function () {
try {
await mongoose.connect(uri);
//PATHS
let path;
path = new ServicePath({
  pathName: "/Madrid",
  devices: [
    {  device_id: "Oficina3" },
    { device_id:"Oficina4" }
  ]
}) 
await path.save();
path = new ServicePath({
   
    pathName: "/Valencia",
    devices: [
      { device_id:"Oficina3" },
      { device_id: "Oficina4" }
    ]
  });

  await path.save();
  let paths = await ServicePath.find();
  console.log(paths);
//SERVICIOS
let servicio;
servicio = new Service({

    apikey: 'apikey1',
    fiwareService: 'Santander',
    servicePaths: paths[0]
  });
await servicio.save();
servicio = new Service({ 
    apikey: 'apikey2',
    fiwareService: 'Caja Rural',
    servicePaths: paths[1]});
await servicio.save();
let servicios = await Service.find();
console.log(servicios);



} catch (err) {
console.error('Error', err.message);
} finally {
await mongoose.disconnect();
}
})();