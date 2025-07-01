// 文件路径: src/app/api/notes/route.ts

import { db } from '@vercel/postgres'; // 引入我们装好的数据库驱动
import { NextResponse } from 'next/server'; // 引入 Next.js 的响应工具

/**
 *  处理 GET 请求，用来获取所有笔记
 */
export async function GET() {
  try {
    // 从数据库连接池中获取一个客户端
    const client = await db.connect();
    
    // 执行 SQL 查询，选择 notes 表里的所有数据，按创建时间倒序排列
    const { rows } = await client.query('SELECT * FROM notes ORDER BY created_at DESC;');
    
    // 释放客户端，把它还给连接池
    client.release(); 
    
    // 把查询到的数据（rows）作为 JSON 格式返回给前端
    return NextResponse.json({ notes: rows });

  } catch (error) {
    // 如果发生错误，在服务器后台打印错误，并返回一个 500 错误响应
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 *  处理 POST 请求，用来创建一条新笔记
 */
export async function POST(request: Request) {
  try {
    // 解析前端发来的请求体（JSON 格式）
    const body = await request.json();
    const { content, category } = body;

    // 简单验证一下，确保内容和分类不为空
    if (!content || !category) {
      return NextResponse.json({ error: 'Content and category are required' }, { status: 400 });
    }

    const client = await db.connect();

    // 执行 SQL 插入操作。使用 $1, $2 占位符可以防止 SQL 注入，非常安全！
    await client.query(
      'INSERT INTO notes (content, category) VALUES ($1, $2);',
      [content, category]
    );
    client.release();

    // 返回一个成功的响应
    return NextResponse.json({ message: 'Note created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}