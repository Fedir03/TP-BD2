import { db } from "./connect.js";

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
    { $project: { _id: 0, nombre: 1, polizas_vigentes: { nro_poliza: 1 } } }
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
    { $project: { _id: 0, nombre: 1 } }
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
    { $project: { _id: 0, nro_poliza: 1, "cliente.nombre": 1, "cliente.apellido": 1} }
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
        cliente: "$cliente.nombre",
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

// 9. Polizas suspendidas con estado del cliente
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
    { $project: { _id: 0, nro_poliza: 1, "cliente.estado": 1 } }
  ]).toArray();
}