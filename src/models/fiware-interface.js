const { model } = require("mongoose");

const Device = require("./Models").Device;
const ServicePath = require("./Models").ServicePath;
const Service = require("./Models").Service;

// import { Device, Path, Service } from './Models.js';
class FiwareInterface {
  constructor() {}

  ///////////////////////////////////////////SERVICES//////////////////////////////////////////////////////

  async getServices() {
    return (await Service.find()).map((d) => d.toObject());
  }

  // async setServices(services) {
  //   return (
  //     await Promise.all(
  //       services.map((s) => {
  //         return new Service(s).save();
  //       })
  //     )
  //   ).map((d) => d.toObject());
  // }

  // Agregar un servicio nuevo, necesitamos apikey y los dos parámetros obligatorios
  async agregarService(apikey, fiwareService, paths) {
    try {
      // Verificar si ya existe un servicio con la misma apikey
      let existingService = await Service.findOne({ apikey });
      if (existingService) {
        throw new Error("Ya existe un servicio con esta apikey");
      }
      let servicePaths = [];
      if (paths) {
        for (const p of paths) {
          // Si no existe, crear un nuevo ServicePath
          const newServicePath = await new ServicePath({
            pathName: p.pathName,
            devices: p.devices,
          }).save();
          servicePaths.push(newServicePath);
        }
      }
      return (
        await new Service({
          apikey,
          fiwareService,
          servicePaths: servicePaths,
        }).save()
      ).toObject();
    } catch (error) {
      throw error;
    }
  }

  //eliminar servicios
  async deleteServices() {
    return await Service.deleteMany();
  }

  async eliminarServiceByApikey(apikey) {
    let service = await this.serviceByApiKey(apikey);
    //obtenemos los paths del service
    let paths = service[0].servicePaths;
    //eliminar los path de SERVICEPATH
    for (const path of paths) {
      await ServicePath.findByIdAndDelete(path._id);
    }
    //eliminamos el service
    await Service.findByIdAndDelete(service[0]._id);
  }

  ///obtener service by apikey
  async serviceByApiKey(apikey) {
    let services = await this.getServices();
    let objeto = await Promise.all(
      services.filter((s) => {
        return Service(s).apikey == apikey;
      })
    );
    return objeto;
  }

  ///obtener servicePaths de un Service
  async servicePathsByApiKey(apikey) {
    let service = await this.serviceByApiKey(apikey);
    return service[0].servicePaths;
  }

  ///////////////////////////////////////////PATHS//////////////////////////////////////////////////////

  async deletePaths() {
    return await ServicePath.deleteMany();
  }
  async getPaths() {
    return (await ServicePath.find()).map((d) => d.toObject());
  }
  async setPaths(paths) {
    return (
      await Promise.all(
        paths.map((a) => {
          return new ServicePath(a).save();
        })
      )
    ).map((d) => d.toObject());
  }

  async agregarServicePathToAService(paths, apikey) {
    //paso 1: crear el path como nueva instancia de SERVICEPATH
    let path = await this.agregarServicePath(
      paths[0].pathName,
      paths[0].devices
    );
    //paso 2: obtener el servicio donde queremos añadir el path
    let service = await this.serviceByApiKey(apikey);
    //paso 3: añadir el path a sus servicepaths
    try {
      const updatedResult = await Service.findByIdAndUpdate(service[0]._id, {
        $push: { servicePaths: path },
      });
      updatedResult.save();
      // console.log(updatedResult);
    } catch (error) {
      console.log(error);
    }
    service = await this.serviceByApiKey(apikey);
    return service[0].servicePaths;
  }

  async agregarServicePath(pathName, devices,apikey) {
    let devicesN = [];
    if (devices) {
      devicesN = await Promise.all(
        devices.map(async (p) => {
          const device = new Device({ device_id: p.device_id, attrs: p.attrs });
          await device.save();
          return device;
        })
      );
    }
      let servicepath= await new ServicePath({ pathName: pathName, devices: devicesN }).save();
      //lo añadimos al service 
      let service= await this.serviceByApiKey(apikey);
      try {
        await Service.findByIdAndUpdate(service[0]._id, {
          $push: { ServicePath: servicepath },
        });
        // console.log(updatedResult);
      } catch (error) {
        console.log(error);
      }
      return servicepath;
  }

  //eliminar un path de un servicio
  async eliminarPathByNamendApikey(pathName, apikey) {
    // paso 1: Obtener el servicio(como objeto) al que pertenece el path
    let service = await this.serviceByApiKey(apikey);
    //paso 2 obtener los paths
    let servicePaths = service[0].servicePaths;
    // Eliminar el path de la colección de paths
    await ServicePath.findByIdAndDelete(servicePaths[0]._id);
    //eliminar el path de esos paths
    const indexToDelete = servicePaths.findIndex(
      (path) => path.pathName === pathName
    );
    // splice() para eliminar el elemento del array servicePaths
    servicePaths.splice(indexToDelete, 1);
    //actuallizar el servicio tras borarr el path
    try {
      const updatedResult = await Service.findByIdAndUpdate(service[0]._id, {
        $set: { servicePaths: servicePaths },
      });
      return updatedResult;
    } catch (error) {
      console.log(error);
    }
  }

  /////////////////////////////////////DEVICES//////////////////
  async deleteDevices() {
    return await Device.deleteMany();
  }
  async getDevices() {
    return (await Device.find()).map((d) => d.toObject());
  }

  //setters
  async setDevices(devices) {
    return (
      await Promise.all(
        devices.map(async (u) => {
          return new Device(u).save();
        })
      )
    ).map((d) => d.toObject());
  }

  async agregarDevice(device_id, attrs) {
    return (
      await new Device({ device_id: device_id, attrs: attrs }).save()
    ).toObject();
  }

  async agregarDeviceToAServicePath(apikey, pathName, devices) {
    //paso 1: crear el device como nueva instancia de DEVICE
    let device = await new Device({
      device_id: devices[0].device_id,
      attrs: devices[0].attrs,
    }).save();
    //obtenemos el path al que quiere añadir el device
    let paths = await this.servicePathsByApiKey(apikey);
    let path = await Promise.all(
      paths.filter((s) => {
        return s.pathName == pathName;
      })
    );
    //paso 3: añadir el device al path
    try {
        await ServicePath.findByIdAndUpdate(path[0]._id, {
        $push: { devices: device },
      });
      // console.log(updatedResult);
    } catch (error) {
      console.log(error);
    }
    //paso 4; actuali<zar el path
    try {
        ServicePath.findByIdAndUpdate(path[0]._id, {
        $push: { devices: devices }
      });
    } catch (error) {
      console.log(error);
    }
    //paso 5: actualizar el servicio
    let service= await this.serviceByApiKey(apikey);
    let servicepath= await ServicePath.findById(path[0]._id)
    try {
      Service.findByIdAndUpdate(service[0]._id, {
      $push: { servicePaths: servicepath }
    });
  } catch (error) {
    console.log(error);
  }
  }

  //eliminar un device(y quitarlo de su correspondiente path)
  async eliminarDevice(device_id, pathName, apikey) {
    // paso 1: obtener el servicio y los paths de ese servicio
    let service = await this.serviceByApiKey(apikey);
    let paths = await this.servicePathsByApiKey(apikey);
    //paso2: obteenr el path
    let path = paths.find((p) => p.pathName === pathName);
    //paso 3: eliminar los dispositivos de ese path
    let devices = path.devices;
    let index = devices.findIndex((d) => d.device_id === device_id);
    if (index !== -1) {
      //splice para eliminar el elemento
      devices.splice(index, 1);
    }
    //Actualizar el path
    try {
      await ServicePath.findByIdAndUpdate(path._id, {
        $set: { devices: devices },
      });
      // console.log(updatedResult);
    } catch (error) {
      console.log(error);
    }
    
    //actualizar el service
    let path1 = await ServicePath.findById(path._id)
    // console.log("los paths despues d borrar, no debe aparecer oficina3",await this.getPaths())
    try {
      const updatedResult2 = await Service.findByIdAndUpdate(service._id, {
        $set: { servicePaths: path1 },
      });
      // console.log(updatedResult);
    } catch (error) {
      console.log(error);
    }
    // console.log("los services despues d borrar, solo debe tener un device",await this.getDevices())
    //paso 4: eliminar la instancia del device
    await Device.deleteOne({ device_id: device_id });
    // console.log("los devices despues d borrar, no debe aparecer oficina3",await this.getDevices())
    return device_id;
  }

  //FUNCIONES AUXILIARES

  //   //obtener attrs de conf de un device
  //   async attrsDeviceById(device_id) {
  //     const device = Device.findOne({ device_id: device_id });
  //     return await device.attrs;
  //   }

  //   async agregarAttrsDevice(device_id, attrs) {
  //     const device = await Device.findOne({ device_id: device_id });
  //     if (!device) {
  //       throw new Error("Device not found");
  //     }
  //     device.attrs = { attrs };
  //     await device.save();
  //   }
}
module.exports = FiwareInterface;
