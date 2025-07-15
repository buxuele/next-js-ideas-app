import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { del } from "@vercel/blob";
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

    // Get associated images before deletion (for cleanup)
    const imagesResult = await sql`
      SELECT blob_url FROM images WHERE post_id = ${postId}
    `;

    // Delete images from Vercel Blob storage
    const imageUrls = imagesResult.rows.map((row) => row.blob_url);
    for (const url of imageUrls) {
      try {
        await del(url);
      } catch (error) {
        console.error("Error deleting image from blob storage:", error);
        // Continue with other deletions even if one fails
      }
    }

    // Delete post (images will be deleted by CASCADE)
    await sql`
      DELETE FROM posts WHERE id = ${postId}
    `;

    return NextResponse.json({
      message: "Post deleted successfully",
      deletedImages: imageUrls,
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
