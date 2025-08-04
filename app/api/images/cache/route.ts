import { NextRequest, NextResponse } from "next/server";
import { imageCache } from "@/lib/image-cache";

// DELETE /api/images/cache - 清除图片缓存
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");

    if (folder) {
      // 清除特定文件夹的缓存
      imageCache.clearCache(folder);
      return NextResponse.json({
        message: `Cache cleared for folder: ${folder}`,
      });
    } else {
      // 清除所有缓存
      imageCache.clearCache();
      return NextResponse.json({
        message: "All cache cleared",
      });
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
