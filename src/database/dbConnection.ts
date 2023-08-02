import { Pool, PoolConfig } from "pg";

const dbConfig: PoolConfig = {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
};

const pool = new Pool(dbConfig);

export default pool;
