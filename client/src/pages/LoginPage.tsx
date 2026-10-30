import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  Users,
  ShieldAlert,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Demo Credentials ─────────────────────────────────────────────────────────
const DEMO_ACCOUNTS = {
  citizen: { email: 'citizen@civicpulse.city', password: 'citizen123', name: 'Roshan Kumar' },
  authority: { email: 'admin@civicpulse.gov', password: 'admin123', name: 'Commissioner Dev' },
};

type Role = 'citizen' | 'authority';

// ─── Animated Particles ───────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.8,
  dur: Math.random() * 12 + 8,
  delay: Math.random() * 8,
  opacity: Math.random() * 0.35 + 0.05,
}));

// ─── Stats Ticker ────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Issues Resolved', value: '14,823' },
  { label: 'Active Tickets', value: '2,341' },
  { label: 'Avg Response Time', value: '4.2h' },
  { label: 'Cities Served', value: '38' },
];

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'authority' ? '/admin' : '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [selectedRole, setSelectedRole] = useState<Role>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statIdx, setStatIdx] = useState(0);

  // Rotate stats ticker
  useEffect(() => {
    const t = setInterval(() => setStatIdx((i) => (i + 1) % STATS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleDemoLogin = () => {
    const demo = DEMO_ACCOUNTS[selectedRole];
    setName(demo.name);
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Full name is required.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // Simulate auth call

    // Demo credential check (in production replace with real API call)
    const demo = DEMO_ACCOUNTS[selectedRole];
    if (email !== demo.email || password !== demo.password) {
      setIsLoading(false);
      setError('Invalid credentials. Use the demo login button to auto-fill.');
      return;
    }

    login(selectedRole, name, email);
    navigate(selectedRole === 'authority' ? '/admin' : '/', { replace: true });
  };

  const isCitizen = selectedRole === 'citizen';

  return (
    <div className="min-h-screen bg-[#060c1a] text-slate-100 flex overflow-hidden relative">

      {/* ── Animated background particles ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: isCitizen
                ? `rgba(99, 102, 241, ${p.opacity})`
                : `rgba(6, 182, 212, ${p.opacity})`,
              animation: `float-particle ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
              transition: 'background 0.6s ease',
            }}
          />
        ))}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute rounded-full blur-3xl pointer-events-none transition-all duration-700"
          style={{
            width: '60vw',
            height: '60vw',
            top: '-20vw',
            right: '-10vw',
            background: isCitizen
              ? 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl pointer-events-none transition-all duration-700"
          style={{
            width: '50vw',
            height: '50vw',
            bottom: '-15vw',
            left: '-10vw',
            background: isCitizen
              ? 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Left Hero Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] xl:w-[42%] relative p-12 border-r border-slate-800/60">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/30">
              <div className="w-full h-full bg-[#0d1527] rounded-[14px] flex items-center justify-center">
                <Radio className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                CivicPulse
              </div>
              <div className="text-[11px] text-slate-400 font-mono">AI ENGINE v2.0</div>
            </div>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl xl:text-5xl font-black leading-tight text-white mb-6">
            Transform{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              civic grievances
            </span>{' '}
            into instant action
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-md mb-12">
            AI-powered triage, semantic deduplication, spatial hotspot mapping, and real-time
            resolution tracking — all in one unified municipal intelligence platform.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 mb-12">
            {[
              { icon: Zap, label: 'Gemini 2.5 Flash AI' },
              { icon: Globe, label: 'Live Spatial Clusters' },
              { icon: Sparkles, label: 'Semantic Deduplication' },
              { icon: CheckCircle, label: 'Real-time Tracking' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 font-medium"
              >
                <Icon className="w-3.5 h-3.5 text-indigo-400" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Live Stats Ticker */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-700/50">
          <div className="text-xs text-slate-500 font-mono mb-3 uppercase tracking-wider">
            Live Platform Metrics
          </div>
          <div className="flex items-end gap-6">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="transition-all duration-500"
                style={{ opacity: i === statIdx ? 1 : 0.4 }}
              >
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-[11px] text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Login Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5">
              <div className="w-full h-full bg-[#0d1527] rounded-[10px] flex items-center justify-center">
                <Radio className="w-4.5 h-4.5 text-indigo-400" />
              </div>
            </div>
            <span className="font-extrabold text-lg text-white">CivicPulse</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm">Sign in to your CivicPulse account</p>
          </div>

          {/* ── Role Selector ── */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {/* Citizen Card */}
            <button
              id="role-citizen-btn"
              type="button"
              onClick={() => { setSelectedRole('citizen'); setError(''); }}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
                isCitizen
                  ? 'border-indigo-500 bg-indigo-950/60 shadow-lg shadow-indigo-500/20'
                  : 'border-slate-700/60 bg-slate-900/40 hover:border-slate-600'
              }`}
            >
              {isCitizen && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-violet-600/5 pointer-events-none" />
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isCitizen
                  ? 'bg-indigo-600 shadow-lg shadow-indigo-600/40'
                  : 'bg-slate-800 group-hover:bg-slate-700'
              }`}>
                <Users className={`w-6 h-6 ${isCitizen ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <div className="text-center">
                <div className={`text-sm font-bold ${isCitizen ? 'text-indigo-200' : 'text-slate-300'}`}>
                  Citizen
                </div>
                <div className="text-[11px] text-slate-500">Report issues</div>
              </div>
              {isCitizen && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-4 h-4 text-indigo-400" />
                </div>
              )}
            </button>

            {/* Authority Card */}
            <button
              id="role-authority-btn"
              type="button"
              onClick={() => { setSelectedRole('authority'); setError(''); }}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${
                !isCitizen
                  ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-500/15'
                  : 'border-slate-700/60 bg-slate-900/40 hover:border-slate-600'
              }`}
            >
              {!isCitizen && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/8 to-blue-600/5 pointer-events-none" />
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                !isCitizen
                  ? 'bg-gradient-to-br from-cyan-600 to-blue-600 shadow-lg shadow-cyan-600/40'
                  : 'bg-slate-800 group-hover:bg-slate-700'
              }`}>
                <ShieldAlert className={`w-6 h-6 ${!isCitizen ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <div className="text-center">
                <div className={`text-sm font-bold ${!isCitizen ? 'text-cyan-200' : 'text-slate-300'}`}>
                  Authorizer
                </div>
                <div className="text-[11px] text-slate-500">Manage & resolve</div>
              </div>
              {!isCitizen && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                </div>
              )}
            </button>
          </div>

          {/* ── Login Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="relative">
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-0.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-name-input"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isCitizen ? 'Roshan Kumar' : 'Commissioner Dev'}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.borderColor = isCitizen ? '#6366f1' : '#06b6d4';
                    e.target.style.boxShadow = isCitizen
                      ? '0 0 0 3px rgba(99,102,241,0.15)'
                      : '0 0 0 3px rgba(6,182,212,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = '';
                  }}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-0.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isCitizen ? 'citizen@civicpulse.city' : 'admin@civicpulse.gov'}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.borderColor = isCitizen ? '#6366f1' : '#06b6d4';
                    e.target.style.boxShadow = isCitizen
                      ? '0 0 0 3px rgba(99,102,241,0.15)'
                      : '0 0 0 3px rgba(6,182,212,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = '';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-0.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-11 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                  onFocus={(e) => {
                    e.target.style.borderColor = isCitizen ? '#6366f1' : '#06b6d4';
                    e.target.style.boxShadow = isCitizen
                      ? '0 0 0 3px rgba(99,102,241,0.15)'
                      : '0 0 0 3px rgba(6,182,212,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-300 bg-red-950/40 border border-red-800/50 rounded-xl px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg mt-2 ${
                isCitizen
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/30 hover:shadow-indigo-600/50 disabled:from-indigo-800 disabled:to-violet-800'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/25 hover:shadow-cyan-600/40 disabled:from-cyan-800 disabled:to-blue-800'
              } disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  {isCitizen ? 'Enter Citizen Portal' : 'Enter Authority Command'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Demo Login Helper */}
            <button
              id="login-demo-btn"
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-700/60 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/70 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Use Demo {isCitizen ? 'Citizen' : 'Authorizer'} Credentials
            </button>
          </form>

          {/* Hint */}
          <p className="text-center text-[11px] text-slate-600 mt-6">
            Demo platform · No real authentication · All data is synthetic
          </p>
        </div>
      </div>

      {/* Float particle animation */}
      <style>{`
        @keyframes float-particle {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random() * 40 + 10)}px, ${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random() * 40 + 10)}px) scale(1.3); }
          100% { transform: translate(${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random() * 30 + 5)}px, ${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random() * 30 + 5)}px) scale(0.8); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
