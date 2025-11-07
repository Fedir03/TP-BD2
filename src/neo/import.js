import neo4j from "neo4j-driver";

import { driver, getSession } from "./connect.js";

const session = getSession("WRITE");

async function run() {
  try {
    await session.run(`
      LOAD CSV WITH HEADERS FROM 'file:///clientes.csv' AS row
      CREATE (:Cliente {id: row.id, nombre: row.nombre});
    `);

    await session.run(`
      LOAD CSV WITH HEADERS FROM 'file:///agentes.csv' AS row
      CREATE (:Agente {id: row.id, nombre: row.nombre});
    `);

    await session.run(`
      LOAD CSV WITH HEADERS FROM 'file:///polizas.csv' AS row
      MATCH (c:Cliente {id: row.cliente})
      MATCH (a:Agente {id: row.agente})
      CREATE (p:Poliza {id: row.id, tipo: row.tipo, estado: row.estado})
      CREATE (c)-[:TIENE]->(p)
      CREATE (a)-[:EMITE]->(p);
    `);

    console.log("Datos cargados en Neo4j");
  } finally {
    await session.close();
    await driver.close();
  }
}

run();