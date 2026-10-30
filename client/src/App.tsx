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
import { Radio } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
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
      <footer className="border-t border-slate-800/80 bg-slate-950/70 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Radio className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">CivicPulse</span>
            <span className="text-slate-500">| Autonomous Municipal Intelligence Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Powered by Gemini 2.5 Flash &amp; pgvector</span>
            <span>·</span>
            <span>Zero Placeholder Production Architecture</span>
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
