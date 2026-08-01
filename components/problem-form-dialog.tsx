'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Problem, Snippet, KnowledgeArticle } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus, FileCode, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

const PLATFORMS = ['VNOI', 'Codeforces', 'SPOJ', 'CSES', 'LQDOJ', 'Ntucoder'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const STATUSES = ['AC', 'TLE', 'WA', 'Todo'];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  problem: Problem | null;
  snippets: Snippet[];
  kbArticles: KnowledgeArticle[];
  onSaved: () => void;
  useMock: boolean;
};

const EMPTY: Partial<Problem> = {
  stt: 1, title: '', problem_code: '', platform: 'VNOI', difficulty: 'Medium',
  tags: [], problem_url: '', notes: '', solve_full_type: null, solve_full_value: '',
  solve_trick: '', status: 'Todo', kb_article_id: null,
};

export function ProblemFormDialog({ open, onOpenChange, problem, snippets, kbArticles, onSaved, useMock }: Props) {
  const [form, setForm] = useState<Partial<Problem>>(EMPTY);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (problem) setForm(problem);
    else setForm({ ...EMPTY });
    setTagInput('');
  }, [problem, open]);

  const update = (k: keyof Problem, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !(form.tags || []).includes(t)) update('tags', [...(form.tags || []), t]);
    setTagInput('');
  };
  const removeTag = (t: string) => update('tags', (form.tags || []).filter((x) => x !== t));

  const handleSave = async () => {
    if (!form.title?.trim()) { toast.error('Vui lòng nhập tên bài'); return; }
    setSaving(true);

    if (useMock) {
      toast.success(problem ? 'Đã cập nhật (mock)' : 'Đã thêm bài (mock)');
      onSaved(); onOpenChange(false); setSaving(false);
      return;
    }

    const payload = {
      stt: form.stt ? Number(form.stt) : null,
      title: form.title,
      problem_code: form.problem_code || null,
      platform: form.platform,
      difficulty: form.difficulty,
      tags: form.tags || [],
      problem_url: form.problem_url || null,
      notes: form.notes || null,
      solve_full_type: form.solve_full_type || null,
      solve_full_value: form.solve_full_value || null,
      solve_trick: form.solve_trick || null,
      status: form.status,
      kb_article_id: form.kb_article_id || null,
    };

    let error;
    if (problem) {
      ({ error } = await supabase.from('problems').update(payload).eq('id', problem.id));
    } else {
      ({ error } = await supabase.from('problems').insert(payload));
    }

    if (error) toast.error('Lỗi: ' + error.message);
    else { toast.success(problem ? 'Đã cập nhật bài tập' : 'Đã thêm bài tập'); onSaved(); onOpenChange(false); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl">
            <span className="dragon-gradient-text">{problem ? 'Sửa bài tập' : 'Thêm bài tập mới'}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Điền thông tin bài tập. Các ô có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300">* Tên bài</Label>
            <Input value={form.title || ''} onChange={(e) => update('title', e.target.value)}
              className="bg-slate-800/50 border-slate-700" placeholder="VD: Segment Tree cơ bản" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">Mã bài (ID)</Label>
            <Input value={form.problem_code || ''} onChange={(e) => update('problem_code', e.target.value)}
              className="bg-slate-800/50 border-slate-700 font-mono-code" placeholder="VD: SEGTREE" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">* Platform</Label>
            <Select value={form.platform} onValueChange={(v) => update('platform', v)}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">* Mức độ</Label>
            <Select value={form.difficulty} onValueChange={(v) => update('difficulty', v)}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">Số thứ tự</Label>
            <Input type="number" value={form.stt ?? ''} onChange={(e) => update('stt', e.target.value ? Number(e.target.value) : null)}
              className="bg-slate-800/50 border-slate-700" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">* Trạng thái</Label>
            <Select value={form.status} onValueChange={(v) => update('status', v)}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s === 'Todo' ? 'Chưa làm' : s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-slate-300">Link đề bài gốc</Label>
            <Input value={form.problem_url || ''} onChange={(e) => update('problem_url', e.target.value)}
              className="bg-slate-800/50 border-slate-700" placeholder="https://..." />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label className="text-slate-300">Phân loại (Tags)</Label>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="bg-slate-800/50 border-slate-700" placeholder="segment-tree, dp, dfs..." />
            <Button type="button" onClick={addTag} variant="outline" className="bg-slate-800/50 border-slate-700">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(form.tags || []).map((t) => (
              <Badge key={t} className="bg-orange-500/15 text-orange-300 border border-orange-500/20">
                #{t}
                <button onClick={() => removeTag(t)} className="ml-1 hover:text-red-400"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-slate-300">Ghi chú cá nhân</Label>
          <Textarea value={form.notes || ''} onChange={(e) => update('notes', e.target.value)}
            className="bg-slate-800/50 border-slate-700 min-h-[70px]" placeholder="Ghi chú về thuật toán, cách tiếp cận..." />
        </div>

        {/* Solve full type selector */}
        <div className="space-y-2">
          <Label className="text-slate-300">Solve Full (Lời giải chi tiết)</Label>
          <Tabs value={form.solve_full_type || 'none'} onValueChange={(v) => update('solve_full_type', v === 'none' ? null : v)}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="none" className="data-[state=active]:bg-slate-700">Không</TabsTrigger>
              <TabsTrigger value="internal_snippet" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
                <FileCode className="w-3.5 h-3.5 mr-1" /> Snippet nội bộ
              </TabsTrigger>
              <TabsTrigger value="external_url" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
                <LinkIcon className="w-3.5 h-3.5 mr-1" /> Link ngoài
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {form.solve_full_type === 'internal_snippet' && (
            <Select value={form.solve_full_value || ''} onValueChange={(v) => update('solve_full_value', v)}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700"><SelectValue placeholder="Chọn snippet..." /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 max-h-60">
                {snippets.length === 0 && <SelectItem value="_none" disabled>Chưa có snippet nào</SelectItem>}
                {snippets.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="font-mono-code text-xs">{s.title}</span> <span className="text-slate-500">({s.language})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {form.solve_full_type === 'external_url' && (
            <Input value={form.solve_full_value || ''} onChange={(e) => update('solve_full_value', e.target.value)}
              className="bg-slate-800/50 border-slate-700" placeholder="https://..." />
          )}
        </div>

        {/* Solve trick */}
        <div className="space-y-1.5">
          <Label className="text-slate-300">Solve Trick (Mẹo giải nhanh)</Label>
          <Input value={form.solve_trick || ''} onChange={(e) => update('solve_trick', e.target.value)}
            className="bg-slate-800/50 border-slate-700" placeholder="Mẹo ngắn hoặc link ngoài..." />
        </div>

        {/* KB link */}
        {kbArticles.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-slate-300">Liên kết bài viết Wiki</Label>
            <Select value={form.kb_article_id || '_none'} onValueChange={(v) => update('kb_article_id', v === '_none' ? null : v)}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 max-h-60">
                <SelectItem value="_none">Không liên kết</SelectItem>
                {kbArticles.map((a) => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-slate-800/50 border-slate-700">Hủy</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-orange-500 to-orange-600">
            {saving ? 'Đang lưu...' : (problem ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
