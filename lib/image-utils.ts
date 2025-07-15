import sharp from "sharp";

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
}

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

export async function processImage(
  buffer: Buffer,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 85,
    format = "jpeg",
  } = options;

  try {
    const sharpInstance = sharp(buffer);
    const metadata = await sharpInstance.metadata();

    let processedInstance = sharpInstance;

    // Resize if necessary
    if (metadata.width && metadata.height) {
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        processedInstance = processedInstance.resize(maxWidth, maxHeight, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }
    }

    // Apply format and quality
    switch (format) {
      case "jpeg":
        processedInstance = processedInstance.jpeg({
          quality,
          progressive: true,
        });
        break;
      case "png":
        processedInstance = processedInstance.png({
          quality,
          progressive: true,
        });
        break;
      case "webp":
        processedInstance = processedInstance.webp({
          quality,
        });
        break;
    }

    const processedBuffer = await processedInstance.toBuffer();
    const processedMetadata = await sharp(processedBuffer).metadata();

    return {
      buffer: processedBuffer,
      width: processedMetadata.width || 0,
      height: processedMetadata.height || 0,
      format: processedMetadata.format || format,
      size: processedBuffer.length,
    };
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image");
  }
}

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${
        file.type
      }. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large: ${(file.size / 1024 / 1024).toFixed(
        2
      )}MB. Maximum allowed: 10MB`,
    };
  }

  return { valid: true };
}

export function generateImageFilename(
  userId: string,
  originalName: string
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `${userId}/${timestamp}-${randomString}.${extension}`;
}
