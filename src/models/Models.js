// import mongoose from 'mongoose';
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  // el usuario añadirá atributos de configuracion del device cuando quiera
  device_id: {type: String, required:true},
  attrs:{type:Object}
});

//cada fiware-servicepath de manera independiente
const servicePathSchema = new mongoose.Schema({
  pathName: { type: String, required: true },
  devices: [deviceSchema]
});

//cada servicio tendra su fiware-service y uno o varios fiware-servicepath
const serviceSchema = new mongoose.Schema({
  apikey: {type: String, required:true},  
  fiwareService: { type: String, required: true },
  servicePaths: [servicePathSchema]
});


// Creo los modelos
const Device = mongoose.model('Device', deviceSchema);
const ServicePath = mongoose.model('ServicePath', servicePathSchema);
const Service = mongoose.model('Service', serviceSchema);

// Exporto los modelos
module.exports = { Device, ServicePath, Service };