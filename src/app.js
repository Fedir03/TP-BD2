import express from "express";
import cors from "cors";
import mongoRoutes from "./routes/mongo.js";
import neoRoutes from "./routes/neo.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/mongo", mongoRoutes);
app.use("/neo", neoRoutes);

app.get("/", (req, res) => res.send("API Aseguradora funcionando"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
