'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { supabase, LANG_LABEL, LANG_COLOR, generateShortId } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { MOCK_SNIPPETS } from '@/lib/mock-data';
import type { Snippet } from '@/lib/supabase';
import { SectionHeader, EmptyState, LoadingScreen } from '@/components/dragonite-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Check, GitFork, Eye, Search, Code2, Plus, FileCode, Calendar, Globe, Lock, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function SnippetsListPage() {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>(MOCK_SNIPPETS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [scope, setScope] = useState<'public' | 'mine'>('public');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('snippets').select('*');
    if (scope === 'mine' && user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('is_public', true);
    }
    const { data } = await query.order('created_at', { ascending: false });
    if (data && data.length > 0) setSnippets(data as Snippet[]);
    else if (scope === 'public') setSnippets(MOCK_SNIPPETS);
    else setSnippets([]);
    setLoading(false);
  }, [scope, user]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return snippets.filter((s) => {
      const matchSearch = !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchLang = langFilter === 'all' || s.language === langFilter;
      return matchSearch && matchLang;
    });
  }, [snippets, search, langFilter]);

  const handleCopyCode = (s: Snippet) => {
    navigator.clipboard.writeText(s.code);
    setCopiedId(s.id);
    toast.success('Đã copy code!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFork = async (s: Snippet) => {
    if (!user) { toast.error('Vui lòng đăng nhập để fork'); return; }
    const { data, error } = await supabase.from('snippets').insert({
      title: s.title + ' (Fork)',
      language: s.language,
      code: s.code,
      notes: s.notes,
      sample_input: s.sample_input,
      sample_output: s.sample_output,
      is_public: false,
      tags: s.tags,
      short_id: generateShortId(),
    }).select('id').single();
    if (error) toast.error('Lỗi fork: ' + error.message);
    else { toast.success('Đã fork snippet!'); }
  };

  const handleCopyLink = (s: Snippet) => {
    if (!s.short_id) { toast.error('Snippet chưa có short link'); return; }
    const url = `${window.location.origin}/s/${s.short_id}`;
    navigator.clipboard.writeText(url);
    toast.success('Đã copy link: ' + url);
  };

  return (
    <div>
      <SectionHeader
        title="Chia Sẻ Code"
        subtitle="Kho snippet code — lưu, chia sẻ, và chạy thử trực tiếp"
        icon={<Code2 className="w-7 h-7" />}
        action={user && (
          <Link href="/snippets/new">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 glow-orange">
              <Plus className="w-4 h-4 mr-2" /> Tạo snippet mới
            </Button>
          </Link>
        )}
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc tag..."
            className="pl-9 bg-slate-900/50 border-slate-700" />
        </div>
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-[150px] bg-slate-900/50 border-slate-700"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="all">Tất cả ngôn ngữ</SelectItem>
            {Object.keys(LANG_LABEL).map((l) => <SelectItem key={l} value={l}>{LANG_LABEL[l]}</SelectItem>)}
          </SelectContent>
        </Select>
        {user && (
          <div className="flex gap-1 p-1 rounded-lg bg-slate-900/50 border border-slate-800">
            <button onClick={() => setScope('public')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${scope === 'public' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-slate-200'}`}>
              Công khai
            </button>
            <button onClick={() => setScope('mine')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${scope === 'mine' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-slate-200'}`}>
              Của tôi
            </button>
          </div>
        )}
      </div>

      {loading ? <LoadingScreen message="Đang tải snippets..." /> : filtered.length === 0 ? (
        <EmptyState icon={<Code2 className="w-10 h-10" />}
          title="Chưa có snippet nào"
          description={user ? "Tạo snippet đầu tiên của bạn." : "Đăng nhập để tạo snippet."}
          action={user && <Link href="/snippets/new"><Button className="bg-orange-500"><Plus className="w-4 h-4 mr-2" /> Tạo mới</Button></Link>} />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/30">
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider w-[100px]">ID</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Tiêu đề</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider w-[110px]">Ngôn ngữ</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider w-[90px]">Quyền</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider w-[120px]">Ngày tạo</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider w-[140px] text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} className="border-slate-800/50 problem-row hover:bg-slate-800/20">
                    <TableCell>
                      {s.short_id ? (
                        <Link href={`/s/${s.short_id}`} className="font-mono-code text-xs text-teal-400 hover:text-teal-300 transition-colors">
                          /s/{s.short_id}
                        </Link>
                      ) : (
                        <span className="font-mono-code text-xs text-slate-600">#{s.id.slice(0, 8)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/snippets/${s.id}`} className="group flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-1">{s.title}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={LANG_COLOR[s.language] || 'bg-slate-700 text-slate-300'}>
                        {LANG_LABEL[s.language] || s.language}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.is_public ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400"><Globe className="w-3 h-3" /> Public</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Lock className="w-3 h-3" /> Private</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" /> {new Date(s.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/snippets/${s.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all" title="Xem">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleCopyCode(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all" title="Copy code">
                          {copiedId === s.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        {s.short_id && (
                          <button onClick={() => handleCopyLink(s)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all" title="Copy share link">
                            <LinkIcon className="w-4 h-4" />
                          </button>
                        )}
                        {user && (
                          <button onClick={() => handleFork(s)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all" title="Fork">
                            <GitFork className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
