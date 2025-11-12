# TP-BD2 · API de Aseguradora

API Node.js/Express que expone consultas analíticas sobre una aseguradora utilizando dos motores: MongoDB (consultas documentales) y Neo4j (consultas gráficas). La especificación OpenAPI se publica junto con Swagger UI para poder explorar y probar los endpoints sin necesidad de herramientas externas.

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
- Cada endpoint aparece agrupado por recurso (`/mongo` y `/neo`). Podés:
  1. Expandir un endpoint para ver su descripción y el schema de respuesta.
  2. Presionar **Try it out**, modificar parámetros (si aplica) y ejecutar la petición.
  3. Consultar el request/response real que genera la API.
- Si necesitás consumir la especificación en otra herramienta, está disponible en `http://localhost:3000/openapi.json`.

## Endpoints principales

### Consultas MongoDB (`/mongo`)
- `GET /mongo/clientes-activos` – Clientes activos con pólizas vigentes.
- `GET /mongo/clientes-sin-polizas` – Clientes sin pólizas activas.
- `GET /mongo/polizas-vencidas` – Pólizas vencidas junto con el titular.
- `GET /mongo/top-clientes-cobertura` – Top 10 por monto total de cobertura.
- `GET /mongo/siniestros-tipo-accidente` – Siniestros tipo “Accidente” del último año.
- `GET /mongo/polizas-suspendidas` – Pólizas suspendidas con el estado del cliente.

### Consultas Neo4j (`/neo`)
- `GET /neo/agentes-polizas` – Agentes activos y cantidad de pólizas emitidas.
- `GET /neo/agentes-siniestros` – Agentes y siniestros asociados.
- `GET /neo/clientes-multivehiculo` – Clientes con más de un vehículo asegurado.
- `GET /neo/siniestros-abiertos` – Siniestros abiertos con cliente impactado.
- `GET /neo/vehiculos-asegurados` – Vehículos con su titular y póliza.

## Scripts npm
| Script             | Descripción                                                |
|--------------------|------------------------------------------------------------|
| `npm start`        | Arranca la API en modo producción.                         |
| `npm run dev`      | Arranca la API con `nodemon` para recarga en caliente.     |
| `npm run import:mongo` | Importa todos los CSV en MongoDB.                      |
| `npm run import:neo4j` | Inicializa Neo4j y carga nodos/relaciones desde CSV.   |
