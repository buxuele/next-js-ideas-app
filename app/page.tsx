// 文件路径: src/app/page.tsx
"use client"; // 整个页面都需要用户交互，所以我们把它标记为客户端组件

import { useState, useEffect, FormEvent } from 'react';

// 定义 Note 的数据类型，让代码更健壮
type Note = {
  id: string;
  content: string;
  category: string;
  created_at: string;
};

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 定义一个函数，用于从我们的 API 获取所有笔记
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error("获取笔记失败:", error);
      // 可以在这里设置一个错误状态，在界面上提示用户
    }
    setIsLoading(false);
  };

  // useEffect 这个 Hook 会在组件第一次加载到屏幕上时，运行一次里面的代码
  useEffect(() => {
    fetchNotes();
  }, []); // 空数组 [] 表示这个 effect 只在最开始运行一次

  // 处理表单提交的函数
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 阻止表单提交时页面刷新
    if (!content.trim()) return; // 如果输入为空，则不提交

    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, category: 'Capture' }), // 新笔记默认分类为 Capture
    });

    setContent(''); // 提交后清空输入框
    fetchNotes(); // 关键：重新获取笔记列表，从而刷新界面显示
  };

  // 下面是页面的 JSX 结构
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-50">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">MindStream</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="记录一闪而过的想法..."
            className="w-full p-2 border rounded text-black bg-white"
          />
          <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            添加想法
          </button>
        </form>
        
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-gray-500 text-center">正在加载想法...</p>
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="p-4 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-500 font-semibold">{note.category}</p>
                <p className="mt-1 text-gray-800">{note.content}</p>
                <p className="text-xs text-gray-400 mt-2 text-right">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">还没有任何想法，快记录你的第一个吧！</p>
          )}
        </div>
      </div>
    </main>
  );
}