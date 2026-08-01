'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, Terminal, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type RunResult = {
  stdout: string;
  stderr: string;
  compilerOutput: string;
  compilerError: string;
  status: string;
  signal: string | null;
  exitCode: number | null;
  url?: string | null;
};

type Props = {
  code: string;
  language: string;
  defaultStdin?: string | null;
  compact?: boolean;
};

export function WandboxRunner({ code, language, defaultStdin, compact }: Props) {
  const [stdin, setStdin] = useState(defaultStdin || '');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    if (!code.trim()) { toast.error('Không có code để chạy'); return; }
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/wandbox-run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ code, stdin, language }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi chạy code');
    } finally {
      setRunning(false);
    }
  }, [code, stdin, language]);

  const isSuccess = result && (result.status === '0' || result.exitCode === 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleRun}
          disabled={running}
          size={compact ? 'sm' : 'default'}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 glow-orange"
        >
          {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          {running ? 'Đang chạy...' : 'Run Code'}
        </Button>
        <span className="text-xs text-slate-500">Wandbox API</span>
      </div>

      {!compact && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" /> STDIN (Input)
          </label>
          <Textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            className="bg-slate-950/60 border-slate-800 min-h-[70px] font-mono-code text-xs"
            placeholder="Nhập input cho chương trình..."
          />
        </div>
      )}

      {compact && (
        <details className="rounded-lg border border-slate-800 bg-slate-950/40">
          <summary className="px-3 py-1.5 cursor-pointer text-xs font-semibold text-slate-400 hover:text-slate-200">
            <Terminal className="w-3.5 h-3.5 inline mr-1" /> STDIN
          </summary>
          <Textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            className="bg-slate-950/60 border-slate-800 min-h-[60px] font-mono-code text-xs rounded-none border-0"
            placeholder="Input..."
          />
        </details>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {isSuccess ? (
              <Badge className="bg-green-500/15 text-green-300 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Thành công
              </Badge>
            ) : (
              <Badge className="bg-red-500/15 text-red-300 border-red-500/30">
                <XCircle className="w-3 h-3 mr-1" /> Lỗi (exit {result.exitCode ?? result.status})
              </Badge>
            )}
            {result.signal && (
              <Badge className="bg-orange-500/15 text-orange-300 border-orange-500/30">
                <Clock className="w-3 h-3 mr-1" /> Signal: {result.signal}
              </Badge>
            )}
          </div>

          {result.stdout && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-slate-800 text-xs font-semibold text-green-400 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" /> STDOUT
              </div>
              <pre className="p-3 text-xs font-mono-code text-slate-200 overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap">{result.stdout}</pre>
            </div>
          )}

          {result.stderr && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-slate-800 text-xs font-semibold text-red-400 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" /> STDERR
              </div>
              <pre className="p-3 text-xs font-mono-code text-red-300 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">{result.stderr}</pre>
            </div>
          )}

          {(result.compilerOutput || result.compilerError) && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden">
              <div className="px-3 py-1.5 border-b border-slate-800 text-xs font-semibold text-yellow-400">
                Compiler Output
              </div>
              <pre className="p-3 text-xs font-mono-code text-yellow-200/80 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                {result.compilerError || result.compilerOutput}
              </pre>
            </div>
          )}

          {!result.stdout && !result.stderr && !result.compilerOutput && !result.compilerError && (
            <p className="text-xs text-slate-500 italic">Chương trình không có output.</p>
          )}
        </div>
      )}
    </div>
  );
}
