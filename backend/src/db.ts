import pg from "pg";
import { config } from "./config.js";

// Return DATE columns as "YYYY-MM-DD" strings instead of JS Dates shifted into the server's time zone.
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

// Neon requires SSL; the ?sslmode=require in DATABASE_URL turns it on.
export const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 5 });

export async function withTransaction<T>(work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
