const { sql } = require("@vercel/postgres");
const fs = require("fs");
const path = require("path");

async function initDatabase() {
  try {
    console.log("Initializing database...");

    const schemaPath = path.join(__dirname, "../lib/db/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = schema.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Executing:", statement.substring(0, 50) + "...");
        await sql.query(statement);
      }
    }

    console.log("Database initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

initDatabase();
