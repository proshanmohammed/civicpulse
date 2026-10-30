import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  Car, 
  Trash2, 
  Lightbulb, 
  Zap, 
  Camera, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  X,
  MapPin,
  Clock,
  ShieldAlert,
  Copy,
  Check,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { z } from 'zod';
import { createReport } from '../lib/api';
import { LocationPicker } from '../components/LocationPicker';
import { ReportCategory, Report } from '../types';
import { useAuth } from '../context/AuthContext';

// Zod schema matching Section 16
const reportValidationSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  category: z.enum(['waterlogging', 'roads', 'waste', 'streetlights', 'electrical']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  image_url: z.string().optional(),
  reporter_contact: z.string().optional(),
  address: z.string().optional()
});

const QUICK_PRESETS = [
  {
    title: 'Water Main Burst',
    category: 'waterlogging' as ReportCategory,
    desc: "Huge water pipe burst flooding the road near St. Mary's School! Water is gushing into the school gate and children cannot cross.",
    address: "450 St. Mary's Avenue, Near Main School Gate",
    lat: 37.7785,
    lng: -122.4215,
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: 'Exposed Live Wire',
    category: 'electrical' as ReportCategory,
    desc: "Heavy live electrical wire snapped from pole and is sparking onto the wet sidewalk just 3 feet from a crowded bus stop! Sparks flying every few minutes.",
    address: "820 5th Avenue, Transit Shelter 12",
    lat: 37.7812,
    lng: -122.4110,
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: 'Dangerous Crater Pothole',
    category: 'roads' as ReportCategory,
    desc: "Deep 12-inch crater pothole in the center lane of the bypass road. Already saw three cars blow their tires and nearly crash into oncoming traffic.",
    address: "1200 Industrial Bypass, Mile Marker 4.2",
    lat: 37.7690,
    lng: -122.4050,
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: 'Sanitation Waste Overflow',
    category: 'waste' as ReportCategory,
    desc: "Massive pile of rotting food waste, cardboard, and broken glass overflowing past the municipal dumpsters. Stench is unbearable, attracting rats and flies.",
    address: "Market Square Plaza, Behind Central Fish Market",
    lat: 37.7850,
    lng: -122.4080,
    image: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: 'Blacked Out Streetlights',
    category: 'streetlights' as ReportCategory,
    desc: "All 12 streetlight poles along Green Park Parkway are off. The entire roadway and jogging path is in total darkness. Women and seniors feel unsafe walking home.",
    address: "Green Park Parkway, between 14th & 19th",
    lat: 37.7715,
    lng: -122.4350,
    image: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80"
  }
];

export const CitizenReport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form State
  const [category, setCategory] = useState<ReportCategory>('waterlogging');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState("450 St. Mary's Avenue, Near Main School Gate");
  const [latitude, setLatitude] = useState(37.7785);
  const [longitude, setLongitude] = useState(-122.4215);
  const [imageUrl, setImageUrl] = useState('');
  const [reporterContact, setReporterContact] = useState(user?.email || '');

  // UI Processing State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Thank You Modal State
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setCategory(preset.category);
    setDescription(preset.desc);
    setAddress(preset.address);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setImageUrl(preset.image);
    setErrorMessage(null);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64 for instant upload
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate
    const payload = {
      description: description.trim(),
      category,
      latitude,
      longitude,
      image_url: imageUrl || undefined,
      reporter_contact: reporterContact.trim() || undefined,
      address: address.trim() || undefined
    };

    const validation = reportValidationSchema.safeParse(payload);
    if (!validation.success) {
      const firstErr = validation.error.issues[0]?.message || 'Please check form fields';
      setErrorMessage(firstErr);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitPhase('Generating 768-d semantic embedding...');
      await new Promise(r => setTimeout(r, 400));

      setSubmitPhase('Checking vector store for duplicate reports...');
      await new Promise(r => setTimeout(r, 400));

      setSubmitPhase('Gemini AI calculating explainable priority & action brief...');
      const response = await createReport(payload);

      setSubmitPhase('Hazard registered! Launching briefing...');
      await new Promise(r => setTimeout(r, 200));

      setSubmittedReport(response.data);
      setShowThankYouModal(true);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions: { key: ReportCategory; label: string; icon: any; color: string; border: string }[] = [
    { key: 'waterlogging', label: 'Waterlogging & Drainage', icon: Droplet, color: 'text-cyan-400 bg-cyan-500/10', border: 'border-cyan-500/30' },
    { key: 'roads', label: 'Roads & Potholes', icon: Car, color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/30' },
    { key: 'waste', label: 'Waste & Sanitation', icon: Trash2, color: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/30' },
    { key: 'streetlights', label: 'Streetlights & Lighting', icon: Lightbulb, color: 'text-purple-400 bg-purple-500/10', border: 'border-purple-500/30' },
    { key: 'electrical', label: 'Electrical Hazards', icon: Zap, color: 'text-rose-400 bg-rose-500/10', border: 'border-rose-500/30' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Rapid Citizen Submission (&lt; 1 Minute)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Report a Civic Grievance
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
          Our automated Gemini AI pipeline instantly analyzes your issue, detects duplicates, calculates priority, and dispatches field actions.
        </p>
      </div>

      {/* Quick Scenario Preset Chips */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick 1-Click Demo Scenarios (Pre-fill Form):</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/50 transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <span>{p.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl space-y-6">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Category Selection Cards */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            1. Select Grievance Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {categoryOptions.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? `bg-indigo-600/20 border-indigo-500 shadow-md ring-2 ring-indigo-500/30 text-white`
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${cat.color} ${cat.border} border shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Description Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Describe the Issue
            </label>
            <span className={`text-[11px] font-mono ${description.length >= 10 ? 'text-indigo-400' : 'text-slate-500'}`}>
              {description.length} chars (min 10)
            </span>
          </div>
          <textarea
            id="report-description-input"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., Huge water pipe burst flooding the road near St. Mary's School! Water is gushing into the school gate..."
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all leading-relaxed"
          />
        </div>

        {/* 3. Interactive Map Pin & Address */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            3. Pin Exact Map Coordinates
          </label>
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onLocationChange={(lat, lng, addressHint) => {
              setLatitude(lat);
              setLongitude(lng);
              if (addressHint) setAddress(addressHint);
            }}
          />
          <div className="mt-2.5">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Landmark or street address..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* 4. Photo Evidence (Upload / Preview) */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            4. Photo Evidence (Optional)
          </label>
          {imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden h-40 border border-slate-700 group">
              <img src={imageUrl} alt="Uploaded grievance" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-indigo-500/70 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40">
                <Camera className="w-6 h-6 text-indigo-400 mb-1" />
                <span className="text-xs text-slate-300 font-medium">Click to upload photo or capture camera</span>
                <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP supported</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* 5. Citizen Reporter Contact */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            5. Contact for Status Updates (Optional)
          </label>
          <input
            id="reporter-contact-input"
            type="text"
            value={reporterContact}
            onChange={(e) => setReporterContact(e.target.value)}
            placeholder="Email or mobile number for live tracking notifications..."
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Submission Button & Live AI Progress Modal */}
        <div className="pt-2">
          <button
            id="submit-report-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 border border-emerald-300/40 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-black" />
                <span>{submitPhase || 'Analyzing hazard with Gemini AI...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Dispatch Hazard to MetroShield Command</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* ── Thank You / Grievance Registered Popup Modal ── */}
      {showThankYouModal && submittedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/20 text-center space-y-6">
            
            {/* Glow Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 p-0.5 mx-auto shadow-xl shadow-emerald-500/30">
              <div className="w-full h-full bg-[#050b14] rounded-[22px] flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>HAZARD LOGGED IN METROSHIELD COMMAND</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Thank You for Reporting!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-emerald-300">{user?.name?.split(' ')[0] || 'Citizen'}</strong>! Your report was triaged by Gemini AI and dispatched to municipal field crews.
              </p>
            </div>

            {/* Ticket Brief Card */}
            <div className="bg-[#070d18] border border-emerald-500/25 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Tracking Ticket ID</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-emerald-300 font-bold text-xs">{submittedReport.id.slice(0, 16)}...</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(submittedReport.id);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                    title="Copy Ticket ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">AI Priority Assessment:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                  submittedReport.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                  submittedReport.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {submittedReport.priority} ({submittedReport.priority_score}/100)
                </span>
              </div>

              {submittedReport.action_brief && (
                <div className="text-[11px] text-slate-300 bg-[#0a1220] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-0.5">Field Directive:</span>
                  {submittedReport.action_brief}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => navigate(`/report/success/${submittedReport.id}`)}
                className="w-full py-3 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Track Live Incident</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-3 rounded-xl font-semibold text-xs bg-[#090f1a] hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all"
              >
                View on Public Feed
              </button>
            </div>

            <button
              onClick={() => {
                setShowThankYouModal(false);
                setDescription('');
                setImageUrl('');
              }}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors block mx-auto"
            >
              Report another hazard
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
