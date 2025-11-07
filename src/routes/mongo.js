import express from "express";
import {
  clientesActivos,
  clientesSinPolizas,
  polizasVencidas,
  topClientesCobertura,
  siniestrosTipoAccidente,
  polizasSuspendidas
} from "../mongo/queries.js";

const router = express.Router();

router.get("/clientes-activos", async (_, res) => res.json(await clientesActivos()));
router.get("/clientes-sin-polizas", async (_, res) => res.json(await clientesSinPolizas()));
router.get("/polizas-vencidas", async (_, res) => res.json(await polizasVencidas()));
router.get("/top-clientes-cobertura", async (_, res) => res.json(await topClientesCobertura()));
router.get("/siniestros-tipo-accidente", async (_, res) => res.json(await siniestrosTipoAccidente()));
router.get("/polizas-suspendidas", async (_, res) => res.json(await polizasSuspendidas()));

export default router;