import React, { useState } from 'react';
import { 
  Code, Copy, Check, Download, Sparkles, Terminal, FileCode, 
  ExternalLink, Layers, Database, Shield, Globe, Play
} from 'lucide-react';
import { CODEX_PROMPTS, CodexTemplate } from '../data/codexPrompts';

export const CodexStudio: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('master-backend-prompt');
  const [copied, setCopied] = useState(false);
  
  // Custom prompt builder state
  const [framework, setFramework] = useState('Next.js 15 App Router (TypeScript)');
  const [database, setDatabase] = useState('PostgreSQL + Prisma ORM');
  const [authProvider, setAuthProvider] = useState('NextAuth / Auth.js (JWT Sessions)');
  const [deploymentTarget, setDeploymentTarget] = useState('Vercel Subdomain Routing (admin.mufonomaha.space)');
  const [includePiiRedaction, setIncludePiiRedaction] = useState(true);
  const [includeHynekClassifier, setIncludeHynekClassifier] = useState(true);
  const [includeOffuttRadar, setIncludeOffuttRadar] = useState(true);
  const [activeTab, setActiveTab] = useState<'prompt' | 'simulation'>('prompt');

  // AI Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const selectedTemplate = CODEX_PROMPTS.find(t => t.id === selectedTemplateId) || CODEX_PROMPTS[0];

  // Dynamic Prompt generation if custom config changed
  const getPromptContent = () => {
    if (selectedTemplateId !== 'master-backend-prompt') {
      return selectedTemplate.prompt;
    }

    return `You are an expert full-stack TypeScript engineer working on the Omaha MUFON repository (https://github.com/Mattjhagen/OmahaMufonRevised), serving https://mufonomaha.space/.

### OBJECTIVE
Build a production-grade admin backend accessible at the subdomain 'admin.mufonomaha.space' that allows administrators to moderate UFO sighting submissions, manage users, and control public site data.

---

### SELECTED TECH STACK
- Framework: ${framework}
- Database: ${database}
- Authentication: ${authProvider}
- Target Subdomain: 'admin.mufonomaha.space' (with public site at 'mufonomaha.space')
- Deployment Target: ${deploymentTarget}

---

### 1. SUBDOMAIN ROUTING & ISOLATION
- Route incoming requests based on the 'host' header.
- If host is 'admin.mufonomaha.space' (or 'admin.localhost:3000' in dev), route into '/admin' application space.
- Protect all admin endpoints with ${authProvider} session validation.
- Configure CORS and session cookies to support both 'admin.mufonomaha.space' and 'mufonomaha.space'.

---

### 2. SIGHTING REPORTS MODERATION SPECIFICATIONS
1. **View All Reports**: Filterable by status ('pending', 'approved', 'rejected') and Hynek scale ('NL', 'DD', 'RV', 'CE-I', 'CE-II', 'CE-III').
2. **Approve / Reject Pipeline**:
   - Approving sets 'isPublishedToPublic = true' and exposes the report to the public sightings directory on 'mufonomaha.space'.
   - Rejecting allows assigning an IFO classification ('Identified as Starlink', 'Identified as Aircraft / Drone', 'Astronomical / Venus', 'Military Flight (Offutt AFB)', 'Hoax', 'Insufficient Evidence').
3. **Edit Report Details**: Modify witness statement, location proximity, shape, duration, velocity, sound, and credibility score.
4. **Manual Intake**: Allow administrators to manually log phoned-in or mail-in sighting reports.
${includePiiRedaction ? `5. **Witness PII Auto-Redaction**: Redact confidential witness legal names, phone numbers, and street addresses, replacing them with sanitized public strings (e.g. "Witness (Bellevue Resident)").` : ''}
${includeOffuttRadar ? `6. **Offutt AFB Airspace & Radar Cross-Reference**: Check timestamps against military training corridors (55th Wing RC-135 / KC-135) and Omaha TRACON flight approaches.` : ''}

---

### 3. USER MANAGEMENT & ROLE-BASED ACCESS CONTROL (RBAC)
1. **User Roster**: List all registered users with name, email, role, status, and cases assigned.
2. **Search & Filter**: Filter by role ('admin', 'moderator', 'field_investigator', 'reporter') and status ('active', 'disabled').
3. **Enable / Disable Toggle**: Instantly suspend or reactivate user accounts with immediate token invalidation.
4. **Password Reset**: Generate secure temporary credentials or one-time reset links.
5. **Role Hierarchy**:
   - 'admin': Full access to all settings, users, and moderation.
   - 'moderator': Review sighting queue, approve/reject reports, edit witness redactions.
   - 'field_investigator': Access unredacted witness contact details for assigned cases and log field investigation notes.
   - 'reporter': Submit reports and track status.

---

### 4. DATABASE SCHEMA (${database})
\`\`\`prisma
enum ReportStatus {
  PENDING
  APPROVED
  REJECTED
}

enum HynekScale {
  NL
  DD
  RV
  CE_I
  CE_II
  CE_III
  CE_IV
  CE_V
}

enum UserRole {
  ADMIN
  MODERATOR
  FIELD_INVESTIGATOR
  REPORTER
}

model User {
  id              String         @id @default(cuid())
  email           String         @unique
  name            String
  passwordHash    String
  role            UserRole       @default(REPORTER)
  isActive        Boolean        @default(true)
  badgeNumber     String?        // e.g. "NE-014"
  phone           String?
  assignedCases   SightingReport[] @relation("AssignedInvestigator")
  fieldNotes      FieldNote[]
  createdAt       DateTime       @default(now())
}

model SightingReport {
  id                   String        @id @default(cuid())
  caseNumber           String        @unique // e.g., "NE-2026-0419"
  title                String
  description          String        @db.Text
  date                 DateTime
  timeString           String
  
  // Location
  address              String
  city                 String
  state                String        @default("NE")
  zip                  String
  latitude             Float
  longitude            Float
  landmarkProximity    String?       // e.g. "1.4 miles S of Offutt AFB"
  
  // Confidential Witness Record
  witnessName          String
  witnessEmail         String
  witnessPhone         String
  witnessOccupation    String?
  isAnonymous          Boolean       @default(false)
  redactedName         String
  
  // Classification
  hynekCategory        HynekScale    @default(NL)
  shape                String
  duration             String
  color                String
  estimatedAltitude    String
  
  // Status
  status               ReportStatus  @default(PENDING)
  rejectionReason      String?
  moderationNotes      String?       @db.Text
  credibilityScore     Int           @default(70)
  isPublishedToPublic  Boolean       @default(false)
  
  assignedInvestigatorId String?
  assignedInvestigator   User?       @relation("AssignedInvestigator", fields: [assignedInvestigatorId], references: [id])
  fieldNotes             FieldNote[]
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
}

model FieldNote {
  id          String         @id @default(cuid())
  reportId    String
  report      SightingReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  authorId    String
  author      User           @relation(fields: [authorId], references: [id])
  type        String         // "interview", "radar_check", "site_visit", "internal"
  note        String         @db.Text
  createdAt   DateTime       @default(now())
}
\`\`\`

---

### 5. API ENDPOINTS TO GENERATE
- GET /api/admin/reports
- POST /api/admin/reports (manual intake)
- PUT /api/admin/reports/:id (edit report)
- PATCH /api/admin/reports/:id/status (approve/reject)
- GET /api/admin/users
- PATCH /api/admin/users/:id/role
- PATCH /api/admin/users/:id/status
- POST /api/admin/users/:id/reset-password
- GET /api/public/sightings (returns approved & PII-redacted sightings for mufonomaha.space)

Provide clean, modular, production-ready code with complete TypeScript interfaces and error handling.`;
  };

  const currentPrompt = getPromptContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentPrompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CODEX_OMAHAMUFON_ADMIN_PROMPT.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setActiveTab('simulation');
    try {
      const res = await fetch('/api/codex-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: currentPrompt,
          targetStack: framework
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data.simulatedOutput);
      }
    } catch (e) {
      console.error(e);
      setSimulationResult('Simulation error occurred.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-800/50 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                <Code className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-white">Codex Prompt Engineering Studio</h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
                Mattjhagen/OmahaMufonRevised
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Precision-crafted, comprehensive prompts to feed into OpenAI Codex, GitHub Copilot, Cursor, or Claude Code to build and integrate the <code className="text-cyan-300 font-mono">admin.mufonomaha.space</code> backend into your GitHub repository.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Prompt Copied!' : 'Copy Prompt for Codex'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-700"
              title="Download as Markdown file"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>.md</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {CODEX_PROMPTS.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => setSelectedTemplateId(tmpl.id)}
            className={`p-3.5 rounded-xl border text-left transition-all text-xs space-y-1.5 ${
              selectedTemplateId === tmpl.id
                ? 'bg-cyan-950/60 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className={`font-semibold ${selectedTemplateId === tmpl.id ? 'text-cyan-300' : 'text-slate-200'}`}>
              {tmpl.title.replace('Master Codex Prompt: ', '').replace('Codex Prompt: ', '')}
            </div>
            <div className="text-[11px] text-slate-500 line-clamp-2">
              {tmpl.description}
            </div>
          </button>
        ))}
      </div>

      {/* Interactive Stack Customizer (For the Master Prompt) */}
      {selectedTemplateId === 'master-backend-prompt' && (
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-xl space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Customize Architecture for Codex</span>
            </h4>
            <span className="text-[11px] text-slate-400">Prompt updates dynamically below</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Framework</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Next.js 15 App Router (TypeScript)">Next.js 15 App Router</option>
                <option value="Vite React 19 + Express Server (Fullstack)">Vite React + Express</option>
                <option value="Remix / React Router v7">Remix / React Router v7</option>
                <option value="SvelteKit 2.0 (TypeScript)">SvelteKit</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Database & ORM</label>
              <select
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="PostgreSQL + Prisma ORM">PostgreSQL + Prisma ORM</option>
                <option value="Supabase (PostgreSQL + RLS)">Supabase (Postgres + RLS)</option>
                <option value="PostgreSQL + Drizzle ORM">PostgreSQL + Drizzle ORM</option>
                <option value="MongoDB + Mongoose">MongoDB + Mongoose</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Authentication</label>
              <select
                value={authProvider}
                onChange={(e) => setAuthProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="NextAuth / Auth.js (JWT Sessions)">NextAuth / Auth.js</option>
                <option value="Supabase Auth (Multi-Tenant)">Supabase Auth</option>
                <option value="Clerk Auth (Subdomain SSO)">Clerk Auth</option>
                <option value="Custom HTTP-Only JWT Cookies">Custom HTTP-Only JWT</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Deployment Target</label>
              <select
                value={deploymentTarget}
                onChange={(e) => setDeploymentTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Vercel Subdomain Routing (admin.mufonomaha.space)">Vercel Subdomain Routing</option>
                <option value="Cloudflare Workers + Pages">Cloudflare Pages & Workers</option>
                <option value="Docker Container on VPS (Nginx Reverse Proxy)">Docker + Nginx VPS</option>
                <option value="Google Cloud Run">Google Cloud Run</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800/80 text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePiiRedaction}
                onChange={(e) => setIncludePiiRedaction(e.target.checked)}
                className="rounded border-slate-700 text-cyan-600 bg-slate-950"
              />
              <span>Include Witness PII Auto-Redaction Pipeline</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeOffuttRadar}
                onChange={(e) => setIncludeOffuttRadar(e.target.checked)}
                className="rounded border-slate-700 text-cyan-600 bg-slate-950"
              />
              <span>Include Offutt AFB & Eppley Airspace Correlator</span>
            </label>
          </div>
        </div>
      )}

      {/* Prompt Viewer & Live Simulation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'prompt'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Prompt Text ({currentPrompt.split('\n').length} lines · {currentPrompt.length} chars)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('simulation');
                if (!simulationResult) handleRunSimulation();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'simulation'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Codex Output Simulation</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              {isSimulating ? (
                <span className="animate-spin w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full" />
              ) : (
                <Play className="w-3 h-3 text-cyan-400" />
              )}
              <span>{isSimulating ? 'Simulating...' : 'Test Prompt with AI'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Content Box */}
        {activeTab === 'prompt' ? (
          <div className="p-4 sm:p-6 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed selection:bg-cyan-900 selection:text-white">
            <pre className="whitespace-pre-wrap font-mono">{currentPrompt}</pre>
          </div>
        ) : (
          <div className="p-4 sm:p-6 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed">
            {isSimulating ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto" />
                <p>Generating simulated Codex implementation blueprint and schema...</p>
              </div>
            ) : simulationResult ? (
              <div className="space-y-4">
                <div className="p-3 bg-cyan-950/40 border border-cyan-800 rounded-lg text-cyan-300 text-xs flex items-center justify-between">
                  <span>AI Simulation: Previewing code structure produced by Codex based on your prompt.</span>
                  <span className="font-mono text-[10px] text-slate-400">Target: {framework}</span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-slate-300">{simulationResult}</pre>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
                <p>Click "Test Prompt with AI" to simulate what Codex will generate for this prompt.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Implementation Instructions Guide */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
        <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>How to use this with Mattjhagen/OmahaMufonRevised</span>
        </h4>
        <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
          <li>
            Click <strong>Copy Prompt for Codex</strong> above to copy the customized specification.
          </li>
          <li>
            In your code editor (Cursor / VS Code / GitHub Copilot Chat), open your repository <code className="text-cyan-300 font-mono">Mattjhagen/OmahaMufonRevised</code>.
          </li>
          <li>
            Paste the prompt into the AI prompt bar or pass it to Codex. It will automatically generate the <code className="text-cyan-300 font-mono">/src/middleware.ts</code> subdomain handler, the Prisma/Supabase moderation models, the API routes, and the Field Investigator interface.
          </li>
          <li>
            Configure your DNS on Cloudflare or Namecheap: Add a <code className="text-cyan-300 font-mono">CNAME</code> record for <code className="text-cyan-300 font-mono">admin</code> pointing to your deployment domain.
          </li>
        </ol>
      </div>
    </div>
  );
};
