import express from "express";
import {
  agentesConPolizas,
  agentesConSiniestros,
  clientesMultivehiculo,
  siniestrosAbiertos,
  vehiculosAsegurados
} from "../neo/queries.js";

const router = express.Router();

router.get("/agentes-polizas", async (_, res) => res.json(await agentesConPolizas()));
router.get("/agentes-siniestros", async (_, res) => res.json(await agentesConSiniestros()));
router.get("/clientes-multivehiculo", async (_, res) => res.json(await clientesMultivehiculo()));
router.get("/siniestros-abiertos", async (_, res) => res.json(await siniestrosAbiertos()));
router.get("/vehiculos-asegurados", async (_, res) => res.json(await vehiculosAsegurados()));

export default router;
