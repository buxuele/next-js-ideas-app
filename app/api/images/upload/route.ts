import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// POST /api/images/upload - Upload images to Vercel Blob
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

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            error: `File ${file.name} is too large. Maximum size is 10MB.`,
          },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Process image with Sharp for optimization
      let processedBuffer: Buffer;
      let metadata: sharp.Metadata;

      try {
        const sharpInstance = sharp(buffer);
        metadata = await sharpInstance.metadata();

        // Resize if too large (max 2048px on longest side)
        const maxSize = 2048;
        if (metadata.width && metadata.height) {
          const isLandscape = metadata.width > metadata.height;
          const resizeOptions = isLandscape
            ? { width: Math.min(metadata.width, maxSize) }
            : { height: Math.min(metadata.height, maxSize) };

          processedBuffer = await sharpInstance
            .resize(resizeOptions)
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();
        } else {
          processedBuffer = await sharpInstance
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();
        }
      } catch (error) {
        console.error("Error processing image:", error);
        return NextResponse.json(
          {
            error: `Error processing image ${file.name}`,
          },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split(".").pop() || "jpg";
      const filename = `${session.user.id}/${timestamp}-${randomString}.${extension}`;

      try {
        // Upload to Vercel Blob
        const blob = await put(filename, processedBuffer, {
          access: "public",
          contentType: "image/jpeg",
        });

        uploadedImages.push({
          url: blob.url,
          filename: file.name,
          size: processedBuffer.length,
          width: metadata.width,
          height: metadata.height,
          mimeType: "image/jpeg",
        });
      } catch (error) {
        console.error("Error uploading to blob:", error);
        return NextResponse.json(
          {
            error: `Error uploading image ${file.name}`,
          },
          { status: 500 }
        );
      }
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
