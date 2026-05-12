"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, register } from '@/services/api';
import Link from 'next/link';
import { ArrowRight, Recycle, Building2, ShoppingBag, Truck, Factory } from 'lucide-react';
import { useUser } from '@/lib/UserContext';

const ROLES = [
  { value: 'producer', label: 'Producer', desc: 'List demolition materials', icon: <Building2 className="h-4 w-4" /> },
  { value: 'consumer', label: 'Consumer', desc: 'Buy recycled materials', icon: <ShoppingBag className="h-4 w-4" /> },
  { value: 'driver', label: 'Driver', desc: 'Deliver materials', icon: <Truck className="h-4 w-4" /> },
  { value: 'recycler', label: 'Recycler', desc: 'Process materials', icon: <Factory className="h-4 w-4" /> },
];

const ROLE_ROUTES: Record<string, string> = {
  producer: '/producer', consumer: '/consumer',
  driver: '/driver', recycler: '/dashboard/recycler',
};

interface LocalUser { email: string; password: string; role: string; }

function getUsers(): LocalUser[] {
  try { return JSON.parse(localStorage.getItem('cwi_users') || '[]'); } catch { return []; }
}
function saveUser(u: LocalUser) {
  const users = getUsers().filter(x => x.email.toLowerCase() !== u.email.toLowerCase());
  users.push(u);
  localStorage.setItem('cwi_users', JSON.stringify(users));
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useUser();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('producer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get('mode') === 'register') setMode('register');
  }, [params]);

  useEffect(() => { setError(''); }, [mode, email, password, role]);

  const doLogin = (userRole: string, userEmail: string) => {
    setUser(userRole, userEmail);
    router.push(ROLE_ROUTES[userRole] ?? '/producer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimEmail = email.trim().toLowerCase();
    const users = getUsers();

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      if (users.find(u => u.email === trimEmail)) {
        setError('An account with this email already exists. Please sign in instead.');
        setLoading(false);
        return;
      }
      saveUser({ email: trimEmail, password, role });
      setUser(role, trimEmail);
      try {
        await register({ email: trimEmail, password });
        const res = await login({ email: trimEmail, password });
        sessionStorage.setItem('cwi_token', res.data.access_token);
        localStorage.setItem('access_token', res.data.access_token);
      } catch { /* offline ok */ }
      router.push(ROLE_ROUTES[role] ?? '/producer');

    } else {
      // LOGIN
      const user = users.find(u => u.email === trimEmail);

      if (!user) {
        // No account found — auto-register them so they can proceed
        // This handles the case where they registered in a different browser/cleared storage
        setError('No account found. Please register first or use "Get Started".');
        setLoading(false);
        return;
      }

      if (user.password !== password) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      if (user.role !== role) {
        const label = ROLES.find(r => r.value === user.role)?.label ?? user.role;
        setError(`This account is registered as "${label}". Please select that role above.`);
        // Auto-select the correct role
        setRole(user.role);
        setLoading(false);
        return;
      }

      try {
        const res = await login({ email: trimEmail, password });
        sessionStorage.setItem('cwi_token', res.data.access_token);
        localStorage.setItem('access_token', res.data.access_token);
      } catch { /* offline ok */ }

      doLogin(user.role, user.email);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen cwi-bg flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(16,185,129,0.06)' }} />

      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
          <Recycle className="h-5 w-5 text-white" />
        </div>
        <span className="font-black text-xl text-white tracking-tight">CWI Platform</span>
      </Link>

      <div className="cwi-auth-card w-full max-w-md rounded-3xl p-8 relative z-10">

        {/* Toggle */}
        <div className="cwi-toggle flex p-1 rounded-xl mb-6">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'cwi-toggle-active' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {m === 'login' ? 'Sign In' : 'Get Started'}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-black text-white mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-zinc-500 text-sm mb-6">
          {mode === 'login' ? 'Sign in to your CWI account.' : 'Join the circular economy network.'}
        </p>

        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm p-3.5 rounded-xl border border-red-500/20 mb-5 flex items-start gap-2">
            <span className="shrink-0 mt-0.5">⚠</span>
            <span>
              {error}
              {error.includes('register first') && (
                <button onClick={() => setMode('register')}
                  className="ml-1 text-emerald-400 font-semibold hover:text-emerald-300 underline underline-offset-2">
                  Register now →
                </button>
              )}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@company.com"
              className="cwi-input w-full rounded-xl px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••" minLength={6}
              className="cwi-input w-full rounded-xl px-4 py-3 text-sm outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2.5">
              {mode === 'login' ? 'Your role' : 'I am a...'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <label key={r.value}
                  className={`cwi-role-option flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${role === r.value ? 'cwi-role-active' : ''}`}>
                  <input type="radio" name="role" value={r.value} checked={role === r.value}
                    onChange={() => setRole(r.value)} className="sr-only" />
                  <span className={`p-1.5 rounded-lg ${role === r.value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-500'}`}>
                    {r.icon}
                  </span>
                  <div>
                    <div className={`text-sm font-semibold ${role === r.value ? 'text-white' : 'text-zinc-400'}`}>{r.label}</div>
                    <div className="text-xs text-zinc-600">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="cwi-btn-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Please wait...
              </span>
            ) : (
              <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600 mt-6">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-emerald-400 font-semibold hover:text-emerald-300 transition">
            {mode === 'login' ? 'Get Started' : 'Sign In'}
          </button>
        </p>
      </div>

      <Link href="/" className="mt-6 text-xs text-zinc-600 hover:text-zinc-400 transition">← Back to home</Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
