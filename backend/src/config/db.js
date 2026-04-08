import pg from "pg";
import dotenv from "dotenv";

// This line loads the variables from your .env file
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

// Added a quick log to verify connection (optional)
pool.on('connect', () => {
  console.log('Database connected successfully');
});

export default pool;