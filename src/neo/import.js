import neo4j from "neo4j-driver";

import { driver, getSession } from "./connect.js";

const session = getSession("WRITE");

async function run() {
  try {
    await session.run(`MATCH (p:Poliza) DETACH DELETE p`);
    await session.run(`MATCH (c:Cliente) DETACH DELETE c`);
    await session.run(`MATCH (a:Agente) DETACH DELETE a`);
    await session.run(`MATCH (s:Siniestro) DETACH DELETE s`);
    await session.run(`MATCH (v:Vehiculo) DETACH DELETE v`);

    await session.run(`
      LOAD CSV WITH HEADERS FROM 'file:///clientes.csv' AS row
      CREATE (:Cliente {id: row.id_cliente, nombre: row.nombre, apellido: row.apellido});
    `);

    await session.run(`
      LOAD CSV WITH HEADERS FROM 'file:///agentes.csv' AS row
      CREATE (:Agente {id: row.id_agente, nombre: row.nombre, apellido:row.apellido, activo: row.activo});
    `);

    await session.run(`
      LOAD CSV WITH HEADERS FROM 'file:///polizas.csv' AS row
      MATCH (c:Cliente {id: row.id_cliente})
      MATCH (a:Agente {id: row.id_agente})
      CREATE (p:Poliza {id: row.nro_poliza, tipo: row.tipo, estado: row.estado})
      CREATE (c)-[:TIENE]->(p)
      CREATE (a)-[:EMITE]->(p);
    `);

    await session.run(`
      LOAD CSV WITH HEADERS FROM 'file:///siniestros.csv' AS row
      MATCH (p:Poliza {id: row.nro_poliza})
      CREATE (s:Siniestro {id: row.id_siniestro, nro_poliza: row.nro_poliza, estado: row.estado, tipo: row.tipo, monto: row.monto_estimado})
      CREATE (s)-[:CUBIERTO_POR]->(p);
    `);

    await session.run(`
      LOAD CSV WITH HEADERS FROM 'file:///vehiculos.csv' AS row
      MATCH (c:Cliente {id: row.id_cliente})
      CREATE (v:Vehiculo {id: row.id_vehiculo, patente: row.patente, asegurado: row.asegurado})
      CREATE (c)-[:POSEE]->(v);
    `);
    
    console.log("Datos cargados en Neo4j");
  } finally {
    await session.close();
    await driver.close();
  }
}

run();