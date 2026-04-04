import pg from "pg";
const { Pool } = pg;

// Directly putting the working URL here to bypass .env issues
const pool = new Pool({
  connectionString: "postgres://team_60:password_60@csce-315-db.engr.tamu.edu:5432/team_60_db",
  ssl: {
    rejectUnauthorized: false // This was the key to making it work on local laptops
  }
});

export default pool;