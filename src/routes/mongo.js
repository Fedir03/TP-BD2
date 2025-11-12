// import express from "express";
// import {
//   clientesActivos,
//   clientesSinPolizas,
//   polizasVencidas,
//   topClientesCobertura,
//   siniestrosTipoAccidente,
//   polizasSuspendidas
// } from "../mongo/queries.js";

// const router = express.Router();

// // 1.
// router.get("/clientes-activos", async (_, res) => res.json(await clientesActivos()));
// // 4.
// router.get("/clientes-sin-polizas", async (_, res) => res.json(await clientesSinPolizas()));
// // 6.
// router.get("/polizas-vencidas", async (_, res) => res.json(await polizasVencidas()));
// // 7.
// router.get("/top-clientes-cobertura", async (_, res) => res.json(await topClientesCobertura()));
// // 8.
// router.get("/siniestros-tipo-accidente", async (_, res) => res.json(await siniestrosTipoAccidente()));
// // 10.
// router.get("/polizas-suspendidas", async (_, res) => res.json(await polizasSuspendidas()));

// export default router;