import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGO_DB_NAME || "aseguradora";

export const client = new MongoClient(uri);
export const db = client.db(dbName);