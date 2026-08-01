'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, generateShortId } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { SectionHeader } from '@/components/dragonite-ui';
import { WandboxRunner } from '@/components/wandbox-runner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Save, X, Plus, Code2, ArrowLeft, Terminal } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const LANGUAGES = [
  { value: 'cpp', label: 'C++', ext: cpp },
  { value: 'python', label: 'Python', ext: python },
  { value: 'java', label: 'Java', ext: java },
  { value: 'js', label: 'JavaScript', ext: javascript },
  { value: 'pascal', label: 'Pascal', ext: undefined },
];

export default function NewSnippetPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const langExt = LANGUAGES.find((l) => l.value === language)?.ext;

  const handleSave = async () => {
    if (!user) { toast.error('Vui lòng đăng nhập'); return; }
    if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    if (!code.trim()) { toast.error('Vui lòng nhập code'); return; }

    setSaving(true);
    const { data, error } = await supabase.from('snippets').insert({
      title, language, code, notes, sample_input: sampleInput || null,
      sample_output: sampleOutput || null, is_public: isPublic, tags,
      short_id: generateShortId(),
    }).select('id, short_id').single();

    if (error) {
      if (error.message.includes('short_id') || error.message.includes('duplicate')) {
        const retry = await supabase.from('snippets').insert({
          title, language, code, notes, sample_input: sampleInput || null,
          sample_output: sampleOutput || null, is_public: isPublic, tags,
          short_id: generateShortId(),
        }).select('id, short_id').single();
        if (retry.error) { toast.error('Lỗi: ' + retry.error.message); setSaving(false); return; }
        toast.success('Đã tạo snippet! Short link: /s/' + retry.data.short_id);
        router.push(`/snippets/${retry.data.id}`);
      } else { toast.error('Lỗi: ' + error.message); }
    } else {
      toast.success('Đã tạo snippet! Short link: /s/' + data.short_id);
      router.push(`/snippets/${data.id}`);
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <div>
        <SectionHeader title="Tạo Snippet Mới" icon={<Code2 className="w-7 h-7" />} />
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="text-slate-400">Vui lòng đăng nhập để tạo snippet.</p>
          <Link href="/snippets"><Button className="mt-4 bg-slate-800">Quay lại</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Tạo Snippet Mới"
        subtitle="Lưu giải pháp code với syntax highlighting"
        icon={<Code2 className="w-7 h-7" />}
        action={<Link href="/snippets"><Button variant="outline" className="bg-slate-800/50 border-slate-700"><ArrowLeft className="w-4 h-4 mr-2" /> Quay lại</Button></Link>}
      />

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300">* Tiêu đề</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-800/50 border-slate-700" placeholder="VD: Dijkstra chuẩn C++" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300">* Ngôn ngữ</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label className="text-slate-300">Tags</Label>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="bg-slate-800/50 border-slate-700" placeholder="dijkstra, graph..." />
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

        {/* Code editor */}
        <div className="space-y-1.5">
          <Label className="text-slate-300">* Code</Label>
          <div className="rounded-lg overflow-hidden border border-slate-800">
            <CodeMirror
              value={code}
              onChange={setCode}
              theme={oneDark}
              extensions={langExt ? [langExt()] : []}
              height="400px"
              className="font-mono-code text-sm"
              basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true, indentOnInput: true }}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-slate-300">Ghi chú</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            className="bg-slate-800/50 border-slate-700 min-h-[60px]" placeholder="Giải thích code, độ phức tạp, lưu ý..." />
        </div>

        {/* Sample I/O */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> Input mẫu</Label>
            <Textarea value={sampleInput} onChange={(e) => setSampleInput(e.target.value)}
              className="bg-slate-800/50 border-slate-700 min-h-[80px] font-mono-code text-xs" placeholder="5 6\n1 2 7..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> Output mẫu</Label>
            <Textarea value={sampleOutput} onChange={(e) => setSampleOutput(e.target.value)}
              className="bg-slate-800/50 border-slate-700 min-h-[80px] font-mono-code text-xs" placeholder="0 7 9 20..." />
          </div>
        </div>

        {/* Wandbox runner preview */}
        <div className="space-y-1.5">
          <Label className="text-slate-300">Chạy thử code (Wandbox)</Label>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <WandboxRunner code={code} language={language} defaultStdin={sampleInput} compact />
          </div>
        </div>

        {/* Public toggle */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          <div>
            <p className="text-sm font-medium text-slate-200">{isPublic ? 'Public' : 'Private'}</p>
            <p className="text-xs text-slate-500">{isPublic ? 'Ai có link /s/{shortId} đều thấy được snippet này' : 'Chỉ bạn mới thấy snippet này'}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/snippets"><Button variant="outline" className="bg-slate-800/50 border-slate-700">Hủy</Button></Link>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-orange-500 to-orange-600">
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Đang lưu...' : 'Lưu snippet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
