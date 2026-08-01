'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { supabase } from '@/lib/supabase';
import { MOCK_KB_ARTICLES } from '@/lib/mock-data';
import type { KnowledgeArticle, Problem } from '@/lib/supabase';
import { LoadingScreen, EmptyState } from '@/components/dragonite-ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Calendar, ExternalLink, Trophy, Copy, Check, FileCode } from 'lucide-react';
import 'katex/dist/katex.min.css';

const TAG_COLOR_PALETTE = [
  'bg-orange-500/15 text-orange-300 border-orange-500/20',
  'bg-teal-500/15 text-teal-300 border-teal-500/20',
  'bg-purple-500/15 text-purple-300 border-purple-500/20',
  'bg-blue-500/15 text-blue-300 border-blue-500/20',
];
function tagColor(tag: string) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLOR_PALETTE[h % TAG_COLOR_PALETTE.length];
}

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  AC: { color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/30' },
  TLE: { color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  WA: { color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
  Todo: { color: 'text-slate-400', bg: 'bg-slate-700/40 border-slate-600/40' },
};

function CodeBlockCopy({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const text = (children as any)?.props?.children ?? '';
    navigator.clipboard.writeText(Array.isArray(text) ? text.join('') : String(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-orange-400 transition-all opacity-0 group-hover:opacity-100">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function KBArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [relatedProblems, setRelatedProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('knowledge_base').select('*').eq('slug', slug).maybeSingle();
    if (data) {
      setArticle(data as KnowledgeArticle);
      const { data: probs } = await supabase.from('problems').select('*').eq('kb_article_id', data.id);
      setRelatedProblems((probs || []) as Problem[]);
    } else {
      const mock = MOCK_KB_ARTICLES.find((a) => a.slug === slug);
      setArticle(mock || null);
      if (mock) {
        // Mock related problems share a tag
        setRelatedProblems([]);
      }
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingScreen message="Đang tải bài viết..." />;
  if (!article) return (
    <div>
      <EmptyState icon={<BookOpen className="w-10 h-10" />} title="Bài viết không tồn tại" />
      <div className="text-center"><Link href="/kb"><Button className="bg-slate-800">Quay lại thư viện</Button></Link></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/kb">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-orange-400 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Thư viện
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-3">{article.title}</h1>
        <div className="flex items-center gap-3 flex-wrap mb-3">
          {article.tags.map((t) => <Badge key={t} className={tagColor(t)}>#{t}</Badge>)}
          <span className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
            <Calendar className="w-3 h-3" /> {new Date(article.created_at).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 md:p-8 prose prose-invert prose-dark max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
          components={{
            pre: ({ children, ...props }) => (
              <div className="relative group">
                <CodeBlockCopy>{children}</CodeBlockCopy>
                <pre {...props} className="bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-x-auto text-sm font-mono-code">{children}</pre>
              </div>
            ),
            code: ({ inline, className, children, ...props }: any) =>
              inline ? <code className="text-orange-400 bg-slate-800 px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>
              : <code className={className} {...props}>{children}</code>,
            a: ({ children, href, ...props }) => (
              <a href={href} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline" {...props}>{children}</a>
            ),
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto my-4"><table className="w-full border-collapse border border-slate-800" {...props}>{children}</table></div>
            ),
            th: ({ children, ...props }) => <th className="border border-slate-800 bg-slate-800/50 px-3 py-2 text-left text-orange-400 font-semibold" {...props}>{children}</th>,
            td: ({ children, ...props }) => <td className="border border-slate-800 px-3 py-2 text-slate-300" {...props}>{children}</td>,
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>

      {/* Related problems */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange-400" /> Bài tập thực hành liên quan
        </h2>
        {relatedProblems.length === 0 ? (
          <p className="text-sm text-slate-500 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
            Chưa có bài tập nào được gắn với bài viết này.
          </p>
        ) : (
          <div className="space-y-2">
            {relatedProblems.map((p) => {
              const st = STATUS_CONFIG[p.status] || STATUS_CONFIG.Todo;
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800 card-hover">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-code text-xs text-slate-500">#{p.stt ?? '-'}</span>
                    <span className="font-semibold text-slate-200 truncate">{p.title}</span>
                    {p.problem_code && <span className="font-mono-code text-xs text-teal-400 uppercase">{p.problem_code}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`text-xs ${st.bg} ${st.color}`}>{p.status}</Badge>
                    {p.problem_url && (
                      <a href={p.problem_url} target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-500/10">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
