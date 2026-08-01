'use client';

import { useAuth } from '@/lib/auth-context';
import { SectionHeader } from '@/components/dragonite-ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Mail, Calendar, Code2, FileText, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  if (!user) return (
    <div className="text-center py-16">
      <p className="text-slate-400">Vui lòng đăng nhập.</p>
    </div>
  );

  const initials = (profile?.full_name || user.email || '?')
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto">
      <SectionHeader title="Hồ sơ" icon={<Crown className="w-7 h-7" />} />

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-20 h-20 border-2 border-orange-500/40">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-orange-500/20 text-orange-400 text-xl font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{profile?.full_name || 'Thành viên'}</h2>
            <p className="text-sm text-slate-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</p>
            {profile?.role === 'admin' && (
              <Badge className="mt-1 bg-orange-500/15 text-orange-300 border-orange-500/20">
                <Crown className="w-3 h-3 mr-1" /> Admin
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Link href="/snippets" className="rounded-lg border border-slate-800 bg-slate-800/30 p-4 text-center card-hover hover:border-teal-500/30">
            <Code2 className="w-6 h-6 text-teal-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Snippets</p>
          </Link>
          <Link href="/kb" className="rounded-lg border border-slate-800 bg-slate-800/30 p-4 text-center card-hover hover:border-orange-500/30">
            <FileText className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Bài viết</p>
          </Link>
          <Link href="/" className="rounded-lg border border-slate-800 bg-slate-800/30 p-4 text-center card-hover hover:border-yellow-500/30">
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Bài tập</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
