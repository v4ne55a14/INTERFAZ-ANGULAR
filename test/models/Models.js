const assert = require("chai").assert;
const mongoose = require("mongoose");

// Importamos los modelos
const { Service, Device, ServicePath } = require("../../src/models/Models.js");
// import { assert } from 'chai';
// import mongoose from 'mongoose';

// // Importamos los modelos
// import  Service from '../../src/models/Models.js';
// import  Device from '../../src/models/Models.js';
// import  ServicePath from '../../src/models/Models.js';
const uri = 'mongodb://127.0.0.1/FiwareInterface';

describe("servicio,device,servicepath", async function () {
  // Path
  let path;
  const pathName = '/Albacete';
  let devices = [];
  
  // Servicio
  let service;
  const apikey = '123';
  const fiwareService = 'BBVA';
  
  // Device
  let device;
  const device_id = 'Oficina1';

  // Nos conectamos a la bbdd
  before(async function () {
    await mongoose.connect(uri);
  });

  // Creamos y guardamos los objetos
  beforeEach(async function () {
    // Borramos de la bbdd cualquier objeto anterior
    await Service.deleteMany();
    await Device.deleteMany();
    await ServicePath.deleteMany();

    // Creamos y guardamos el device
    device = new Device({ device_id  });
    await device.save();
    devices.push(device); // Añadimos el device al array de devices

    // Creamos y guardamos el path
    path = new ServicePath({ pathName, devices });
    await path.save();

    // Creamos y guardamos el service
    const servicePaths = [path]; // Inicializamos correctamente el servicePaths con el path guardado
    service = new Service({ apikey, fiwareService, servicePaths });
    await service.save();
  });

  // Constructor
  it("constructor", async function () {
    assert.exists(device._id);
    assert.exists(path._id);
    assert.exists(service._id);
  });

  // Getters
  it("getters", async function () {
    let device_actual = await Device.findById(device._id);
    assert.equal(device_actual.device_id, device_id);

    let path_actual = await ServicePath.findById(path._id);
    assert.equal(path_actual.pathName, pathName);

    let service_actual = await Service.findById(service._id);
    assert.equal(service_actual.fiwareService, fiwareService);
  });

  // Setters
  it("setters", async function () {
    const device_id2 = "Oficina2";
    device.device_id = device_id2;
    await device.save();
    let device_actual = await Device.findById(device._id);
    assert.equal(device_actual.device_id ,device_id2);

    const pathName2 = "/Alicante";
    path.pathName = pathName2;
    await path.save();
    let path_actual = await ServicePath.findById(path._id);
    assert.equal(path_actual.pathName, pathName2);

    const fiwareService2 = "Bankinter";
    service.fiwareService = fiwareService2;
    await service.save();
    let service_actual = await Service.findById(service._id);
    assert.equal(service_actual.fiwareService, fiwareService2);
  });

  // Limpiamos la bbdd
  afterEach(async function () {
    await Service.deleteMany();
    await Device.deleteMany();
    await ServicePath.deleteMany();
  });

  // Nos desconectamos de la bbdd
  after(async function () {
    return await mongoose.disconnect();
  });
});
