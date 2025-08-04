import { NextResponse } from "next/server";
import { ImageManager } from "@/lib/image-manager";

// GET /api/gallery - 获取所有图片
export async function GET() {
  try {
    const imageManager = new ImageManager();
    const images = imageManager.getAllImages();

    return NextResponse.json({
      images,
      total: images.length,
    });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
