import { db } from "./connect.js";
import { MISSING_ARGUMENTS, ALREADY_EXISTS, NOT_FOUND } from "../shared/shared.js";

// 1. Clientes activos con pólizas vigentes
export async function clientesActivos() {
  return db.collection("clientes").aggregate([
    { $match: { activo: "True" } },
    {
      $lookup: {
        from: "polizas",
        localField: "id_cliente",
        foreignField: "id_cliente",
        as: "polizas"
      }
    },
    {
      $addFields: {
        polizas_vigentes: {
          $filter: {
            input: "$polizas",
            as: "p",
            cond: { $eq: ["$$p.estado", "Activa"] }
          }
        }
      }
    },
    { $match: { "polizas_vigentes.0": { $exists: true } } },
    { $project: { _id: 0, nombre: 1, apellido:1, polizas_vigentes: { nro_poliza: 1 } } }
  ]).toArray();
}

// 4. Clientes sin pólizas activas
export async function clientesSinPolizas() {
  return db.collection("clientes").aggregate([
    {
      $lookup: {
        from: "polizas",
        localField: "id_cliente",
        foreignField: "id_cliente",
        as: "polizas"
      }
    },
    {
      $addFields: {
        tiene_vigente: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: "$polizas",
                  as: "p",
                  cond: { $eq: ["$$p.estado", "Activa"] }
                }
              }
            },
            0
          ]
        }
      }
    },
    { $match: { tiene_vigente: false } },
    { $project: { _id: 0, nombre: "$nombre", apellido: "$apellido"} }
  ]).toArray();
}

// 6. Pólizas vencidas con cliente
export async function polizasVencidas() {
  return db.collection("polizas").aggregate([
    { $match: { estado: "Vencida" } },
    {
      $lookup: {
        from: "clientes",
        localField: "id_cliente",
        foreignField: "id_cliente",
        as: "cliente"
      }
    },
    { $unwind: "$cliente" },
    {
      $project: {
        _id: 0,
        nro_poliza: 1,
        nombre: "$cliente.nombre",
        apellido: "$cliente.apellido"
      }
    }
  ]).toArray();
}

// 7. Top 10 clientes por monto total de cobertura
export async function topClientesCobertura() {
  return db.collection("polizas").aggregate([
    {
      $group: {
        _id: "$id_cliente",
        total_cobertura: { $sum: { $toInt: "$cobertura_total" } }
      }
    },
    { $sort: { total_cobertura: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "clientes",
        localField: "_id",
        foreignField: "id_cliente",
        as: "cliente"
      }
    },
    { $unwind: "$cliente" },
    {
      $project: {
        _id: 0,
        nombre: "$cliente.nombre",
        apellido: "$cliente.apellido",
        total_cobertura: 1
      }
    }
  ]).toArray();
}

// 8. Siniestros tipo "Accidente" del ultimo anio
export async function siniestrosTipoAccidente() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return db.collection("siniestros").find(
    { 
      tipo: "Accidente", 
      $expr: {
        $gt: [
          {
            $dateFromString: {
              dateString: "$fecha",
              format: "%d/%m/%Y",
              timezone: "UTC",
            }
          },
          oneYearAgo
        ]
      } 
    }, 
    { projection: { _id: 0, id_siniestro: 1 } }
  ).toArray();
}

// 9. Vista de polizas activas ordenadas por fecha de inicio
export async function verPolizasActivas() {
  const polizas = await db.collection("vista_polizas_activas").find().toArray();
  return polizas;
}


// 10. Polizas suspendidas con estado del cliente
export async function polizasSuspendidas() {
  return db.collection("polizas").aggregate([
    { $match: { estado: "Suspendida" } },
    {
      $lookup: {
        from: "clientes",
        let: { polizaId: "$id_cliente" },
        pipeline: [
          { $match: { $expr: { $eq: ["$id_cliente", "$$polizaId"] } } },
          {
            $project: {
              _id: 0,
              estado: {
                $switch: {
                  branches: [
                    { case: { $eq: [ { $toLower: "$activo" }, "true" ] }, then: "Activo" },
                    { case: { $eq: [ { $toLower: "$activo" }, "false" ] }, then: "Inactivo" }
                  ],
                  default: null
                }
              }
            }
          }
        ],
        as: "cliente"
      }
    },
    { $unwind: { path: "$cliente" } },
    { $project: { _id: 0, nro_poliza: 1, "estado_cliente": "$cliente.estado" } }
  ]).toArray();
}

// 13. ABM de clientes - Crear nuevo cliente
export async function crearCliente(nuevoCliente) {
  const exists = await db.collection("clientes").findOne({ id_cliente: nuevoCliente.id_cliente });
  if (exists) return ALREADY_EXISTS;
  const result = await db.collection("clientes").insertOne(nuevoCliente);
  return result.insertedId;
}

// 13. ABM de clientes - Actualizar cliente existente
export async function actualizarCliente(id_cliente, datosActualizados) {
  const result = await db.collection("clientes").updateOne(
    { id_cliente: id_cliente },
    { $set: datosActualizados }
  );
  if (result.matchedCount === 0) {
    return NOT_FOUND;
  }
  return result.modifiedCount;
}

// 13. ABM de clientes - Eliminar cliente
export async function eliminarCliente(id_cliente) {
  const cliente = await db.collection("clientes").findOne({ id_cliente });
  if (!cliente) {
    return NOT_FOUND;
  }

  const polizasCliente = await db
    .collection("polizas")
    .find({ id_cliente }, { projection: { nro_poliza: 1 } })
    .toArray();
  const polizaIds = polizasCliente.map(p => p.nro_poliza);

  let deletedSiniestros = 0;
  if (polizaIds.length > 0) {
    const siniestrosResult = await db
      .collection("siniestros")
      .deleteMany({ nro_poliza: { $in: polizaIds } });
    deletedSiniestros = siniestrosResult.deletedCount;
  }

  const polizasResult = await db.collection("polizas").deleteMany({ id_cliente });
  const clienteResult = await db.collection("clientes").deleteOne({ id_cliente });

  return {
    deletedCliente: clienteResult.deletedCount,
    deletedPolizas: polizasResult.deletedCount,
    deletedSiniestros
  };
}

// 14. Alta de nuevos siniestros
export async function crearSiniestro(nuevoSiniestro) {
  const poliza = await db.collection("polizas").findOne({ nro_poliza: nuevoSiniestro.nro_poliza });
  if (!poliza) return NOT_FOUND;
  const exists = await db.collection("siniestros").findOne({ id_siniestro: nuevoSiniestro.id_siniestro });
  if (exists) return ALREADY_EXISTS;
  const result = await db.collection("siniestros").insertOne(nuevoSiniestro);
  return result.insertedId;
}

// 15. ABM de pólizas - Crear nueva póliza
export async function crearPoliza(nuevaPoliza) {
  const cliente = await db.collection("clientes").findOne({ id_cliente: nuevaPoliza.id_cliente });
  if (!cliente) return NOT_FOUND;
  const agente = await db.collection("agentes").findOne({ id_agente: nuevaPoliza.id_agente });
  if (!agente) return NOT_FOUND;
  const exists = await db.collection("polizas").findOne({ nro_poliza: nuevaPoliza.nro_poliza });
  if (exists) return ALREADY_EXISTS;
  const result = await db.collection("polizas").insertOne(nuevaPoliza);
  return result.insertedId;
}

// funciones auxiliares para shared.js
export async function mongoFindCliente(id_cliente) {
    const cliente = await db.collection("clientes").findOne({ id_cliente: id_cliente });
    return cliente;
}

export async function mongoFindAgente(id_agente) {
    const agente = await db.collection("agentes").findOne({ id_agente: id_agente });
    return agente;
}

export async function mongoEliminarSiniestro(id_siniestro) {
    const result = await db.collection("siniestros").deleteOne({ id_siniestro: id_siniestro });
    return result.deletedCount;
}

export async function mongoEliminarPoliza(nro_poliza) {
    const result = await db.collection("polizas").deleteOne({ nro_poliza: nro_poliza });
    return result.deletedCount;
}

// funcion auxiliar para la vista de la query 9
export async function crearVistaPolizasActivas() {
  const viewName = "vista_polizas_activas";
  const sourceCollection = "polizas";

  try {
    const existing = await db.listCollections({ name: viewName }).toArray();
    if (existing.length > 0) {
      await db.collection(viewName).drop();
      console.log(`Vista existente '${viewName}' eliminada.`);
    }

    await db.createCollection(viewName, {
      viewOn: sourceCollection,
      pipeline: [
        { $match: { estado: "Activa" } },
        { $sort: { fecha_inicio: 1 } }
      ]
    });

    console.log(`Vista '${viewName}' creada exitosamente.`);
  } catch (error) {
    console.error("Error al crear la vista de pólizas activas:", error);
  }
}
