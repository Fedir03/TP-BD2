import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/routes.js";
import swaggerDocument from "./utils/swaggerDoc.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/openapi.json", (_, res) => res.json(swaggerDocument));

app.use("/queries", routes);

app.get("/", (req, res) => res.send("API Aseguradora funcionando"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
