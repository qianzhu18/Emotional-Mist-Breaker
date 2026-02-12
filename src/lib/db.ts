import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

declare global {
  var __EFB_DB_POOL__: Pool | undefined;
}

function shouldUseSsl(connectionString: string): boolean {
  if (connectionString.includes("localhost") || connectionString.includes("127.0.0.1")) {
    return false;
  }

  if (connectionString.includes("sslmode=disable")) {
    return false;
  }

  return true;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabasePool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("缺少环境变量 DATABASE_URL");
  }

  if (!global.__EFB_DB_POOL__) {
    global.__EFB_DB_POOL__ = new Pool({
      connectionString,
      ssl: shouldUseSsl(connectionString)
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
    });
  }

  return global.__EFB_DB_POOL__;
}

export async function queryDatabase<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return getDatabasePool().query<T>(sql, params);
}

export async function withDatabaseTransaction<T>(
  run: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getDatabasePool().connect();

  try {
    await client.query("BEGIN");
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
