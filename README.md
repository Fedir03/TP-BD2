# TP-BD2 · API de Aseguradora

En este repositorio se encuentra una API Node.js/Express que expone consultas analíticas sobre una aseguradora utilizando dos motores: MongoDB (consultas documentales) y Neo4j (consultas gráficas). La especificación OpenAPI se publica junto con Swagger UI para poder explorar y probar los endpoints sin necesidad de herramientas externas.

## Arquitectura y stack
- **Node.js 20+ / Express 5** para la capa HTTP.
- **MongoDB** para colecciones de clientes, pólizas, siniestros, vehículos y agentes.
- **Neo4j** para relaciones entre entidades y consultas navegacionales.
- **Swagger UI** disponible en `/docs`.
- **Docker Compose** provisiona MongoDB y Neo4j con datos persistidos en `./data`.

## Requisitos previos
- Docker y Docker Compose.
- Node.js ≥ 20 y npm ≥ 10.
- Acceso a los puertos `27017`, `7474`, `7687` y `3000`.

## Puesta en marcha

1. **Levantar las bases de datos**
   ```bash
   docker-compose up -d
   ```
   Los volúmenes quedan montados sobre `./data/mongo` y `./data/neo4j`, por lo que los datos persisten entre reinicios.

2. **Instalar dependencias del proyecto**
   ```bash
   npm install
   ```

3. **Configurar variables opcionales**
   Puedes crear un archivo `.env` o exportar variables antes de ejecutar los scripts:
   - `MONGO_URI` (por defecto `mongodb://localhost:27017`)
   - `MONGO_DB_NAME` (por defecto `aseguradora`)
   - `NEO4J_URI` (por defecto `bolt://localhost:7687`)
   - `NEO4J_USER` / `NEO4J_PASSWORD` (coinciden con los valores definidos en `docker-compose.yml`)

4. **Cargar los datos de ejemplo (CSV en `./data`)**
   ```bash
   npm run import:mongo
   npm run import:neo4j
   ```
   - El importador de Mongo elimina el contenido previo de las colecciones y vuelve a insertar los CSV.
   - El importador de Neo4j limpia los nodos/relaciones existentes y usa `LOAD CSV` sobre el volumen compartido (`./data` → `/import`).

5. **Iniciar la API**
   ```bash
   npm start
   ```
   Usa `npm run dev` si preferís hot reload con `nodemon`.

La aplicación queda escuchando en `http://localhost:3000`. La ruta raíz (`/`) devuelve un mensaje de estado rápido.

## Uso de Swagger UI
- Abrí `http://localhost:3000/docs` para acceder a Swagger UI.
- Los endpoints están agrupados por tag (`MongoDB`, `Neo4j`, `Operaciones`). Cada uno documenta parámetros, schemas y ejemplos de respuesta.
- Podés usar **Try it out** para enviar requests reales contra la API y ver el request/response generado.
- La especificación OpenAPI también está disponible de forma cruda en `http://localhost:3000/openapi.json`.

## Endpoints principales

### Consultas analíticas (`/queries/queryN`)
Todas las consultas se sirven bajo `/queries` y se numeran igual que en la consigna del TP:

1. `GET /queries/query1` – Clientes activos con pólizas vigentes (MongoDB).
2. `GET /queries/query2` – Siniestros abiertos con tipo, monto y cliente afectado (Neo4j).
3. `GET /queries/query3` – Vehículos asegurados con su titular y póliza (Neo4j).
4. `GET /queries/query4` – Clientes sin pólizas activas (MongoDB).
5. `GET /queries/query5` – Agentes activos y cantidad de pólizas emitidas (Neo4j).
6. `GET /queries/query6` – Pólizas vencidas junto con los datos del cliente (MongoDB).
7. `GET /queries/query7` – Top 10 clientes por monto total de cobertura (MongoDB).
8. `GET /queries/query8` – Siniestros tipo “Accidente” registrados en el último año (MongoDB).
9. `GET /queries/query9` – Vista de pólizas activas ordenadas por fecha de inicio (MongoDB).
10. `GET /queries/query10` – Pólizas suspendidas con el estado del cliente (MongoDB).
11. `GET /queries/query11` – Clientes con más de un vehículo asegurado (Neo4j).
12. `GET /queries/query12` – Agentes y cantidad de siniestros asociados (Neo4j).

### Operaciones (ABM)
- `POST /queries/crear-cliente` – Alta de cliente en MongoDB y Neo4j.
- `PUT /queries/modificar-cliente/:id` – Modificación parcial de un cliente existente.
- `DELETE /queries/borrar-cliente/:id` – Baja de cliente con cascada en ambas bases (pólizas y siniestros dependientes incluidos).
- `POST /queries/crear-siniestro` – Alta de siniestro en ambas bases validando el `nro_poliza`.
- `POST /queries/crear-poliza` – Alta de póliza verificando existencia de cliente y agente en ambos motores.
  
A nivel health check, `/` devuelve un simple “API Aseguradora funcionando”.

## Scripts npm
| Script             | Descripción                                                |
|--------------------|------------------------------------------------------------|
| `npm start`        | Arranca la API en modo producción.                         |
| `npm run dev`      | Arranca la API con `nodemon` para recarga en caliente.     |
| `npm run import:mongo` | Importa todos los CSV en MongoDB.                      |
| `npm run import:neo4j` | Inicializa Neo4j y carga nodos/relaciones desde CSV.   |
