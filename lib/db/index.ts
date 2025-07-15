import { sql } from "@vercel/postgres";

export { sql };

// Database utility functions
export async function initializeDatabase() {
  try {
    // Read and execute schema
    const fs = require("fs");
    const path = require("path");
    const schemaPath = path.join(process.cwd(), "lib/db/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = schema.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement);
      }
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Type definitions for database entities
export interface User {
  id: string;
  github_id: string;
  username: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  user?: User;
  images?: Image[];
}

export interface Image {
  id: string;
  post_id: string;
  blob_url: string;
  filename?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  upload_order: number;
  created_at: Date;
}
