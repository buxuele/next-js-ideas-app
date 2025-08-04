import { NextResponse } from "next/server";
import { imageCache } from "@/lib/image-cache";

export async function GET() {
  try {
    // 使用缓存服务获取文件夹列表
    const folders = await imageCache.getFolders();
    return NextResponse.json({ folders });
  } catch (error) {
    console.error("Error reading folders:", error);
    return NextResponse.json(
      { error: "Failed to read folders" },
      { status: 500 }
    );
  }
}
