import express from "express";
import {
  clientesActivos,
  clientesSinPolizas,
  polizasVencidas,
  topClientesCobertura,
  siniestrosTipoAccidente,
  polizasSuspendidas
} from "../mongo/queries.js";
import {
  agentesConPolizas,
  agentesConSiniestros,
  clientesMultivehiculo,
  siniestrosAbiertos,
  vehiculosAsegurados
} from "../neo/queries.js";
import {
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  crearSiniestro,
  crearPoliza,
  MISSING_ARGUMENTS,
  ALREADY_EXISTS,
  NOT_FOUND
} from "../shared/shared.js";

const router = express.Router();

// 1.
router.get("/query1", async (_, res) => res.json(await clientesActivos()));
// 2.
router.get("/query2", async (_, res) => res.json(await siniestrosAbiertos()));
// 3.
router.get("/query3", async (_, res) => res.json(await vehiculosAsegurados()));
// 4.
router.get("/query4", async (_, res) => res.json(await clientesSinPolizas()));
// 5.
router.get("/query5", async (_, res) => res.json(await agentesConPolizas()));
// 6.
router.get("/query6", async (_, res) => res.json(await polizasVencidas()));
// 7.
router.get("/query7", async (_, res) => res.json(await topClientesCobertura()));
// 8.
router.get("/query8", async (_, res) => res.json(await siniestrosTipoAccidente()));
// 9.
router.get("/query9", async (_, res) => res.json(await verPolizasActivas()));
// 10.
router.get("/query10", async (_, res) => res.json(await polizasSuspendidas()));
// 11.
router.get("/query11", async (_, res) => res.json(await clientesMultivehiculo()));
// 12.
router.get("/query12", async (_, res) => res.json(await agentesConSiniestros()));

// 13. alta
router.post("/crear-cliente", async (req, res) => {
  try {
    const result = await crearCliente(req.body);
    if (result === ALREADY_EXISTS) return res.status(409).json({ error: "ALREADY_EXISTS" });
    return res.status(201).json(result);
  } catch (e) {
    if (e.message === "MISSING_ARGUMENTS") return res.status(400).json({ error: "MISSING_ARGUMENTS" });
    return res.status(500).json({ error: e.message });
  }
});

// 13. modificacion
router.put("/modificar-cliente/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await actualizarCliente(id, req.body);
    if (result === NOT_FOUND) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(result);
  } catch (e) {
    if (e.message === "MISSING_ARGUMENTS") return res.status(400).json({ error: "MISSING_ARGUMENTS" });
    return res.status(500).json({ error: e.message });
  }
});

// 13. baja
router.delete("/borrar-cliente/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await eliminarCliente(id);
    if (result === NOT_FOUND) return res.status(404).json({ error: "NOT_FOUND" });
    return res.json(result);
  } catch (e) {
    if (e.message === "MISSING_ARGUMENTS") return res.status(400).json({ error: "MISSING_ARGUMENTS" });
    return res.status(500).json({ error: e.message });
  }
});

// 14. crear siniestro
router.post("/crear-siniestro", async (req, res) => {
  try {
    const result = await crearSiniestro(req.body);
    if (result === ALREADY_EXISTS) return res.status(409).json({ error: "ALREADY_EXISTS" });
    if (result === NOT_FOUND) return res.status(404).json({ error: "NOT_FOUND" });
    return res.status(201).json(result);
  } catch (e) {
    if (e.message === "MISSING_ARGUMENTS") return res.status(400).json({ error: "MISSING_ARGUMENTS" });
    return res.status(500).json({ error: e.message });
  }
});

// 15. crear poliza
router.post("/crear-poliza", async (req, res) => {
  try {
    const result = await crearPoliza(req.body);
    if (result === ALREADY_EXISTS) return res.status(409).json({ error: "ALREADY_EXISTS" });
    if (result === NOT_FOUND) return res.status(404).json({ error: "NOT_FOUND" });
    return res.status(201).json(result);
  } catch (e) {
    if (e.message === "MISSING_ARGUMENTS") return res.status(400).json({ error: "MISSING_ARGUMENTS" });
    return res.status(500).json({ error: e.message });
  }
});

export default router;
