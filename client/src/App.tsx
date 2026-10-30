import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { CitizenTracker } from './pages/CitizenTracker';
import { CitizenReport } from './pages/CitizenReport';
import { ReportSuccess } from './pages/ReportSuccess';
import { AdminDashboard } from './pages/AdminDashboard';
import { TicketDetail } from './pages/TicketDetail';
import { ClusterIntelligence } from './pages/ClusterIntelligence';
import { Radio, ShieldAlert, Sparkles, Heart } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        
        {/* Top Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<CitizenTracker />} />
            <Route path="/report" element={<CitizenReport />} />
            <Route path="/report/success/:id" element={<ReportSuccess />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/reports/:id" element={<TicketDetail />} />
            <Route path="/admin/clusters" element={<ClusterIntelligence />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global CivicPulse Footer */}
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
              <span>Powered by Gemini 2.5 Flash & pgvector</span>
              <span>·</span>
              <span>Zero Placeholder Production Architecture</span>
            </div>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
};

export default App;
