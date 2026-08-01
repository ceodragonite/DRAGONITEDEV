'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { MOCK_KB_ARTICLES } from '@/lib/mock-data';
import type { KnowledgeArticle } from '@/lib/supabase';
import { SectionHeader, EmptyState, LoadingScreen } from '@/components/dragonite-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Search, FileText, Calendar, User, Plus, Tag, Hash } from 'lucide-react';

const TAG_COLOR_PALETTE = [
  'bg-orange-500/15 text-orange-300 border-orange-500/20',
  'bg-teal-500/15 text-teal-300 border-teal-500/20',
  'bg-purple-500/15 text-purple-300 border-purple-500/20',
  'bg-blue-500/15 text-blue-300 border-blue-500/20',
  'bg-pink-500/15 text-pink-300 border-pink-500/20',
];
function tagColor(tag: string) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLOR_PALETTE[h % TAG_COLOR_PALETTE.length];
}

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<KnowledgeArticle[]>(MOCK_KB_ARTICLES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('knowledge_base').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) setArticles(data as KnowledgeArticle[]);
    else setArticles(MOCK_KB_ARTICLES);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    articles.forEach((a) => a.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchSearch = !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase());
      const matchTag = !activeTag || a.tags.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [articles, search, activeTag]);

  const getExcerpt = (content: string) => {
    const text = content.replace(/[#*`>\-\[\]]/g, '').replace(/\n+/g, ' ').trim();
    return text.slice(0, 160) + (text.length > 160 ? '...' : '');
  };

  return (
    <div>
      <SectionHeader
        title="Thư Viện Kiến Thức"
        subtitle="Wiki thuật toán — bài viết, công thức, và bài tập thực hành"
        icon={<BookOpen className="w-7 h-7" />}
        action={user && (
          <Link href="/kb/new">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 glow-orange">
              <Plus className="w-4 h-4 mr-2" /> Viết bài mới
            </Button>
          </Link>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-orange-400" /> Lọc theo tag
            </h3>
            <div className="space-y-1">
              <button onClick={() => setActiveTag(null)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                  !activeTag ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:bg-slate-800/50'
                }`}>
                Tất cả bài viết
              </button>
              {allTags.map((tag) => (
                <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                    activeTag === tag ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:bg-slate-800/50'
                  }`}>
                  <span className="text-slate-500">#</span>{tag}
                  <span className="text-xs text-slate-600 ml-1">
                    ({articles.filter((a) => a.tags.includes(tag)).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bài viết theo tiêu đề hoặc nội dung..."
              className="pl-9 bg-slate-900/50 border-slate-700" />
          </div>

          {loading ? <LoadingScreen message="Đang tải bài viết..." /> : filtered.length === 0 ? (
            <EmptyState icon={<BookOpen className="w-10 h-10" />}
              title="Không tìm thấy bài viết"
              description="Thử thay đổi từ khóa hoặc bộ lọc tag."
              action={user && <Link href="/kb/new"><Button className="bg-orange-500"><Plus className="w-4 h-4 mr-2" /> Viết bài</Button></Link>} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((a) => (
                <Link key={a.id} href={`/kb/${a.slug}`}
                  className="group rounded-xl border border-slate-800 bg-slate-900/50 p-5 card-hover hover:border-orange-500/30">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-2">{a.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3 line-clamp-3">{getExcerpt(a.content)}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {a.tags.slice(0, 4).map((t) => (
                      <Badge key={t} className={`text-xs ${tagColor(t)}`}>#{t}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(a.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
