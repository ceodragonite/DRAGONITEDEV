'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon, FileText, Code2, Crown, ChevronDown } from 'lucide-react';

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  if (!user) return null;

  const initials = (profile?.full_name || user.email || '?')
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition-all">
          <Avatar className="w-8 h-8 border-2 border-orange-500/40">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-orange-500/20 text-orange-400 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-100">
        <DropdownMenuLabel className="text-slate-300">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{profile?.full_name || 'Thành viên'}</span>
            <span className="text-xs text-slate-500">{user.email}</span>
            {profile?.role === 'admin' && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-orange-400">
                <Crown className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem onClick={() => router.push('/snippets/mine')} className="hover:bg-slate-800 cursor-pointer">
          <Code2 className="w-4 h-4 mr-2 text-teal-400" /> Snippet của tôi
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/kb/mine')} className="hover:bg-slate-800 cursor-pointer">
          <FileText className="w-4 h-4 mr-2 text-orange-400" /> Bài viết của tôi
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/profile')} className="hover:bg-slate-800 cursor-pointer">
          <UserIcon className="w-4 h-4 mr-2 text-slate-400" /> Hồ sơ
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-800" />
        <DropdownMenuItem onClick={() => signOut()} className="hover:bg-red-500/10 text-red-400 cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
