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
  ShieldAlert
} from 'lucide-react';
import { z } from 'zod';
import { createReport } from '../lib/api';
import { LocationPicker } from '../components/LocationPicker';
import { ReportCategory } from '../types';

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

  // Form State
  const [category, setCategory] = useState<ReportCategory>('waterlogging');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState("450 St. Mary's Avenue, Near Main School Gate");
  const [latitude, setLatitude] = useState(37.7785);
  const [longitude, setLongitude] = useState(-122.4215);
  const [imageUrl, setImageUrl] = useState('');
  const [reporterContact, setReporterContact] = useState('');

  // UI Processing State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      setSubmitPhase('Ticket registered! Redirecting...');
      await new Promise(r => setTimeout(r, 300));

      navigate(`/report/success/${response.data.id}`);
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
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 border border-indigo-400/30 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>{submitPhase || 'Processing grievance with Gemini AI...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Grievance to CivicPulse</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
