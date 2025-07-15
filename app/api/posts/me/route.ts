import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/posts/me - Get current user's posts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Get current user's posts with images
    const result = await sql`
      SELECT 
        p.id,
        p.content,
        p.created_at,
        p.updated_at,
        COALESCE(
          JSON_AGG(
            CASE WHEN i.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', i.id,
                'blob_url', i.blob_url,
                'filename', i.filename,
                'width', i.width,
                'height', i.height,
                'upload_order', i.upload_order
              )
            END ORDER BY i.upload_order
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'
        ) as images
      FROM posts p
      LEFT JOIN images i ON p.id = i.post_id
      WHERE p.user_id = ${session.user.id}
      GROUP BY p.id, p.content, p.created_at, p.updated_at
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const posts = result.rows.map((row) => ({
      id: row.id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      images: row.images || [],
    }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
