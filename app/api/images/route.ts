import { NextRequest, NextResponse } from "next/server";
import { imageCache } from "@/lib/image-cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");

    if (!folder) {
      return NextResponse.json(
        { error: "Folder parameter is required" },
        { status: 400 }
      );
    }

    // 使用缓存服务获取图片列表
    const images = await imageCache.getImages(folder);

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error reading images:", error);
    return NextResponse.json(
      { error: "Failed to read images" },
      { status: 500 }
    );
  }
}
