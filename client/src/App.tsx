import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { CitizenTracker } from './pages/CitizenTracker';
import { CitizenReport } from './pages/CitizenReport';
import { ReportSuccess } from './pages/ReportSuccess';
import { AdminDashboard } from './pages/AdminDashboard';
import { TicketDetail } from './pages/TicketDetail';
import { ClusterIntelligence } from './pages/ClusterIntelligence';
import { Radio, ShieldAlert } from 'lucide-react';

// ─── Protected Route Guards ───────────────────────────────────────────────────
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const RequireAuthority: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user?.role !== 'authority') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// ─── Root Redirect Based on Role ──────────────────────────────────────────────
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'authority') return <Navigate to="/admin" replace />;
  return <CitizenTracker />;
};

// ─── App Shell (with Navbar + Footer) ────────────────────────────────────────
const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#05080f] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Citizen Routes */}
          <Route path="/report" element={<RequireAuth><CitizenReport /></RequireAuth>} />
          <Route path="/report/success/:id" element={<RequireAuth><ReportSuccess /></RequireAuth>} />

          {/* Authority Routes */}
          <Route path="/admin" element={<RequireAuthority><AdminDashboard /></RequireAuthority>} />
          <Route path="/admin/reports/:id" element={<RequireAuthority><TicketDetail /></RequireAuthority>} />
          <Route path="/admin/clusters" element={<RequireAuthority><ClusterIntelligence /></RequireAuthority>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-500/15 bg-[#03060c] py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-black text-white tracking-wide text-sm">MetroShield</span>
            <span className="text-slate-500">| Municipal Hazard Command &amp; City Defense</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="text-emerald-400/80 font-mono font-medium">Powered by Gemini AI &amp; pgvector</span>
            <span>·</span>
            <span className="text-amber-400/80 font-mono">Cyberpunk Emerald Core v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Login Route (no Navbar) */}
          <Route path="/login" element={<LoginPage />} />
          {/* All other routes under AppShell */}
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
