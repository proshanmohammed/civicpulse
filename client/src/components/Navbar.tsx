import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Radio, 
  MapPin, 
  ShieldAlert, 
  PlusCircle, 
  Search, 
  Layers, 
  Database, 
  CheckCircle2, 
  Activity,
  Menu,
  X
} from 'lucide-react';
import { seedData } from '../lib/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchId, setSearchId] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = location.pathname.startsWith('/admin');

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

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-[#0a0f1d]/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#0d1527] rounded-[10px] flex items-center justify-center">
                  <Radio className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                    CivicPulse
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                    AI ENGINE
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Municipal Action Platform</span>
              </div>
            </Link>

            {/* Role Switcher Pill */}
            <div className="hidden md:flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800 ml-3">
              <Link
                to="/"
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  !isAdmin
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Citizen Portal
              </Link>
              <Link
                to="/admin"
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isAdmin
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Authority Command
              </Link>
            </div>
          </div>

          {/* Quick Track Search */}
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

          {/* Navigation Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              to="/admin/clusters"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
                location.pathname === '/admin/clusters'
                  ? 'bg-indigo-950/60 text-indigo-300 border-indigo-600/50'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Hotspots & Clusters
            </Link>

            {/* Quick Demo Seeder */}
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

            {/* Primary Report CTA */}
            <Link
              id="nav-report-issue-btn"
              to="/report"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center gap-1.5 border border-indigo-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              Report Issue
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/report"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Report
            </Link>
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

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-slate-900 text-slate-200 text-xs font-medium text-center border border-slate-800"
              >
                Citizen Feed
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-slate-900 text-cyan-400 text-xs font-medium text-center border border-slate-800"
              >
                Authority Dashboard
              </Link>
              <Link
                to="/admin/clusters"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-slate-900 text-indigo-300 text-xs font-medium text-center border border-slate-800"
              >
                Spatial Clusters
              </Link>
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className="px-3 py-2 rounded-lg bg-slate-900 text-slate-300 text-xs font-medium text-center border border-slate-800"
              >
                {isSeeding ? 'Seeding...' : 'Reset 40 Reports'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
