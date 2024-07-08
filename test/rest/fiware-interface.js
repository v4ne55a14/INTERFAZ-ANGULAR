const assert = require("chai").assert;
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
// import chai from 'chai';
// import chaiHttp from 'chai-http';
// const { assert } = chai;
chai.use(chaiHttp);

const URL = "http://localhost:3000/FiwareInterface/api";

describe("Testeo rutas", function () {

  const PATHS = [
    {
      pathName: "/Alicante",
      devices: [{ device_id: "Oficina3" }, { device_id: "Oficina4" }],
    },
  ];
  const PATHS2 = [
    {
      pathName: "/Albacete",
      devices: [],
    },
  ];
  const SERVICES = [
    {
      apikey: "apikey1",
      fiwareService: "Santander",
      servicePaths: PATHS,
    },
  ];

  const DEVICES = [{ device_id: "Oficina3" }, { device_id: "Oficina4" }];

  // beforeEach
  beforeEach(async function () {
    //Borrar datos bbdd
    // await chai.request(URL).delete("/bbdd");
    //////////////////////////SERVICES/////////////////////////////
    //////////////////////////PUT/////////////////////////////
    let response = await chai.request(URL).put("/services").send(SERVICES);
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let services = response.body;
    assert.deepEqual(services[0][0].apikey, SERVICES[0].apikey);
    ////////////////////////////GET/////////////////////////////
    response = await chai.request(URL).get("/services").send();
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    services = response.body;
    assert.deepEqual(services[0].apikey, SERVICES[0].apikey);

    ////////////////////////////PATHS/////////////////////////////
    ////////////////////////////PUT/////////////////////////////
    let apikey='apikey1';
    response = await chai.request(URL).put(`/paths/${apikey}`).send(PATHS);
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let paths = response.body;
    assert.deepEqual(paths[0].pathName, PATHS[0].pathName);

    // response = await chai.request(URL).put(`/paths`).send(PATHS);
    // assert.equal(response.status, 200);
    // assert.isTrue(response.ok);
    // paths = response.body;
    // assert.deepEqual(paths[0].pathName, PATHS[0].pathName);
    // //////////////////////////GET/////////////////////////////
    response = await chai.request(URL).get(`/paths`).send();
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    paths = response.body;
    assert.deepEqual(paths[0].pathName, PATHS[0].pathName);

    // // ////////////////////////////DEVICES/////////////////////////////
    response = await chai.request(URL).put("/devices").send(DEVICES);
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let devices = response.body;
    assert.deepEqual(devices[0].device_id, DEVICES[0].device_id);

    response = await chai.request(URL).get(`/devices`).send();
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    devices = response.body;
    let deviceOficina4 = devices.find(device => device.device_id === 'Oficina4');
    let deviceOficina3 = devices.find(device => device.device_id === 'Oficina3');
    assert.deepEqual(deviceOficina4.device_id, DEVICES[1].device_id);
    assert.deepEqual(deviceOficina3.device_id, DEVICES[0].device_id);
  });


  ////////////////////////////SERVICES/////////////////////////////

  // GET services FUNCIONA
  it(`GET SERVICES  ${URL}/services`, async function () {
    let response = await chai.request(URL).get("/services").send();
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let services = response.body;
    assert.deepEqual(services[0].apikey, SERVICES[0].apikey);
  });

  // GET service by apikey FUNCIONA
  it(`GET SERVICE BY APIKEY  ${URL}/services/:apikey`, async function () {
    let apikey = "apikey1";
    let response = await chai
      .request(URL)
      .get(`/services/${apikey}`)
      .send(apikey);
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let services = response.body;
    assert.deepEqual(services[0].apikey, SERVICES[0].apikey);
  });

  // // PUT services FUNCIONA
  it(`PUT SERVICES  ${URL}/services`, async function () {
    let SERVICES2 = [
      {
        apikey: "apikey5",
        fiwareService: "CaixaBank",
        servicePaths: [],
      },
    ];

    let response = await chai.request(URL).get(`/services`).send();
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let services = response.body;
    assert.deepEqual(services[0].apikey, SERVICES[0].apikey);

    response = await chai.request(URL).put(`/services`).send(SERVICES2);
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    services = response.body;
    assert.deepEqual(services[0][0].apikey, SERVICES2[0].apikey);
  });

  // // DELETE services FUNCIONA
  it(`DELETE SERVICES  ${URL}/services/:apikey`, async function () {
    let apikey = "apikey1";
    let response = await chai.request(URL).delete(`/services/${apikey}`).send();
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let service = response.body;
    assert.equal(service[0].apikey, apikey);

    response = await chai.request(URL).get(`/services`).send();
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let services = response.body;
    assert.notDeepEqual(services, SERVICES);
  });

  // // // POST services
  // // it(`POST SERVICES ${URL}/services`, async function () {
  // //   let newService = {
  // //     apikey: "apikey3",
  // //     fiwareService: "/Elche",
  // //     servicePaths: [],
  // //   };
  // //   let response = await chai.request(URL).post(`/services`).send(newService);
  // //   assert.equal(response.status, 200);
  // //   assert.isTrue(response.ok);
  // //   let service = response.body;
  // //   assert.deepEqual(service.apikey, newService.apikey);

  // //   response = await chai.request(URL).get(`/services`).send();
  // //   assert.equal(response.status, 200);
  // //   assert.isTrue(response.ok);
  // //   let services = response.body;
  // //   assert.deepEqual(services[1].apikey, newService.apikey);
  // // });

  // ////////////////////////////////////////////////////PATHS//////////////////////////

  // GET paths de un servicio by apikey FUNCIONA
  it(`GET PATHS OF A SERVICE  ${URL}/services/:apikey/paths`, async function () {
    let apikey = "apikey1";
    let response = await chai
      .request(URL)
      .get(`/services/${apikey}/paths`)
      .send(apikey);
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let paths = response.body;
    assert.deepEqual(paths[0].pathName, PATHS[0].pathName);
  });

  // PUT paths: AÑADIR PATHS A UN SERVICIO: necesitamos apikey y paths a enviar
  // FUNCIONA 
  it(`PUT PATHS to a service ${URL}/services/:apikey/paths`, async function () {
    let apikey = "apikey1";
    let PATHS2 = [
      {
        pathName: "/Novelda",
        devices: [],
      },
    ];

    let response = await chai.request(URL).get(`/services/${apikey}/paths`).send(apikey);
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let paths = response.body;
    assert.deepEqual(paths[0].pathName, PATHS[0].pathName);
 
    response = await chai.request(URL).put(`/services/${apikey}/paths`).send(PATHS2);
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    paths = response.body;
    assert.deepEqual(paths[1].pathName, PATHS2[0].pathName);
  });

  // DELETE paths FUNCIONA
  it(`DELETE PATHS of a service ${URL}/paths/:pathName/:apikey`, async function () {
    let pathName = '/Alicante';
    let apikey= 'apikey1';
    let response = await chai.request(URL).delete(`/paths${pathName}/${apikey}`).send();
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let service = response.body;
    assert.equal(service.servicePaths[0].pathName, pathName);

    response = await chai.request(URL).get(`/services/${apikey}/paths`).send();
    assert.equal(response.status, 200);
    assert.isTrue(response.ok);
    let paths = response.body;
    assert.notDeepEqual(paths, PATHS[0]);
  });

  // // // POST paths
  // // it(`POST ${URL}/paths/:service/:pathName`, async function () {
  // //   let service = "Liberbank";
  // //   let pathName = "/Sevilla";
  // //   let response = await chai.request(URL).post(`/paths/${service}/${pathName}`).send();
  // //   assert.equal(response.status, 200);
  // //   assert.isTrue(response.ok);
  // //   let path = response.body;
  // //   assert.equal(path.pathName, pathName);

  // //   response = await chai.request(URL).get(`/paths`).send();
  // //   assert.equal(response.status, 200);
  // //   assert.isTrue(response.ok);
  // //   let paths = response.body;
  // //   assert.isTrue(paths.some(p => p.pathName === pathName));
  // // });



  // // ////////////////////////////////////////////////////////DEVICES////////////////////////////////////////
  // GET devices FUNCIONA
  // it(`GET devices OF A path  ${URL}/services/:apikey/devices`, async function () {
  //   let apikey = "apikey1";
  //   let path= PATHS[0];
  //   let response = await chai
  //     .request(URL)
  //     .get(`/services/${apikey}/devices`)
  //     .send(path);
  //   assert.equal(response.status, 200);
  //   assert.isTrue(response.ok);
  //   let devices = response.body;
  //   let devices2 = PATHS[0].devices;
  //   assert.deepEqual(devices[1].device_id, devices2[0].device_id);
  // });

  // // // PUT devices FUNCIONA 
  // it(`PUT DEVICES IN A PATH ${URL}/services/:apikey/:pathName/devices`, async function () {
  //   let DEVICES2 = [{ device_id: "Oficina5", attrs:"" }];
  //   let path= PATHS[0];
  //   let SERVICES2 = [
  //     {
  //       apikey: "apikey5",
  //       fiwareService: "CaixaBank",
  //       servicePaths: [path],
  //     },
  //   ];
  //   let apikey = SERVICES2[0].apikey;

  //   await chai.request(URL).put(`/services`).send(SERVICES2);

  //   let response = await chai.request(URL).get(`/services/${apikey}/devices`).send(path);
  //   assert.equal(response.status, 200);
  //   assert.isTrue(response.ok);
  //   let devices = response.body;
  //   let devices2 = PATHS[0].devices;
  //   console.log(devices)
  //   assert.deepEqual(devices[0].device_id, devices2[0].device_id);

  //   let pathName= PATHS[0].pathName;
  //   response = await chai.request(URL).put(`/services/${apikey}${pathName}/devices`).send(DEVICES2);
  //   assert.equal(response.status, 200);
  //   assert.isTrue(response.ok);
  //   devices = response.body;
  //   assert.deepEqual(devices[0].device_id, DEVICES2[0].device_id);
  // });

  // // // // // DELETE devices: FUNCIONA 
  // it(`DELETE devices de un path ${URL}/services/:apikey/:pathName/devices`, async function () {
  //   let device1 = DEVICES[0];
  //   let apikey = "apikey1";
  //   let pathName= PATHS[0].pathName;
  //   let response = await chai.request(URL).delete(`/services/${apikey}${pathName}/devices`).send(device1);
  //   assert.equal(response.status, 200);
  //   assert.isTrue(response.ok);
  //   let device_id= response.body;
  //   assert.equal(device_id, device1.device_id);

  //   response = await chai.request(URL).get(`/services/${apikey}/devices`).send(PATHS[0]);
  //   assert.equal(response.status, 200);
  //   assert.isTrue(response.ok);
  //   let devices = response.body;
  //   console.log("los devices",devices);
  //   assert.notDeepEqual(devices[0].device_id, DEVICES[0].device_id);
  // });

  // // // POST devices
  // // it(`POST ${URL}/devices`, async function () {
  // //   let newDevice = { _id: 3, device_id: "Oficina5" };
  // //   let response = await chai.request(URL).post(`/devices`).send(newDevice);
  // //   assert.equal(response.status, 200);
  // //   assert.isTrue(response.ok);
  // //   let device = response.body;
  // //   assert.equal(device.device_id, newDevice.device_id);

  // //   response = await chai.request(URL).get(`/devices`).send();
  // //   assert.equal(response.status, 200);
  // //   assert.isTrue(response.ok);
  // //   let devices = response.body;
  // //   assert.isTrue(devices.some(d => d.device_id === newDevice.device_id));
  // // });
});
