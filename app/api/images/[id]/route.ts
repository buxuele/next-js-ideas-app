import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/images/[id] - Delete image from storage
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const imageId = params.id;

    // Get image info and verify ownership
    const imageResult = await sql`
      SELECT i.blob_url, p.user_id
      FROM images i
      JOIN posts p ON i.post_id = p.id
      WHERE i.id = ${imageId}
    `;

    if (imageResult.rows.length === 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const image = imageResult.rows[0];

    // Verify user owns the post containing this image
    if (image.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      // Delete from Vercel Blob storage
      await del(image.blob_url);
    } catch (error) {
      console.error("Error deleting from blob storage:", error);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    await sql`
      DELETE FROM images WHERE id = ${imageId}
    `;

    return NextResponse.json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
