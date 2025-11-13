import neo4j from "neo4j-driver";

const NEO4J_URI = process.env.NEO4J_URI || "bolt://localhost:7687";
const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "neo4jpass";

export const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  {
    encrypted: "ENCRYPTION_OFF",
  }
);

export function getSession(mode = "WRITE") {
  return driver.session({ defaultAccessMode: neo4j.session[mode] });
}

export async function testConnection() {
  const session = getSession("READ");
  try {
    const result = await session.run("RETURN 'Conexión exitosa a Neo4j' AS msg");
    console.log(result.records[0].get("msg"));
  } catch (err) {
    console.error("Error conectando a Neo4j:", err.message);
  } finally {
    await session.close();
  }
}

export async function closeConnection() {
  await driver.close();
  console.log("Conexión a Neo4j cerrada.");
}
