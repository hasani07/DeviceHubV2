'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type Project = { id: string; name: string; created_at: string };

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from('projects').insert({ name });
    setName('');
    loadProjects();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Project saya</h1>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama project baru, misal: Greenhouse"
          className="flex-1 px-3 py-2 rounded bg-gray-900 border border-gray-800"
          required
        />
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">
          Buat
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((p) => (
          <a
            key={p.id}
            href={`/dashboard/projects/${p.id}`}
            className="p-4 rounded-lg border border-gray-800 bg-gray-900 hover:border-gray-600"
          >
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(p.created_at).toLocaleDateString()}
            </div>
          </a>
        ))}
        {projects.length === 0 && (
          <p className="text-gray-500 text-sm">Belum ada project, buat dulu di atas.</p>
        )}
      </div>
    </div>
  );
}
