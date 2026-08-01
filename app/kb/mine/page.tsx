'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MyKBRedirect() {
  const router = useRouter();
  useEffect(() => { router.push('/kb'); }, [router]);
  return <div className="text-center text-slate-400 py-16">Đang chuyển hướng...</div>;
}
