'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PokeballSpinner } from '@/components/dragonite-ui';
import { Mail, Lock, User as UserIcon, Chrome } from 'lucide-react';

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await signInWithEmail(loginEmail, loginPassword);
    if (error) setError(error);
    else { onOpenChange(false); reset(); }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await signUpWithEmail(signupEmail, signupPassword, signupName);
    if (error) setError(error);
    else { onOpenChange(false); reset(); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    await signInWithGoogle();
    setLoading(false);
  };

  const reset = () => {
    setLoginEmail(''); setLoginPassword('');
    setSignupName(''); setSignupEmail(''); setSignupPassword('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <PokeballSpinner size={32} />
          </div>
          <DialogTitle className="text-xl">
            <span className="dragon-gradient-text">Chào mừng đến DRAGONITE.DEV</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Đăng nhập để đồng bộ bài tập, snippet và bài viết của bạn.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="login" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">Đăng nhập</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">Đăng ký</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="pl-9 bg-slate-800/50 border-slate-700 text-slate-100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 bg-slate-800/50 border-slate-700 text-slate-100" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500">
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Họ tên</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input required value={signupName} onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="pl-9 bg-slate-800/50 border-slate-700 text-slate-100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input type="email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="pl-9 bg-slate-800/50 border-slate-700 text-slate-100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input type="password" required minLength={6} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="pl-9 bg-slate-800/50 border-slate-700 text-slate-100" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500">
                {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-slate-900 px-2 text-slate-500">HOẶC</span></div>
        </div>

        <Button onClick={handleGoogle} disabled={loading} variant="outline"
          className="w-full bg-slate-800/50 border-slate-700 text-slate-100 hover:bg-slate-800">
          <Chrome className="w-4 h-4 mr-2" />
          Đăng nhập với Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}
