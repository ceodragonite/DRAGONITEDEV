'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LANG_LABEL, LANG_COLOR } from '@/lib/supabase';
import type { Snippet } from '@/lib/supabase';
import { LoadingScreen } from '@/components/dragonite-ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { WandboxRunner } from '@/components/wandbox-runner';
import { Copy, Check, FileCode, Terminal, BookOpen, Code2, Calendar, Globe, Lock, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

const LANG_EXT: Record<string, any> = {
  cpp: cpp, python: python, java: java, js: javascript,
};

export default function ShortLinkPage() {
  const { shortId } = useParams();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('snippets')
        .select('*')
        .eq('short_id', shortId)
        .maybeSingle();
      if (data) setSnippet(data as Snippet);
      else setNotFound(true);
      setLoading(false);
    })();
  }, [shortId]);

  const handleCopy = () => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast.success('Đã copy code!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingScreen message="Đang tải snippet..." />;
  if (notFound || !snippet) return (
    <div className="text-center py-16">
      <p className="text-slate-400">Snippet không tồn tại hoặc là private.</p>
      <Link href="/snippets"><Button className="mt-4 bg-slate-800">Xem danh sách</Button></Link>
    </div>
  );

  const ext = LANG_EXT[snippet.language];

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/snippets">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-orange-400 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Danh sách
        </Button>
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Code2 className="w-6 h-6 text-teal-400" />
          <h1 className="text-2xl font-bold text-slate-100">{snippet.title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={LANG_COLOR[snippet.language] || 'bg-slate-700 text-slate-300'}>
            {LANG_LABEL[snippet.language] || snippet.language}
          </Badge>
          <Badge className={snippet.is_public ? 'bg-green-500/15 text-green-300 border-green-500/20' : 'bg-slate-700 text-slate-400'}>
            {snippet.is_public ? <><Globe className="w-3 h-3 mr-1" /> Public</> : <><Lock className="w-3 h-3 mr-1" /> Private</>}
          </Badge>
          {snippet.tags.map((t) => <Badge key={t} className="bg-slate-800 text-slate-400 border-slate-700">#{t}</Badge>)}
          <span className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
            <LinkIcon className="w-3 h-3" /> /s/{snippet.short_id}
          </span>
        </div>
      </div>

      {snippet.notes && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-slate-900/50 border border-slate-800 mb-6">
          <BookOpen className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-300">{snippet.notes}</p>
        </div>
      )}

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 mb-4">
          <TabsTrigger value="code" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
            <FileCode className="w-4 h-4 mr-1" /> Source Code
          </TabsTrigger>
          <TabsTrigger value="run" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
            <Terminal className="w-4 h-4 mr-1" /> Run Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="space-y-4">
          <div className="relative rounded-xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Source Code</span>
              <button onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-orange-400 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
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
