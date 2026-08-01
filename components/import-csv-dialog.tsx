'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImported: () => void;
};

const PLATFORM_MAP: Record<string, string> = {
  vnoi: 'VNOI', codeforces: 'Codeforces', cf: 'Codeforces', spoj: 'SPOJ',
  cses: 'CSES', lqdoj: 'LQDOJ', ntucoder: 'Ntucoder',
};

export function ImportCsvDialog({ open, onOpenChange, onImported }: Props) {
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        if (rows.length === 0) { setError('File CSV trống'); return; }
        const required = ['title'];
        if (!required.every((r) => r in rows[0])) {
          setError(`CSV cần có cột: ${required.join(', ')}. Các cột tùy chọn: stt, problem_code, platform, difficulty, tags, problem_url, notes, status`);
          setPreview([]);
          return;
        }
        const normalized = rows.map((r, i) => ({
          stt: r.stt ? Number(r.stt) : i + 1,
          title: String(r.title || '').trim(),
          problem_code: r.problem_code || null,
          platform: PLATFORM_MAP[String(r.platform || '').toLowerCase()] || r.platform || 'VNOI',
          difficulty: ['Easy', 'Medium', 'Hard'].includes(r.difficulty) ? r.difficulty : 'Medium',
          tags: r.tags ? String(r.tags).split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [],
          problem_url: r.problem_url || null,
          notes: r.notes || null,
          status: ['AC', 'TLE', 'WA', 'Todo'].includes(r.status) ? r.status : 'Todo',
        }));
        setPreview(normalized);
      },
      error: (err) => setError('Lỗi parse CSV: ' + err.message),
    });
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    const { error } = await supabase.from('problems').insert(preview);
    if (error) {
      toast.error('Lỗi import: ' + error.message);
    } else {
      toast.success(`Đã import ${preview.length} bài tập`);
      setPreview([]); onImported(); onOpenChange(false);
      if (fileRef.current) fileRef.current.value = '';
    }
    setImporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setPreview([]); setError(null); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Upload className="w-5 h-5 text-orange-400" />
            <span className="dragon-gradient-text">Import bài tập từ CSV</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload file CSV với cột: title, problem_code, platform, difficulty, tags (cách nhau bởi dấu phẩy), problem_url, notes, status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
          >
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-300 text-sm">Click để chọn file .csv</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <FileText className="w-4 h-4 text-teal-400" />
                Sẽ import <span className="text-orange-400 font-semibold">{preview.length}</span> bài tập:
              </div>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/50">
                {preview.slice(0, 10).map((p, i) => (
                  <div key={i} className="px-3 py-1.5 text-xs border-b border-slate-800/50 last:border-0">
                    <span className="text-slate-500">#{p.stt}</span> <span className="text-slate-200">{p.title}</span>
                    <span className="text-slate-500 ml-2">[{p.platform}] {p.difficulty}</span>
                  </div>
                ))}
                {preview.length > 10 && <div className="px-3 py-1.5 text-xs text-slate-500">...và {preview.length - 10} bài khác</div>}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-slate-800/50 border-slate-700">Hủy</Button>
          <Button onClick={handleImport} disabled={importing || preview.length === 0}
            className="bg-gradient-to-r from-orange-500 to-orange-600">
            {importing ? 'Đang import...' : `Import ${preview.length} bài`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
