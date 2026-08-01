'use client';

import { useState, useEffect } from 'react';
import type { Snippet } from '@/lib/supabase';
import { LANG_LABEL, LANG_COLOR } from '@/lib/supabase';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
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
import { Copy, Check, FileCode, Terminal, BookOpen, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

const LANG_EXT: Record<string, any> = {
  cpp: cpp, python: python, java: java, js: javascript,
};

export function SnippetViewerDialog({ snippet, onClose }: { snippet: Snippet | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => { setCopied(false); setCopiedLink(false); }, [snippet]);

  const handleCopy = () => {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast.success('Đã copy code!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    if (!snippet?.short_id) { toast.error('Snippet này chưa có short link'); return; }
    const url = `${window.location.origin}/s/${snippet.short_id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Đã copy share link: ' + url);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!snippet) return null;

  const ext = LANG_EXT[snippet.language];
  const shareUrl = snippet.short_id ? `/s/${snippet.short_id}` : `/snippets/${snippet.id}`;

  return (
    <Sheet open={!!snippet} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl bg-slate-950 border-slate-800 text-slate-100 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <FileCode className="w-5 h-5 text-teal-400" />
            <span className="text-slate-100">{snippet.title}</span>
          </SheetTitle>
          <SheetDescription asChild>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge className={LANG_COLOR[snippet.language] || 'bg-slate-700 text-slate-300'}>
                {LANG_LABEL[snippet.language] || snippet.language}
              </Badge>
              {snippet.tags.map((t) => (
                <Badge key={t} className="bg-slate-800 text-slate-400 border-slate-700">#{t}</Badge>
              ))}
              {snippet.short_id && (
                <button onClick={handleCopyLink}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors">
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  /s/{snippet.short_id}
                </button>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        {snippet.notes && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/40 border border-slate-700 text-sm text-slate-300 mt-4">
            <BookOpen className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            {snippet.notes}
          </div>
        )}

        <Tabs defaultValue="code" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="code" className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400">
              <FileCode className="w-3.5 h-3.5 mr-1" /> Code
            </TabsTrigger>
            <TabsTrigger value="run" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
              <Terminal className="w-3.5 h-3.5 mr-1" /> Run (Wandbox)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="mt-3 space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-slate-800">
              <button onClick={handleCopy}
                className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-orange-400 hover:border-orange-500/40 transition-all">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {snippet.sample_input && (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-800 text-xs font-semibold text-slate-400">
                      <Terminal className="w-3.5 h-3.5" /> Input mẫu
                    </div>
                    <pre className="p-2 text-xs font-mono-code text-slate-300 overflow-x-auto max-h-32 overflow-y-auto">{snippet.sample_input}</pre>
                  </div>
                )}
                {snippet.sample_output && (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-800 text-xs font-semibold text-slate-400">
                      <Terminal className="w-3.5 h-3.5" /> Output mẫu
                    </div>
                    <pre className="p-2 text-xs font-mono-code text-slate-300 overflow-x-auto max-h-32 overflow-y-auto">{snippet.sample_output}</pre>
                  </div>
                )}
              </div>
            )}

            <a href={`/snippets/${snippet.id}`} className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300">
              <ExternalLink className="w-3.5 h-3.5" /> Mở trang đầy đủ
            </a>
          </TabsContent>

          <TabsContent value="run" className="mt-3">
            <WandboxRunner
              code={snippet.code}
              language={snippet.language}
              defaultStdin={snippet.sample_input}
              compact
            />
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-4">
          <Button onClick={onClose} className="bg-slate-800/50 border border-slate-700 text-slate-200">Đóng</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
