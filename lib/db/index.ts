// Re-export sql from @vercel/postgres for consistency
export { sql } from "@vercel/postgres";

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
  image_data: string;
  filename?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  upload_order: number;
  created_at: Date;
}
