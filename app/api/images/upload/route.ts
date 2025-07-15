import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

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

      // Validate file size (5MB limit for base64 storage)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            error: `File ${file.name} is too large. Maximum size is 5MB.`,
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

        // Resize if too large (max 1024px on longest side for base64 storage)
        const maxSize = 1024;
        if (metadata.width && metadata.height) {
          const isLandscape = metadata.width > metadata.height;
          const resizeOptions = isLandscape
            ? { width: Math.min(metadata.width, maxSize) }
            : { height: Math.min(metadata.height, maxSize) };

          processedBuffer = await sharpInstance
            .resize(resizeOptions)
            .jpeg({ quality: 80, progressive: true })
            .toBuffer();
        } else {
          processedBuffer = await sharpInstance
            .jpeg({ quality: 80, progressive: true })
            .toBuffer();
        }

        // Get updated metadata after processing
        const processedMetadata = await sharp(processedBuffer).metadata();
        metadata = processedMetadata;
      } catch (error) {
        console.error("Error processing image:", error);
        return NextResponse.json(
          {
            error: `Error processing image ${file.name}`,
          },
          { status: 400 }
        );
      }

      // Convert to base64
      const base64Data = `data:image/jpeg;base64,${processedBuffer.toString(
        "base64"
      )}`;

      uploadedImages.push({
        data: base64Data,
        filename: file.name,
        size: processedBuffer.length,
        width: metadata.width,
        height: metadata.height,
        mimeType: "image/jpeg",
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
