'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender, ColumnDef, SortingState, ColumnFiltersState, Row,
} from '@tanstack/react-table';
import { supabase } from '@/lib/supabase';
import { MOCK_PROBLEMS } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import type { Problem, Snippet, KnowledgeArticle } from '@/lib/supabase';
import { SectionHeader, EmptyState, LoadingScreen } from '@/components/dragonite-ui';
import { ProblemFormDialog } from '@/components/problem-form-dialog';
import { SnippetViewerDialog } from '@/components/snippet-viewer-dialog';
import { ImportCsvDialog } from '@/components/import-csv-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Code2, Lightbulb,
  CheckCircle2, Clock, XCircle, Circle, Edit2, Trash2, Upload, FileCode, Filter, Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const PLATFORM_CONFIG: Record<string, { color: string; bg: string; url: string }> = {
  VNOI:       { color: 'text-red-300',     bg: 'bg-red-500/15 border-red-500/30',     url: 'https://vnoi.info' },
  Codeforces: { color: 'text-blue-300',    bg: 'bg-blue-500/15 border-blue-500/30',   url: 'https://codeforces.com' },
  SPOJ:       { color: 'text-sky-300',     bg: 'bg-sky-500/15 border-sky-500/30',     url: 'https://www.spoj.com' },
  CSES:       { color: 'text-yellow-300',  bg: 'bg-yellow-500/15 border-yellow-500/30', url: 'https://cses.fi' },
  LQDOJ:      { color: 'text-purple-300',  bg: 'bg-purple-500/15 border-purple-500/30', url: 'https://lqdoj.edu.vn' },
  Ntucoder:   { color: 'text-green-300',   bg: 'bg-green-500/15 border-green-500/30', url: 'https://ntucoder.net' },
};

const DIFFICULTY_CONFIG = {
  Easy:   { color: 'text-green-300',   bg: 'bg-green-500/15 border-green-500/30',   glow: 'hover:shadow-green-500/30' },
  Medium: { color: 'text-yellow-300',  bg: 'bg-yellow-500/15 border-yellow-500/30', glow: 'hover:shadow-yellow-500/30' },
  Hard:   { color: 'text-red-300',     bg: 'bg-red-500/15 border-red-500/30',       glow: 'hover:shadow-red-500/30' },
};

const STATUS_CONFIG = {
  AC:   { color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/40',  icon: CheckCircle2, label: 'AC' },
  TLE:  { color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/40', icon: Clock,        label: 'TLE' },
  WA:   { color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/40',       icon: XCircle,      label: 'WA' },
  Todo: { color: 'text-slate-400',  bg: 'bg-slate-700/40 border-slate-600/40',   icon: Circle,       label: 'Chưa làm' },
};

const TAG_COLOR_PALETTE = [
  'bg-orange-500/15 text-orange-300 border-orange-500/20',
  'bg-teal-500/15 text-teal-300 border-teal-500/20',
  'bg-purple-500/15 text-purple-300 border-purple-500/20',
  'bg-blue-500/15 text-blue-300 border-blue-500/20',
  'bg-pink-500/15 text-pink-300 border-pink-500/20',
  'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
];
function tagColor(tag: string) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLOR_PALETTE[h % TAG_COLOR_PALETTE.length];
}

export default function ProblemTrackerPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [kbArticles, setKbArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [viewSnippet, setViewSnippet] = useState<Snippet | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const loadData = useCallback(async () => {
    setLoading(true);
    const [probRes, snipRes, kbRes] = await Promise.all([
      supabase.from('problems').select('*').order('stt', { ascending: true, nullsFirst: false }),
      supabase.from('snippets').select('*').eq('is_public', true),
      supabase.from('knowledge_base').select('id, title, slug, tags'),
    ]);
    if (probRes.data && probRes.data.length > 0) {
      setProblems(probRes.data as Problem[]);
      setUseMock(false);
    } else {
      setProblems(MOCK_PROBLEMS);
      setUseMock(true);
    }
    if (snipRes.data) setSnippets(snipRes.data as Snippet[]);
    if (kbRes.data) setKbArticles(kbRes.data as KnowledgeArticle[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const findSnippet = (id: string) => snippets.find((s) => s.id === id);
  const findKbByTag = (tag: string) => kbArticles.find((a) => a.tags.includes(tag));

  const handleDelete = async (id: string) => {
    if (useMock) {
      setProblems((p) => p.filter((x) => x.id !== id));
      toast.success('Đã xóa bài tập (mock)');
      return;
    }
    const { error } = await supabase.from('problems').delete().eq('id', id);
    if (error) toast.error('Lỗi xóa: ' + error.message);
    else { toast.success('Đã xóa bài tập'); loadData(); }
  };

  const handleStatusChange = async (problem: Problem, status: Problem['status']) => {
    if (useMock) {
      setProblems((p) => p.map((x) => x.id === problem.id ? { ...x, status } : x));
      return;
    }
    const { error } = await supabase.from('problems').update({ status }).eq('id', problem.id);
    if (error) toast.error('Lỗi: ' + error.message);
    else loadData();
  };

  const columns = useMemo<ColumnDef<Problem>[]>(() => [
    {
      accessorKey: 'stt', header: 'TT', size: 50,
      cell: ({ row }) => <span className="text-slate-500 text-xs font-mono">{row.original.stt ?? '-'}</span>,
    },
    {
      accessorKey: 'title', header: 'Problem', size: 200,
      cell: ({ row }) => <span className="font-semibold text-slate-100">{row.original.title}</span>,
    },
    {
      accessorKey: 'problem_code', header: 'ID', size: 100,
      cell: ({ row }) => row.original.problem_code && (
        <span className="font-mono-code text-xs font-semibold text-teal-400 uppercase">{row.original.problem_code}</span>
      ),
    },
    {
      accessorKey: 'platform', header: 'WCB', size: 110,
      cell: ({ row }) => {
        const cfg = PLATFORM_CONFIG[row.original.platform] ?? PLATFORM_CONFIG.VNOI;
        return (
          <a href={cfg.url} target="_blank" rel="noreferrer"
            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border gym-badge transition-all hover:scale-105 ${cfg.bg} ${cfg.color}`}>
            {row.original.platform}
          </a>
        );
      },
    },
    {
      accessorKey: 'difficulty', header: 'Mức độ', size: 100,
      cell: ({ row }) => {
        const cfg = DIFFICULTY_CONFIG[row.original.difficulty as keyof typeof DIFFICULTY_CONFIG] ?? DIFFICULTY_CONFIG.Medium;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border gym-badge transition-all hover:shadow-md ${cfg.bg} ${cfg.color} ${cfg.glow}`}>
            {row.original.difficulty}
          </span>
        );
      },
    },
    {
      accessorKey: 'tags', header: 'Phân loại', size: 200,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.tags || []).map((tag) => {
            const kb = findKbByTag(tag);
            const cls = tagColor(tag);
            return kb ? (
              <Link key={tag} href={`/kb/${kb.slug}`}
                className={`px-1.5 py-0.5 rounded text-xs border hover:scale-105 transition-transform cursor-pointer ${cls}`}>
                #{tag}
              </Link>
            ) : (
              <span key={tag} className={`px-1.5 py-0.5 rounded text-xs border ${cls}`}>#{tag}</span>
            );
          })}
        </div>
      ),
      filterFn: (row, _id, filterValue: string[]) => {
        if (!filterValue || filterValue.length === 0) return true;
        return (row.original.tags || []).some((t) => filterValue.includes(t));
      },
    },
    {
      accessorKey: 'problem_url', header: 'Link', size: 60,
      cell: ({ row }) => row.original.problem_url ? (
        <a href={row.original.problem_url} target="_blank" rel="noreferrer"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all">
          <ExternalLink className="w-4 h-4" />
        </a>
      ) : <span className="text-slate-700">—</span>,
      enableSorting: false, enableColumnFilter: false,
    },
    {
      accessorKey: 'notes', header: 'Ghi chú', size: 150,
      cell: ({ row }) => {
        const notes = row.original.notes;
        if (!notes) return <span className="text-slate-700">—</span>;
        if (notes.length > 30) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-slate-400 cursor-help underline decoration-dotted">{notes.slice(0, 30)}…</span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-slate-900 border-slate-700 text-slate-200">{notes}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return <span className="text-xs text-slate-400">{notes}</span>;
      },
      enableSorting: false,
    },
    {
      accessorKey: 'solve_full_value', header: 'Solve Full', size: 80,
      cell: ({ row }) => {
        const p = row.original;
        if (!p.solve_full_type || !p.solve_full_value) return <span className="text-slate-700">—</span>;
        if (p.solve_full_type === 'internal_snippet') {
          return (
            <button onClick={() => {
              const snip = findSnippet(p.solve_full_value!);
              if (snip) setViewSnippet(snip);
              else toast.error('Snippet không tồn tại hoặc đã bị xóa');
            }}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 transition-all"
              title="Xem snippet nội bộ">
              <FileCode className="w-4 h-4" />
            </button>
          );
        }
        return (
          <a href={p.solve_full_value} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all"
            title="Mở link giải">
            <Code2 className="w-4 h-4" />
          </a>
        );
      },
      enableSorting: false, enableColumnFilter: false,
    },
    {
      accessorKey: 'solve_trick', header: 'Trick', size: 60,
      cell: ({ row }) => {
        const trick = row.original.solve_trick;
        if (!trick) return <span className="text-slate-700">—</span>;
        const isUrl = trick.startsWith('http');
        if (isUrl) {
          return (
            <a href={trick} target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-all"
              title={trick}>
              <ExternalLink className="w-4 h-4" />
            </a>
          );
        }
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-all">
                  <Lightbulb className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-slate-900 border-slate-700 text-slate-200">{trick}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      enableSorting: false, enableColumnFilter: false,
    },
    {
      accessorKey: 'status', header: 'Trạng thái', size: 110,
      cell: ({ row }) => {
        const p = row.original;
        const cfg = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.Todo;
        const Icon = cfg.icon;
        if (isAdmin && !useMock) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all hover:scale-105 status-${p.status.toLowerCase()} ${cfg.bg} ${cfg.color}`}>
                  <Icon className="w-3 h-3" /> {cfg.label}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-slate-800">
                {Object.entries(STATUS_CONFIG).map(([key, c]) => {
                  const I = c.icon;
                  return (
                    <DropdownMenuItem key={key} onClick={() => handleStatusChange(p, key as Problem['status'])}
                      className="hover:bg-slate-800 cursor-pointer">
                      <I className="w-3.5 h-3.5 mr-2" /> {c.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border status-${p.status.toLowerCase()} ${cfg.bg} ${cfg.color}`}>
            <Icon className="w-3 h-3" /> {cfg.label}
          </span>
        );
      },
    },
    ...(isAdmin ? [{
      id: 'actions', header: '', size: 70, enableSorting: false, enableColumnFilter: false,
      cell: ({ row }: { row: Row<Problem> }) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditingProblem(row.original); setFormOpen(true); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.original.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }] : []),
  ], [isAdmin, useMock, snippets, kbArticles]);

  const table = useReactTable({
    data: problems,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  const allTags = useMemo(() => {
    const s = new Set<string>();
    problems.forEach((p) => (p.tags || []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [problems]);

  if (loading && authLoading) return <LoadingScreen message="Đang tải bảng bài tập..." />;

  return (
    <div>
      <SectionHeader
        title="Bảng Bài Tập"
        subtitle="Theo dõi tiến độ luyện thi của câu lạc bộ"
        icon={<Trophy className="w-7 h-7" />}
        action={isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}
              className="bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-800">
              <Upload className="w-4 h-4 mr-2" /> Import CSV
            </Button>
            <Button onClick={() => { setEditingProblem(null); setFormOpen(true); }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 glow-orange">
              <Plus className="w-4 h-4 mr-2" /> Thêm bài tập
            </Button>
          </div>
        )}
      />

      {/* Platform legends */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
        <span className="text-xs text-slate-500 mr-1">Nguồn:</span>
        {Object.entries(PLATFORM_CONFIG).map(([name, cfg]) => (
          <a key={name} href={cfg.url} target="_blank" rel="noreferrer"
            className={`px-2 py-0.5 rounded text-xs font-semibold border gym-badge transition-all hover:scale-105 ${cfg.bg} ${cfg.color}`}>
            [{name}]
          </a>
        ))}
      </div>

      {/* Global search + tag filter */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm bài theo tiêu đề hoặc mã bài..."
            className="pl-9 bg-slate-900/50 border-slate-700 text-slate-100"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-800">
              <Filter className="w-4 h-4 mr-2" /> Lọc tag
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800 max-h-72 overflow-y-auto">
            <DropdownMenuLabel className="text-slate-300">Thuật toán</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            {allTags.map((tag) => {
              const active = (columnFilters.find((f) => f.id === 'tags')?.value as string[] | undefined)?.includes(tag);
              return (
                <DropdownMenuItem key={tag} onClick={() => {
                  const existing = columnFilters.find((f) => f.id === 'tags');
                  const current = (existing?.value as string[]) || [];
                  const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
                  setColumnFilters((prev) => {
                    const others = prev.filter((f) => f.id !== 'tags');
                    return next.length > 0 ? [...others, { id: 'tags', value: next }] : others;
                  });
                }} className="hover:bg-slate-800 cursor-pointer">
                  <span className={`w-2 h-2 rounded-full mr-2 ${active ? 'bg-orange-500' : 'bg-slate-600'}`} />
                  #{tag}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-slate-800 hover:bg-slate-800/30">
                  {hg.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead key={header.id} className="text-slate-400 font-semibold text-xs uppercase tracking-wider"
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                        {header.isPlaceholder ? null : (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className={`inline-flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer hover:text-slate-200' : ''}`}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              sorted === 'asc' ? <ArrowUp className="w-3 h-3 text-orange-400" /> :
                              sorted === 'desc' ? <ArrowDown className="w-3 h-3 text-orange-400" /> :
                              <ArrowUpDown className="w-3 h-3 opacity-40" />
                            )}
                          </button>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-slate-800/50 problem-row hover:bg-slate-800/20">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3" style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-12">
                    <EmptyState
                      icon={<Trophy className="w-10 h-10" />}
                      title="Chưa có bài tập nào"
                      description="Thêm bài tập đầu tiên hoặc import từ file CSV."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <span className="text-xs text-slate-500">
              Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
                className="bg-slate-800/50 border-slate-700 text-slate-200">Trước</Button>
              <Button size="sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
                className="bg-slate-800/50 border-slate-700 text-slate-200">Sau</Button>
            </div>
          </div>
        )}
      </div>

      <ProblemFormDialog
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditingProblem(null); }}
        problem={editingProblem}
        snippets={snippets}
        kbArticles={kbArticles}
        onSaved={loadData}
        useMock={useMock}
      />
      <SnippetViewerDialog snippet={viewSnippet} onClose={() => setViewSnippet(null)} />
      <ImportCsvDialog open={importOpen} onOpenChange={setImportOpen} onImported={loadData} />
    </div>
  );
}
