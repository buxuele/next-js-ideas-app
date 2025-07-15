import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// POST /api/images/upload - Upload images to database as base64
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: "Cannot upload more than 5 images" },
        { status: 400 }
      );
    }

    const uploadedImages = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            error: `Invalid file type: ${file.type}. Only images are allowed.`,
          },
          { status: 400 }
        );
      }

      // Validate file size (2MB limit for base64 storage)
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json(
          {
            error: `File ${file.name} is too large. Maximum size is 2MB.`,
          },
          { status: 400 }
        );
      }

      // Convert file to buffer and then to base64
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Data = `data:${file.type};base64,${buffer.toString(
        "base64"
      )}`;

      uploadedImages.push({
        data: base64Data,
        filename: file.name,
        size: buffer.length,
        width: 800, // Default width
        height: 600, // Default height
        mimeType: file.type,
      });
    }

    return NextResponse.json({
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Error in image upload:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
