'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'member';
  created_at: string;
};

export type Problem = {
  id: string;
  stt: number | null;
  title: string;
  problem_code: string | null;
  platform: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  problem_url: string | null;
  notes: string | null;
  solve_full_type: 'internal_snippet' | 'external_url' | null;
  solve_full_value: string | null;
  solve_trick: string | null;
  status: 'AC' | 'TLE' | 'WA' | 'Todo';
  kb_article_id: string | null;
  created_at: string;
};

export type Snippet = {
  id: string;
  short_id: string | null;
  user_id: string;
  title: string;
  language: string;
  code: string;
  notes: string | null;
  sample_input: string | null;
  sample_output: string | null;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export const LANG_LABEL: Record<string, string> = {
  cpp: 'C++', python: 'Python', java: 'Java', js: 'JavaScript', pascal: 'Pascal',
};

export const LANG_COLOR: Record<string, string> = {
  cpp: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  python: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  java: 'bg-red-500/15 text-red-300 border-red-500/20',
  js: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
  pascal: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
};

export type KnowledgeArticle = {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};
