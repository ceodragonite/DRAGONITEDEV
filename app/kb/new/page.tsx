'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { SectionHeader } from '@/components/dragonite-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { Save, X, Plus, BookOpen, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/đ/g, 'd').replace(/ă/g, 'a').replace(/â/g, 'a')
    .replace(/ê/g, 'e').replace(/ô/g, 'o').replace(/ơ/g, 'o').replace(/ư/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function NewArticlePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('# Tiêu đề bài viết\n\n');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleSave = async () => {
    if (!user) { toast.error('Vui lòng đăng nhập'); return; }
    if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    const slug = slugify(title);
    setSaving(true);
    const { data, error } = await supabase.from('knowledge_base').insert({
      title, slug, content, tags, author_id: user.id,
    }).select('slug').single();
    if (error) toast.error('Lỗi: ' + error.message);
    else { toast.success('Đã đăng bài viết!'); router.push(`/kb/${data.slug}`); }
    setSaving(false);
  };

  if (!user) {
    return (
      <div>
        <SectionHeader title="Viết bài mới" icon={<BookOpen className="w-7 h-7" />} />
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="text-slate-400">Vui lòng đăng nhập để viết bài.</p>
          <Link href="/kb"><Button className="mt-4 bg-slate-800">Quay lại</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Viết bài mới"
        subtitle="Hỗ trợ Markdown, công thức LaTeX (KaTeX), và code block"
        icon={<BookOpen className="w-7 h-7" />}
        action={<Link href="/kb"><Button variant="outline" className="bg-slate-800/50 border-slate-700"><ArrowLeft className="w-4 h-4 mr-2" /> Quay lại</Button></Link>}
      />

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label className="text-slate-300">* Tiêu đề</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-800/50 border-slate-700 text-lg" placeholder="VD: Segment Tree - Cây Phân Đoạn" />
          {title && <p className="text-xs text-slate-500">Slug: /kb/{slugify(title)}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300">Tags</Label>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="bg-slate-800/50 border-slate-700" placeholder="segment-tree, dp, dfs..." />
            <Button type="button" onClick={addTag} variant="outline" className="bg-slate-800/50 border-slate-700"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((t) => (
              <Badge key={t} className="bg-orange-500/15 text-orange-300 border-orange-500/20">
                #{t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))} className="ml-1"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-slate-300">* Nội dung (Markdown)</Label>
            <Button type="button" size="sm" variant="ghost" onClick={() => setPreviewMode(!previewMode)}
              className="text-slate-400 hover:text-orange-400">
              <Eye className="w-4 h-4 mr-1" /> {previewMode ? 'Edit' : 'Preview'}
            </Button>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-800">
            <CodeMirror
              value={content}
              onChange={setContent}
              theme={oneDark}
              extensions={[markdown({ base: markdownLanguage })]}
              height="500px"
              className="font-mono-code text-sm"
              basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/kb"><Button variant="outline" className="bg-slate-800/50 border-slate-700">Hủy</Button></Link>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-orange-500 to-orange-600">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Đang lưu...' : 'Đăng bài'}
          </Button>
        </div>
      </div>
    </div>
  );
}
