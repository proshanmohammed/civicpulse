import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Radio,
  ShieldAlert,
  PlusCircle,
  Search,
  Layers,
  Database,
  CheckCircle2,
  Activity,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import { seedData } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin = location.pathname.startsWith('/admin');
  const isAuthority = user?.role === 'authority';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    navigate(`/report/success/${searchId.trim()}`);
    setSearchId('');
    setMobileMenuOpen(false);
  };

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
      window.location.reload();
    } catch (err) {
      console.error('Seeding failed:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setProfileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-emerald-500/20 bg-[#05080f]/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <Link to={isAuthority ? '/admin' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 p-0.5 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#070d18] rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-emerald-400 group-hover:text-amber-300 transition-colors" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-emerald-100 to-amber-300 bg-clip-text text-transparent">
                    MetroShield
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    CYBER COMMAND
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Municipal Hazard &amp; City Defense</span>
              </div>
            </Link>

            {/* Role Switcher Pill */}
            <div className="hidden md:flex items-center p-1 bg-[#090f1a] rounded-xl border border-emerald-500/20 ml-3">
              {!isAuthority && (
                <Link
                  to="/"
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    !isAdmin
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Citizen Portal
                </Link>
              )}
              {isAuthority && (
                <Link
                  to="/admin"
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isAdmin
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-600 text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Authority Command
                </Link>
              )}
            </div>
          </div>

          {/* Quick Track Search (citizens only) */}
          {!isAuthority && (
            <div className="hidden lg:flex items-center flex-1 max-w-xs">
              <form onSubmit={handleSearch} className="w-full relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search-ticket-input"
                  type="text"
                  placeholder="Track Ticket ID..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
              </form>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthority && (
              <Link
                to="/admin/clusters"
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
                  location.pathname === '/admin/clusters'
                    ? 'bg-indigo-950/60 text-indigo-300 border-indigo-600/50'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Hotspots &amp; Clusters
              </Link>
            )}

            {/* Quick Demo Seeder (authority only) */}
            {isAuthority && (
              <button
                id="seed-demo-data-btn"
                onClick={handleSeed}
                disabled={isSeeding}
                title="Resets & populates 40 realistic synthetic civic reports"
                className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-indigo-500/50 hover:text-indigo-300 transition-all"
              >
                {seedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">40 Seeded</span>
                  </>
                ) : (
                  <>
                    <Database className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
                    <span>{isSeeding ? 'Seeding...' : 'Reset 40 Reports'}</span>
                  </>
                )}
              </button>
            )}

            {/* Primary Report CTA (citizen only) */}
            {!isAuthority && (
              <Link
                id="nav-report-issue-btn"
                to="/report"
                className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-1.5 border border-emerald-300/40"
              >
                <PlusCircle className="w-4 h-4 text-black stroke-[2.5]" />
                Report Hazard
              </Link>
            )}

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                id="user-profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-slate-600 transition-all"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isAuthority
                    ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white'
                    : 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white'
                }`}>
                  {user?.avatar || <User className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">{user?.name?.split(' ')[0] || 'User'}</div>
                  <div className={`text-[10px] font-mono ${isAuthority ? 'text-cyan-400' : 'text-indigo-400'}`}>
                    {isAuthority ? 'AUTHORITY' : 'CITIZEN'}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0d1527] border border-slate-700/60 rounded-2xl shadow-xl shadow-black/50 p-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                  </div>
                  <button
                    id="logout-btn"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {!isAuthority && (
              <Link
                to="/report"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Report
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-3">
            {!isAuthority && (
              <form onSubmit={handleSearch} className="w-full relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Track Ticket ID..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono"
                />
              </form>
            )}

            <div className="grid grid-cols-2 gap-2">
              {!isAuthority && (
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-slate-200 text-xs font-medium text-center border border-slate-800"
                >
                  Citizen Feed
                </Link>
              )}
              {isAuthority && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-cyan-400 text-xs font-medium text-center border border-slate-800"
                >
                  Authority Dashboard
                </Link>
              )}
              {isAuthority && (
                <Link
                  to="/admin/clusters"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-indigo-300 text-xs font-medium text-center border border-slate-800"
                >
                  Spatial Clusters
                </Link>
              )}
              {isAuthority && (
                <button
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-slate-300 text-xs font-medium text-center border border-slate-800"
                >
                  {isSeeding ? 'Seeding...' : 'Reset 40 Reports'}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg bg-red-950/30 text-red-400 text-xs font-medium text-center border border-red-900/50 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
