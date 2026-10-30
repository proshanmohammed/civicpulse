# MetroShield — Municipal Hazard Command & City Defense

> **Capture $\rightarrow$ Understand $\rightarrow$ Reveal $\rightarrow$ Act.**  
> Transforming chaotic civic hazards into prioritized, explainable, spatially clustered, and trackable municipal actions using Gemini AI, pgvector semantic search, and interactive spatial intelligence.

---

## 1. Executive Summary & Core Mission Directive
Every day, municipalities receive thousands of unstructured, duplicate, and fragmented complaints across disparate channels: waterlogging, open craters, sparking power lines, overflowing sanitation bins, and dark alleys. Municipal authorities face triage bottlenecks, leading to delayed responses to life-threatening hazards and wasted operational budgets dispatching duplicate field crews.

**MetroShield** automates the complete civic hazard lifecycle:
1. **Capture (< 1 Minute):** Mobile-first citizen reporting with category auto-detection, photo upload, and pinpoint GPS/map geolocation.
2. **Understand (Gemini AI Pipeline):** Structured AI analysis generating concise 1-sentence summaries, calculating explainable priority scores (0–100), and issuing concrete field worker directives.
3. **Reveal (pgvector & Spatial Clustering):** Automatic 768-dimensional semantic duplicate detection to merge redundant complaints, paired with DBSCAN density clustering to identify geographic hotspots.
4. **Act (Authority Console & Public Tracker):** Central dispatch dashboard with field crew assignment, priority overriding, audit logging, and public transparency timelines.

---

## 2. System Architecture

```
 ┌────────────────────────────────────────────────────────┐
 │                   CITIZEN / USER                       │
 │  Mobile Portal (/report)  ·  Public Tracker (/)        │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼  [REST + Zod Validation]
 ┌────────────────────────────────────────────────────────┐
 │              EXPRESS.JS BACKEND ENGINE                 │
 │  · Zod Input Sanitization                              │
 │  · Multi-Modal Ingestion (Text, Images, Coordinates)   │
 └─────────────┬────────────────────────────┬─────────────┘
               │                            │
               ▼                            ▼
 ┌───────────────────────────┐  ┌─────────────────────────┐
 │   GEMINI AI PIPELINE      │  │   DATA & VECTOR STORE   │
 │ · text-embedding-004      │  │ · Supabase PostgreSQL   │
 │   (768-d Vector Cosine)   │  │ · pgvector extension    │
 │ · Gemini 2.5 Flash        │  │ · RLS Data Isolation    │
 │   - Clean Category        │  │ · Audit Activity Logs   │
 │   - 1-Sentence Summary    │  │ · Resilient Local Store │
 │   - Priority (0-100)      │  └─────────────────────────┘
 │   - Explainable Reasoning │
 │   - Field Action Brief    │
 └───────────────────────────┘
```

---

## 3. Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript | Ultra-fast single page application |
| **Styling** | Tailwind CSS, Custom Glassmorphism | Curated modern dark-mode design system |
| **Mapping** | Leaflet, React-Leaflet | Spatial hotspot visualization & coordinate picker |
| **Icons & FX** | Lucide React, Canvas Confetti | Visual iconography and feedback animations |
| **Backend** | Node.js, Express.js (ESM) | High-performance RESTful API microservice |
| **AI SDK** | `@google/genai` | Gemini 2.5 Flash structured triage & text-embedding-004 |
| **Vector DB** | Supabase PostgreSQL + pgvector | 768-d cosine distance search & spatial clustering |
| **Validation** | Zod (Client & Server) | Strict type contracts and input sanitization |

---

## 4. Application Pages & Routes

- `/` — **Landing & Public Grievance Feed:** City health statistics, live feed of public civic issues, filterable by domain and status, with interactive map toggle.
- `/report` — **Citizen Reporting Portal:** Mobile-first reporting form featuring 1-click preset triggers, GPS coordinate locator, interactive map pin, photo upload, and instant AI validation.
- `/report/success/:id` — **Live Transparency Tracker:** Real-time lifecycle timeline (`Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Assigned` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`), copyable ticket ID, and explainable AI triage snapshot.
- `/admin` — **Municipal Operations Command Center:** High-level KPI grid, interactive spatial map with priority-colored pins and hotspot circles, and sortable incoming triage queue with quick assignment actions.
- `/admin/reports/:id` — **Admin Ticket Detail & Action Console:** Deep-dive into Gemini AI reasoning, duplicate relationships, crew assignment controls, priority override sliders, and audit history.
- `/admin/clusters` — **Hotspot & Cluster Intelligence View:** Spatial density analysis grouping complaints within 450m radius, providing executive action briefs for city leadership.

---

## 5. Target Domains & Prioritization Rules

### Categories
1. **waterlogging / Drainage:** Blocked drains, sewer backflow, broken water mains, underpass flooding.
2. **roads / Infrastructure:** Potholes, damaged asphalt, missing sewer covers, buckled pavement.
3. **waste / Sanitation:** Overflowing community dumpsters, hazardous illegal dumping, uncollected debris.
4. **streetlights / Lighting:** Broken luminaires, dark public corridors, stroboscopic LED failure.
5. **electrical / Hazards:** Exposed live wires, sparking transformers, fallen utility lines (Critical Safety).

### Priority Score Thresholds
- **Critical Danger (90–100):** Immediate threat to human life or infrastructure collapse (e.g., sparking live wire touching sidewalk, major school flooding, missing manhole cover).
- **High Priority (70–89):** Severe community transit disruption or access blockage (e.g., blocked arterial highway lane, fire lane obstruction).
- **Medium (40–69):** Localized recurring nuisance requiring scheduled maintenance (e.g., overflowing park trash bin, sunken manhole frame).
- **Low (0–39):** Minor cosmetic irregularities or single-fixture routine maintenance.

---

## 6. Database Schema & pgvector Migration

Run the following SQL migration in your Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enum Types
CREATE TYPE report_category AS ENUM ('waterlogging', 'roads', 'waste', 'streetlights', 'electrical');
CREATE TYPE report_status AS ENUM ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected');
CREATE TYPE priority_level AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category report_category NOT NULL,
    status report_status DEFAULT 'Submitted'::report_status,
    priority priority_level DEFAULT 'Medium'::priority_level,
    priority_score INTEGER CHECK (priority_score BETWEEN 0 AND 100),
    ai_summary TEXT,
    ai_explanation TEXT,
    action_brief TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    image_url TEXT,
    reporter_contact TEXT,
    assigned_to TEXT,
    is_duplicate BOOLEAN DEFAULT FALSE,
    parent_duplicate_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    embedding VECTOR(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit History Log
CREATE TABLE report_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    previous_status report_status,
    new_status report_status,
    changed_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cosine Distance Vector Search RPC
CREATE OR REPLACE FUNCTION match_reports(
    query_embedding VECTOR(768),
    match_threshold FLOAT DEFAULT 0.82,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID, title TEXT, description TEXT, category report_category,
    status report_status, priority priority_level, priority_score INT,
    latitude DOUBLE PRECISION, longitude DOUBLE PRECISION, similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.category, r.status, r.priority, r.priority_score,
           r.latitude, r.longitude, 1 - (r.embedding <=> query_embedding) AS similarity
    FROM reports r
    WHERE r.embedding IS NOT NULL AND 1 - (r.embedding <=> query_embedding) >= match_threshold
    ORDER BY r.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;
```

---

## 7. Quickstart Guide (Run Locally in 60 Seconds)

### Prerequisites
- Node.js >= 18
- npm >= 9

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/your-username/civicpulse.git
cd civicpulse

# Install server packages
npm.cmd --prefix server install

# Install client packages
npm.cmd --prefix client install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```
> **Zero-Config Resilience:** If `GEMINI_API_KEY` or `SUPABASE_URL` are not provided initially, CivicPulse automatically boots in resilient local development mode with 40 pre-seeded realistic reports, simulated pgvector cosine duplicate detection, and heuristic civic triage. Supplying real keys seamlessly upgrades to live Gemini 2.5 Flash and remote Supabase!

### Step 3: Launch Full-Stack Application
Start backend and frontend dev servers concurrently:
```bash
# Terminal 1: Backend API (port 5000)
npm.cmd --prefix server start

# Terminal 2: Frontend Client (port 3000)
npm.cmd --prefix client run dev -- --host 127.0.0.1 --port 3000
```
Open your browser at **`http://localhost:3000`**.

---

## 8. Synthetic Data Seeder (40 Pre-Loaded Reports)
The database auto-seeds 40 realistic civic reports on launch (also triggerable via the **"Reset 40 Reports"** button in the navbar or `POST /api/seed`).

Pre-configured deliberate clusters:
1. **St. Mary's School Waterlogging Zone:** 5 reports featuring active water main rupture, blocked storm drains, and 2 deliberate duplicate reports demonstrating automated vector merging.
2. **5th Avenue Electrical Danger Corridor:** 4 reports covering snapping live cables, smoking pole transformers, and exposed junction terminals.
3. **Downtown Market Square Sanitation Crisis:** 5 reports of rotting organic waste, illegal commercial dumping, and light rail track blockage.
4. **Industrial Bypass Road Crater Zone:** 5 reports including high-speed 12-inch craters, missing manhole covers, and rail crossing subsidence.
5. **Green Park Dark Corridor:** 4 reports of 12-pole street illumination blackout and cracked leaning poles.

---

## 9. Limitations & Honesty Disclosure
In compliance with hackathon transparency guidelines:
- **Image Processing Simulation:** The application accepts uploaded citizen photos (base64/URLs) and visualizes them across the detail console. In production, image files should be hosted on Supabase Storage buckets or AWS S3 with Gemini Multimodal Vision analysis for visual confirmation of water height or wire presence.
- **SMS / Push Alerts:** Citizen SMS tracking updates are currently simulated via in-app toast feedback and logged activity audit entries rather than live Twilio SMS dispatch.
- **Vector Cold Start:** When deploying pgvector in Supabase, create the `ivfflat` index *after* inserting initial seed rows for optimal cluster distribution lists.

---

## 10. License
Built for civic good under the MIT License.
