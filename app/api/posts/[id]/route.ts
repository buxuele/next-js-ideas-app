import { auth } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/posts/[id] - Delete user's own post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = params.id;

    // Verify post belongs to current user
    const postCheck = await sql`
      SELECT user_id FROM posts WHERE id = ${postId}
    `;

    if (postCheck.rows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (postCheck.rows[0].user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete post (images will be deleted by CASCADE)
    await sql`
      DELETE FROM posts WHERE id = ${postId}
    `;

    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
