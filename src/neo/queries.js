import { getSession } from "./connect.js";
import { MISSING_ARGUMENTS, ALREADY_EXISTS, NOT_FOUND } from "../shared/shared.js";

// 2. Siniestros abiertos con tipo, monto y cliente afectado
export async function siniestrosAbiertos() {
  const s = getSession("READ");
  try {
    const q = `
      MATCH (c:Cliente)-[:TIENE]->(p:Poliza)<-[:CUBIERTO_POR]-(s:Siniestro)
      WHERE s.estado = "Abierto"
      RETURN s.tipo AS tipo, s.monto AS monto, c.nombre AS nombre, c.apellido AS apellido
    `;
    const res = await s.run(q);
    return res.records.map(r => ({
      tipo: r.get("tipo"),
      monto: r.get("monto"),
      nombre: r.get("nombre"),
      apellido: r.get("apellido"),
    }));
  } finally { await s.close(); }
}

// 3. Vehículos asegurados with su cliente y póliza
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

// 12. Agentes y cantidad de siniestros asociados
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

// 13. ABM de clientes - Crear nuevo cliente
export async function crearCliente(nuevoCliente) {
  const s = getSession("WRITE");
  try {
    const qCheck = `
      MATCH (c:Cliente {id: $id_cliente})
      RETURN c
    `;
    const resCheck = await s.run(qCheck, { id_cliente: nuevoCliente.id_cliente });
    if (resCheck.records.length > 0) {
      return ALREADY_EXISTS;
    }

    const qCreate = `
      CREATE (c:Cliente {
        id: $id_cliente,
        nombre: $nombre,
        apellido: $apellido,
        dni: $dni,
        email: $email,
        telefono: $telefono,
        direccion: $direccion,
        ciudad: $ciudad,
        provincia: $provincia,
        activo: $activo
      })
      RETURN c
    `;
    const resCreate = await s.run(qCreate, {
      id_cliente: nuevoCliente.id_cliente,
      nombre: nuevoCliente.nombre,
      apellido: nuevoCliente.apellido,
      dni: nuevoCliente.dni,
      email: nuevoCliente.email,
      telefono: nuevoCliente.telefono,
      direccion: nuevoCliente.direccion,
      ciudad: nuevoCliente.ciudad,
      provincia: nuevoCliente.provincia,
      activo: nuevoCliente.activo
    });
    return resCreate.records[0].get("c").properties.id;
  } finally { await s.close(); }
}

// 13. ABM de clientes - Actualizar cliente existente
export async function actualizarCliente(id_cliente, datosActualizados) {
  const s = getSession("WRITE");
  try {
    const qUpdate = `
      MATCH (c:Cliente {id: $id_cliente})
      SET c += $datosActualizados
      RETURN c
    `;
    const resUpdate = await s.run(qUpdate, { id_cliente, datosActualizados });
    if (resUpdate.records.length === 0) {
      return NOT_FOUND;
    }
    return resUpdate.records[0].get("c").properties.id;
  } finally { await s.close(); }
}

// 13. ABM de clientes - Eliminar cliente
export async function eliminarCliente(id_cliente) {
  const s = getSession("WRITE");
  try {
    const qDelete = `
      MATCH (c:Cliente {id: $id_cliente})
      OPTIONAL MATCH (c)-[:TIENE]->(p:Poliza)
      OPTIONAL MATCH (p)<-[:CUBIERTO_POR]-(s:Siniestro)
      WITH c, collect(DISTINCT p) AS polizas, collect(DISTINCT s) AS siniestros
      WITH c, polizas, siniestros, size(polizas) AS polizasCount, size(siniestros) AS siniestrosCount
      FOREACH (sin IN siniestros | DETACH DELETE sin)
      FOREACH (pol IN polizas | DETACH DELETE pol)
      DETACH DELETE c
      RETURN 1 AS deletedCliente, polizasCount AS deletedPolizas, siniestrosCount AS deletedSiniestros
    `;
    const resDelete = await s.run(qDelete, { id_cliente });
    if (resDelete.records.length === 0) {
      return NOT_FOUND;
    }
    const record = resDelete.records[0];
    const deletedCliente = record.get("deletedCliente");
    return {
      deletedCliente: typeof deletedCliente.toNumber === "function" ? deletedCliente.toNumber() : deletedCliente,
      deletedPolizas: record.get("deletedPolizas").toNumber(),
      deletedSiniestros: record.get("deletedSiniestros").toNumber()
    };
  } finally { await s.close(); }
}

// 14. Alta de nuevos siniestros
export async function crearSiniestro(nuevoSiniestro) {
  const s = getSession("WRITE");
  try {
    // Check if siniestro already exists
    const qCheck = `
      MATCH (s:Siniestro {id: $id_siniestro})
      RETURN s
    `;
    const resCheck = await s.run(qCheck, { id_siniestro: nuevoSiniestro.id_siniestro });
    if (resCheck.records.length > 0) {
      return ALREADY_EXISTS;
    }

    // Check if the associated poliza exists
    const qPoliza = `
      MATCH (p:Poliza {id: $nro_poliza})
      RETURN p
    `;
    const resPoliza = await s.run(qPoliza, { nro_poliza: nuevoSiniestro.nro_poliza });
    if (resPoliza.records.length === 0) {
      return NOT_FOUND;
    }

    // Create the new siniestro
    const qCreate = `
      MATCH (p:Poliza {id: $nro_poliza})
      CREATE (s:Siniestro {
        id: $id_siniestro,
        fecha: $fecha,
        tipo: $tipo,
        monto: $monto_estimado,
        descripcion: $descripcion,
        estado: $estado
      })
      CREATE (s)-[:CUBIERTO_POR]->(p)
      RETURN s
    `;
    const resCreate = await s.run(qCreate, {
      id_siniestro: nuevoSiniestro.id_siniestro,
      nro_poliza: nuevoSiniestro.nro_poliza,
      fecha: nuevoSiniestro.fecha,
      tipo: nuevoSiniestro.tipo,
      monto_estimado: nuevoSiniestro.monto_estimado,
      descripcion: nuevoSiniestro.descripcion,
      estado: nuevoSiniestro.estado
    });
    return resCreate.records[0].get("s").properties.id;
  } finally { await s.close(); }
}

// 15. Emision de nuevas polizas (chequeando cliente y agente)
export async function crearPoliza(nuevaPoliza) {
  const s = getSession("WRITE");
  try {
    // Check if poliza already exists
    const qCheck = `
      MATCH (p:Poliza {id: $nro_poliza})
      RETURN p
    `;
    const resCheck = await s.run(qCheck, { nro_poliza: nuevaPoliza.nro_poliza });
    if (resCheck.records.length > 0) {
      return ALREADY_EXISTS;
    }

    // Check if the associated cliente exists
    const qCliente = `
      MATCH (c:Cliente {id: $id_cliente})
      RETURN c
    `;
    const resCliente = await s.run(qCliente, { id_cliente: nuevaPoliza.id_cliente });
    if (resCliente.records.length === 0) {
      return NOT_FOUND;
    }

    // Check if the associated agente exists
    const qAgente = `
      MATCH (a:Agente {id: $id_agente})
      RETURN a
    `;
    const resAgente = await s.run(qAgente, { id_agente: nuevaPoliza.id_agente });
    if (resAgente.records.length === 0) {
      return NOT_FOUND;
    }

    // Create the new poliza
    const qCreate = `
      MATCH (c:Cliente {id: $id_cliente})
      MATCH (a:Agente {id: $id_agente})
      CREATE (p:Poliza {
        id: $nro_poliza,
        tipo: $tipo,
        fecha_inicio: $fecha_inicio,
        fecha_fin: $fecha_fin,
        prima_mensual: $prima_mensual,
        cobertura_total: $cobertura_total,
        estado: $estado
      })
      CREATE (c)-[:TIENE]->(p)
      CREATE (a)-[:EMITE]->(p)
      RETURN p
    `;
    const resCreate = await s.run(qCreate, {
      nro_poliza: nuevaPoliza.nro_poliza,
      id_cliente: nuevaPoliza.id_cliente,
      id_agente: nuevaPoliza.id_agente,
      tipo: nuevaPoliza.tipo,
      fecha_inicio: nuevaPoliza.fecha_inicio,
      fecha_fin: nuevaPoliza.fecha_fin,
      prima_mensual: nuevaPoliza.prima_mensual,
      cobertura_total: nuevaPoliza.cobertura_total,
      estado: nuevaPoliza.estado
    });
    const created = resCreate.records[0].get("p").properties;
    return created.nro_poliza ?? created.id;
  } finally { await s.close(); }
}

// funciones auxiliares para shared.js
export async function neoFindCliente(id_cliente) {
    const s = getSession("READ");
    try {
        const q = `
            MATCH (c:Cliente {id: $id_cliente})
            RETURN c
        `;
        const res = await s.run(q, { id_cliente });
        if (res.records.length === 0) {
            return null;
        }
        return res.records[0].get("c").properties;
    } finally { await s.close(); }
} 

export async function neoFindAgente(id_agente) {
    const s = getSession("READ");
    try {
        const q = `
            MATCH (a:Agente {id: $id_agente})
            RETURN a
        `;
        const res = await s.run(q, { id_agente });
        if (res.records.length === 0) {
            return null;
        }
        return res.records[0].get("a").properties;
    } finally { await s.close(); }
}
