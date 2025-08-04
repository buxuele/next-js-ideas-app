import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const imgsPath = path.join(process.cwd(), "public", "imgs");

    // 检查目录是否存在
    if (!fs.existsSync(imgsPath)) {
      return NextResponse.json({ folders: [] });
    }

    // 读取目录内容
    const items = fs.readdirSync(imgsPath, { withFileTypes: true });

    // 只获取文件夹
    const folders = items
      .filter((item) => item.isDirectory())
      .map((item) => item.name)
      .sort(); // 按字母顺序排序

    return NextResponse.json({ folders });
  } catch (error) {
    console.error("Error reading folders:", error);
    return NextResponse.json(
      { error: "Failed to read folders" },
      { status: 500 }
    );
  }
}
