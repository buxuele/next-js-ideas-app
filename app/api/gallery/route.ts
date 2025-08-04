import { NextResponse } from "next/server";

// GET /api/gallery - 获取所有图片
// 这个 API 已被弃用，请使用 /api/images?folder=xxx 代替
export async function GET() {
  try {
    return NextResponse.json(
      {
        error: "This API is deprecated. Use /api/images?folder=xxx instead",
        message: "Please use the folder-specific image API",
      },
      { status: 410 }
    );
  } catch (error) {
    console.error("Error in gallery API:", error);
    return NextResponse.json({ error: "API deprecated" }, { status: 410 });
  }
}
