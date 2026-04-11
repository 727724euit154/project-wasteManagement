"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register, login } from '@/services/api';
import { useUser } from '@/lib/UserContext';
import Link from 'next/link';

const ROLES = [
  { value: 'producer', label: 'Producer / Contractor', desc: 'List demolition materials for sale' },
  { value: 'consumer', label: 'Consumer / Buyer', desc: 'Purchase recycled construction materials' },
  { value: 'driver', label: 'Driver / Logistics', desc: 'Pick up and deliver materials' },
  { value: 'recycler', label: 'Recycling Center', desc: 'Process and recycle materials' },
];

const ROLE_ROUTES: Record<string, string> = {
  producer: '/producer',
  consumer: '/consumer',
  driver: '/driver',
  recycler: '/dashboard/recycler',
};

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('producer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUser(role, email);
    try {
      await register({ email, password });
      const res = await login({ email, password });
      localStorage.setItem('access_token', res.data.access_token);
    } catch {
      // Allow offline registration
    } finally {
      router.push(ROLE_ROUTES[role] ?? '/dashboard');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <span className="text-2xl font-black text-emerald-800">CWI Platform</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1">Join the circular economy network</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="block w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="you@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="block w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Strong password" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">I am a...</label>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map(r => (
                <label key={r.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${role === r.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} className="mt-1 accent-emerald-600" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{r.label}</div>
                    <div className="text-xs text-gray-500">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white rounded-lg py-2.5 font-medium hover:bg-emerald-700 transition disabled:opacity-60 mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
