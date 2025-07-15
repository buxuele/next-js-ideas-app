import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { PostSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// GET /api/posts - Get posts for explore page (other users' posts)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get posts from other users (not current user)
    const result = await sql`
      SELECT 
        p.id,
        p.content,
        p.created_at,
        p.updated_at,
        u.id as user_id,
        u.username,
        u.display_name,
        u.avatar_url,
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
      JOIN users u ON p.user_id = u.id
      LEFT JOIN images i ON p.id = i.post_id
      WHERE p.user_id != ${session.user.id}
      GROUP BY p.id, p.content, p.created_at, p.updated_at, u.id, u.username, u.display_name, u.avatar_url
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const posts = result.rows.map((row) => ({
      id: row.id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
      },
      images: row.images || [],
    }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = PostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { content, images = [] } = validation.data;

    // Create post
    const postResult = await sql`
      INSERT INTO posts (user_id, content)
      VALUES (${session.user.id}, ${content})
      RETURNING id, created_at
    `;

    const post = postResult.rows[0];

    // Add images if provided
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await sql`
          INSERT INTO images (post_id, blob_url, upload_order)
          VALUES (${post.id}, ${images[i]}, ${i})
        `;
      }
    }

    return NextResponse.json(
      {
        message: "Post created successfully",
        post: {
          id: post.id,
          content,
          created_at: post.created_at,
          images,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
