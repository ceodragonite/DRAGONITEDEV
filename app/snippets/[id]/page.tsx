'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { MOCK_SNIPPETS } from '@/lib/mock-data';
import type { Snippet } from '@/lib/supabase';
import { LoadingScreen } from '@/components/dragonite-ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Copy, Check, ArrowLeft, GitFork, Play, Terminal, BookOpen, Code2, Calendar, Lock, Globe, Link as LinkIcon, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { WandboxRunner } from '@/components/wandbox-runner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LANG_EXT: Record<string, any> = {
  cpp: cpp, python: python, java: java, js: javascript,
};
const LANG_LABEL: Record<string, string> = {
  cpp: 'C++', python: 'Python', java: 'Java', js: 'JavaScript', pascal: 'Pascal',
};

export default function SnippetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [forking, setForking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('snippets').select('*').eq('id', id).maybeSingle();
    if (data) setSnippet(data as Snippet);
    else {
      const mock = MOCK_SNIPPETS.find((s) => s.id === id);
      setSnippet(mock || null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleCopy = () => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast.success('Đã copy code!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFork = async () => {
    if (!snippet || !user) { toast.error('Vui lòng đăng nhập để fork'); return; }
    setForking(true);
    const { data, error } = await supabase.from('snippets').insert({
      title: snippet.title + ' (Fork)',
      language: snippet.language,
      code: snippet.code,
      notes: snippet.notes,
      sample_input: snippet.sample_input,
      sample_output: snippet.sample_output,
      is_public: false,
      tags: snippet.tags,
    }).select('id, short_id').single();
    if (error) toast.error('Lỗi fork: ' + error.message);
    else { toast.success('Đã fork snippet! Short link: /s/' + data.short_id); router.push(`/snippets/${data.id}`); }
    setForking(false);
  };

  const handleCopyLink = () => {
    if (!snippet?.short_id) { toast.error('Snippet chưa có short link'); return; }
    const url = `${window.location.origin}/s/${snippet.short_id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Đã copy link: ' + url);
    setTimeout(() => setCopiedLink(false), 2000);
  };
  if (!snippet) return (
    <div className="text-center py-16">
      <p className="text-slate-400">Snippet không tồn tại hoặc đã bị xóa.</p>
      <Link href="/snippets"><Button className="mt-4 bg-slate-800">Quay lại danh sách</Button></Link>
    </div>
  );

  const ext = LANG_EXT[snippet.language];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/snippets">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-orange-400">
              <ArrowLeft className="w-4 h-4 mr-1" /> Danh sách
            </Button>
          </Link>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleCopy} variant="outline" className="bg-slate-800/50 border-slate-700">
            {copied ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
            Copy Code
          </Button>
          {snippet.short_id && (
            <Button onClick={handleCopyLink} variant="outline" className="bg-slate-800/50 border-slate-700">
              {copiedLink ? <Check className="w-4 h-4 mr-2 text-green-400" /> : <LinkIcon className="w-4 h-4 mr-2" />}
              Copy Link
            </Button>
          )}
          {user && (
            <Button onClick={handleFork} disabled={forking} variant="outline" className="bg-slate-800/50 border-slate-700">
              <GitFork className="w-4 h-4 mr-2" /> Fork
            </Button>
          )}
          {snippet.short_id && (
            <Link href={`/s/${snippet.short_id}`}>
              <Button variant="outline" className="bg-slate-800/50 border-slate-700">
                <Eye className="w-4 h-4 mr-2" /> Short Link
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Code2 className="w-6 h-6 text-teal-400" />
          <h1 className="text-2xl font-bold text-slate-100">{snippet.title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-teal-500/15 text-teal-300 border-teal-500/20">{LANG_LABEL[snippet.language] || snippet.language}</Badge>
          <Badge className={snippet.is_public ? 'bg-green-500/15 text-green-300 border-green-500/20' : 'bg-slate-700 text-slate-400'}>
            {snippet.is_public ? <><Globe className="w-3 h-3 mr-1" /> Public</> : <><Lock className="w-3 h-3 mr-1" /> Private</>}
          </Badge>
          {snippet.tags.map((t) => <Badge key={t} className="bg-slate-800 text-slate-400 border-slate-700">#{t}</Badge>)}
          <span className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
            <Calendar className="w-3 h-3" /> {new Date(snippet.created_at).toLocaleDateString('vi-VN')}
            {snippet.short_id && <span className="ml-2 text-teal-400 font-mono-code">/s/{snippet.short_id}</span>}
          </span>
        </div>
      </div>

      {snippet.notes && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-slate-900/50 border border-slate-800 mb-6">
          <BookOpen className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-300">{snippet.notes}</p>
        </div>
      )}

      <Tabs defaultValue="code" className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 mb-4">
          <TabsTrigger value="code" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
            <Code2 className="w-4 h-4 mr-1" /> Source Code
          </TabsTrigger>
          <TabsTrigger value="run" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            <Play className="w-4 h-4 mr-1" /> Run Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Source Code</span>
            <span className="text-xs text-slate-500">{snippet.code.split('\n').length} dòng</span>
          </div>
          <CodeMirror
            value={snippet.code}
            theme={oneDark}
            extensions={ext ? [ext()] : []}
            editable={false}
            height="auto"
            className="font-mono-code text-sm"
            basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: false }}
          />
        </div>

        {(snippet.sample_input || snippet.sample_output) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {snippet.sample_input && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                  <Terminal className="w-3.5 h-3.5" /> Input mẫu
                </div>
                <pre className="p-3 text-xs font-mono-code text-slate-300 overflow-x-auto">{snippet.sample_input}</pre>
              </div>
            )}
            {snippet.sample_output && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                  <Terminal className="w-3.5 h-3.5" /> Output mẫu
                </div>
                <pre className="p-3 text-xs font-mono-code text-slate-300 overflow-x-auto">{snippet.sample_output}</pre>
              </div>
            )}
          </div>
        )}
        </TabsContent>

        <TabsContent value="run">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <WandboxRunner code={snippet.code} language={snippet.language} defaultStdin={snippet.sample_input} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
