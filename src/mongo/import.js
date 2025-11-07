import { client, db } from "./connect.js";
import fs from "fs";
import csv from "csv-parser";

async function importarColeccion(nombre, archivo) {
  const datos = [];
  return new Promise((resolve) => {
    fs.createReadStream(archivo)
      .pipe(csv())
      .on("data", (row) => datos.push(row))
      .on("end", async () => {
        await db.collection(nombre).deleteMany({});
        await db.collection(nombre).insertMany(datos);
        console.log(`${nombre}: ${datos.length} registros cargados.`);
        resolve();
      });
  });
}

(async () => {
  try {
    await client.connect();
    await importarColeccion("clientes", "./data/clientes.csv");
    await importarColeccion("polizas", "./data/polizas.csv");
    await importarColeccion("siniestros", "./data/siniestros.csv");
    await importarColeccion("vehiculos", "./data/vehiculos.csv");
    await importarColeccion("agentes", "./data/agentes.csv");
  } finally {
    await client.close();
  }
})();
