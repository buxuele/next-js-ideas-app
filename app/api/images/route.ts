import { NextRequest, NextResponse } from "next/server";
import { imageCache } from "@/lib/image-cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    if (!folder) {
      return NextResponse.json(
        { error: "Folder parameter is required" },
        { status: 400 }
      );
    }

    // 使用缓存服务获取分页后的图片列表和总数
    const { images, total } = await imageCache.getImages(folder, page, limit);

    return NextResponse.json({ images, total });
  } catch (error) {
    console.error("Error reading images:", error);
    return NextResponse.json(
      { error: "Failed to read images" },
      { status: 500 }
    );
  }
}
