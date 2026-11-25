import { readFile } from "node:fs/promises";
import { pool } from "./db.js";

const schemaUrl = new URL("../db/schema.sql", import.meta.url);
const schema = await readFile(schemaUrl, "utf8");
await pool.query(schema);
await pool.end();
console.log("Database schema is up to date.");
