// 文件路径: src/app/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';

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

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error("获取笔记失败:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, category: 'Capture' }),
    });
    setContent('');
    fetchNotes();
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个想法吗？它将无法恢复。')) {
      return;
    }
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    fetchNotes();
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-12 bg-brand-cream text-brand-green-dark">
      <div className="w-full max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center">
          嘿，你在想什么。
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-12 max-w-xl mx-auto">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="记录一闪而过的想法..."
            className="w-full p-3 border-2 border-brand-green-light rounded-lg text-lg bg-white focus:border-brand-orange-dark focus:ring-0"
          />
          <button type="submit" className="w-full mt-3 px-4 py-3 bg-brand-green-dark text-white rounded-lg hover:bg-brand-green-light font-bold text-lg">
            记下来
          </button>
        </form>
        
        {isLoading ? (
          <p className="text-center text-lg">正在加载你的想法...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="p-5 bg-brand-orange-light rounded-lg shadow-md border-2 border-brand-orange-dark flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
              >
                <div>
                  <p className="text-sm font-semibold text-brand-green-dark opacity-75">{note.category}</p>
                  <p className="mt-2 text-lg text-brand-green-dark break-words">{note.content}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-brand-orange-dark border-opacity-30 flex justify-between items-center">
                   <p className="text-xs text-brand-green-dark opacity-60">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                  <button 
                    onClick={() => handleDelete(note.id)}
                    className="px-2 py-1 text-xs text-red-700 hover:bg-red-100 rounded-md transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}