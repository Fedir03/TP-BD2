import { getSession } from "./connect.js";

// 2. Siniestros abiertos con tipo, monto y cliente afectado
export async function siniestrosAbiertos() {
  const s = getSession("READ");
  try {
    const q = `
      MATCH (c:Cliente)-[:TIENE]->(p:Poliza)<-[:CUBIERTO_POR]-(s:Siniestro)
      RETURN s.tipo AS tipo, s.monto AS monto, c.nombre AS nombre, c.apellido AS apellido
    `;
    const res = await s.run(q);
    return res.records.map(r => ({
      tipo: r.get("tipo"),
      monto: r.get("monto"),
      nombre_cliente: r.get("nombre"),
      apellido_cliente: r.get("apellido"),
    }));
  } finally { await s.close(); }
}

// 3. Vehículos asegurados con su cliente y póliza
export async function vehiculosAsegurados() {
  const s = getSession("READ");
  try {
    const q = `
      MATCH (v:Vehiculo)<-[:POSEE]-(c:Cliente)-[:TIENE]->(p:Poliza)
      RETURN c.nombre AS nombre, c.apellido AS apellido, v.patente AS patente, p.id AS nro_poliza
    `;
    const res = await s.run(q);
    return res.records.map(r => ({
      nombre: r.get("nombre"),
      apellido: r.get("apellido"),
      patente: r.get("patente"),
      nro_poliza: r.get("nro_poliza"),
    }));
  } finally { await s.close(); }
}

// 5. Agentes activos con cantidad de pólizas asignadas
export async function agentesConPolizas() {
  const s = getSession("READ");
  try {
    const q = `
      MATCH (a:Agente {activo:"True"})-[:EMITE]->(p:Poliza)
      RETURN a.nombre AS nombre, a.apellido AS apellido, COUNT(p) AS polizas
      ORDER BY polizas DESC
    `;
    const res = await s.run(q);
    return res.records.map(r => ({
      nombre: r.get("nombre"),
      apellido: r.get("apellido"),
      polizas: r.get("polizas").toNumber()
    }));
  } finally { await s.close(); }
}

// 12 Agentes y cantidad de siniestros asociados
export async function agentesConSiniestros() {
  const s = getSession("READ");
  try {
    const q = `
      MATCH (a:Agente)-[:EMITE]->(p:Poliza)<-[:CUBIERTO_POR]-(s:Siniestro)
      RETURN a.nombre AS nombre, a.apellido AS apellido, COUNT(s) AS siniestros
    `;
    const res = await s.run(q);
    return res.records.map(r => ({
      nombre: r.get("nombre"),
      apellido: r.get("apellido"),
      siniestros: r.get("siniestros").toNumber()
    }));
  } finally { await s.close(); }
}


// 11. Clientes con más de un vehículo asegurado
export async function clientesMultivehiculo() {
  const s = getSession("READ");
  try {
    const q = `
      MATCH (c:Cliente)-[:POSEE]->(v:Vehiculo)
      WITH c, COUNT(v) AS cant_vehiculos
      WHERE toInteger(cant_vehiculos) > 1
      RETURN c.nombre AS nombre, c.apellido AS apellido, cant_vehiculos
    `;
    const res = await s.run(q);
    return res.records.map(r => ({
      nombre: r.get("nombre"),
      apellido: r.get("apellido"),
      vehiculos: r.get("cant_vehiculos").toNumber()
    }));
  } finally { await s.close(); }
}