import React, { useState } from 'react';
import { 
  X, CheckCircle2, XCircle, ShieldCheck, MapPin, Calendar, Clock, 
  User, Phone, Mail, Lock, Sparkles, Sliders, Eye, Image as ImageIcon,
  FileText, Plus, Radio, AlertCircle, Save, Check
} from 'lucide-react';
import { SightingReport, HynekScale, ObjectShape, FieldNote, UserAccount } from '../types';

interface CaseDetailModalProps {
  report: SightingReport;
  onClose: () => void;
  onSave: (updatedReport: SightingReport) => void;
  onApprove: (reportId: string) => void;
  onReject: (reportId: string, reason: any, notes?: string) => void;
  allInvestigators: UserAccount[];
  userRole: string;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  report,
  onClose,
  onSave,
  onApprove,
  onReject,
  allInvestigators,
  userRole
}) => {
  const [formData, setFormData] = useState<SightingReport>({ ...report });
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'witness' | 'notes' | 'ai_assistant'>('overview');
  
  // Photo filter for image analysis
  const [photoFilter, setPhotoFilter] = useState<'normal' | 'negative' | 'infrared' | 'edge' | 'contrast'>('normal');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  
  // Field note entry
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState<'interview' | 'radar_check' | 'site_visit' | 'internal'>('internal');
  
  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'moderator' || userRole === 'field_investigator';

  // Handle auto-redact witness PII
  const handleAutoRedactWitness = () => {
    const city = formData.location.city || 'Omaha';
    const occ = formData.witness.occupation ? ` / ${formData.witness.occupation}` : '';
    const redacted = `Witness (${city} Resident${occ})`;
    setFormData(prev => ({
      ...prev,
      witness: {
        ...prev.witness,
        isAnonymous: true,
        redactedName: redacted
      }
    }));
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: FieldNote = {
      id: `fn-${Date.now()}`,
      author: userRole === 'admin' ? 'Matt Hagen (Admin)' : 'Field Investigator',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      note: newNoteText.trim(),
      type: newNoteType
    };
    setFormData(prev => ({
      ...prev,
      fieldNotes: [newNote, ...prev.fieldNotes]
    }));
    setNewNoteText('');
  };

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-sighting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          timestamp: `${formData.date} ${formData.time}`,
          location: `${formData.location.city}, ${formData.location.state} (${formData.location.landmarkProximity})`,
          shape: formData.classification.shape,
          duration: formData.classification.duration
        })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAiAnalysisResult(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAiSuggestions = () => {
    if (!aiAnalysisResult) return;
    setFormData(prev => ({
      ...prev,
      credibilityScore: aiAnalysisResult.credibilityScore || prev.credibilityScore,
      moderationNotes: `${prev.moderationNotes ? prev.moderationNotes + '\n\n' : ''}[AI Sighting Co-Pilot Evaluation]: ${aiAnalysisResult.preliminaryHypothesis} Potential IFO correlation: ${aiAnalysisResult.potentialIFO}`,
    }));
  };

  const handleSaveAll = () => {
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {formData.caseNumber}
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                {formData.title}
              </h2>
              <p className="text-xs text-slate-400">
                Logged {formData.date} at {formData.time} · {formData.location.city}, {formData.location.state}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                onClick={handleSaveAll}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
                <span>{savedSuccess ? 'Saved' : 'Save Changes'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Case Overview & Edit</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Evidence & Spectral Analysis ({formData.media.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('witness')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'witness'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Witness PII & Redaction</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Investigation Log ({formData.fieldNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_assistant')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ai_assistant'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Sighting Co-Pilot</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Case Overview & Edit */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Triage & Status Control Bar */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">Status:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    disabled={!canEdit}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="pending">Pending Triage</option>
                    <option value="approved">Approved & Published</option>
                    <option value="rejected">Rejected / Identified IFO</option>
                  </select>

                  <div className="flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
                    <span className="text-slate-400">Public Visibility:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={formData.isPublishedToPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublishedToPublic: e.target.checked }))}
                        disabled={!canEdit}
                        className="rounded border-slate-700 text-cyan-600 focus:ring-0 bg-slate-900"
                      />
                      <span>Sync to mufonomaha.space</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">Assigned Investigator:</span>
                  <select
                    value={formData.assignedInvestigatorId || ''}
                    onChange={(e) => {
                      const inv = allInvestigators.find(i => i.id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        assignedInvestigatorId: inv ? inv.id : undefined,
                        assignedInvestigatorName: inv ? `${inv.name} (${inv.role.replace('_', ' ')})` : undefined
                      }));
                    }}
                    disabled={!canEdit}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Unassigned</option>
                    {allInvestigators.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({inv.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title & Description Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Sighting Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    disabled={!canEdit}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Witness Statement & Primary Narrative
                  </label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={!canEdit}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Classification Grid */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  MUFON Field Classification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Hynek Scale</label>
                    <select
                      value={formData.classification.hynek}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        classification: { ...prev.classification, hynek: e.target.value as HynekScale }
                      }))}
                      disabled={!canEdit}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="NL">NL - Nocturnal Light</option>
                      <option value="DD">DD - Daylight Disc</option>
                      <option value="RV">RV - Radar-Visual</option>
                      <option value="CE-I">CE-I - Close Encounter 1st</option>
                      <option value="CE-II">CE-II - Physical/EM Traces</option>
                      <option value="CE-III">CE-III - Occupants</option>
                      <option value="CE-IV">CE-IV - Abduction</option>
                      <option value="CE-V">CE-V - Direct Contact</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Object Shape</label>
                    <select
                      value={formData.classification.shape}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        classification: { ...prev.classification, shape: e.target.value as ObjectShape }
                      }))}
                      disabled={!canEdit}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Disc">Disc / Saucer</option>
                      <option value="Triangle">Triangle / Trilateral</option>
                      <option value="Sphere">Sphere / Orb</option>
                      <option value="Cylinder / Cigar">Cylinder / Cigar</option>
                      <option value="Tic-Tac">Tic-Tac Capsule</option>
                      <option value="Light Cluster">Light Cluster / Formation</option>
                      <option value="Chevron">Chevron / Boomerang</option>
                      <option value="Diamond">Diamond</option>
                      <option value="Other">Other / Variable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Estimated Altitude</label>
                    <input
                      type="text"
                      value={formData.classification.estimatedAltitude}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        classification: { ...prev.classification, estimatedAltitude: e.target.value }
                      }))}
                      disabled={!canEdit}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Credibility Index (0-100)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.credibilityScore}
                        onChange={(e) => setFormData(prev => ({ ...prev, credibilityScore: parseInt(e.target.value) }))}
                        disabled={!canEdit}
                        className="flex-1 accent-cyan-500"
                      />
                      <span className="font-mono text-cyan-400 font-bold w-9 text-right">
                        {formData.credibilityScore}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Color / Luminescence</label>
                    <input
                      type="text"
                      value={formData.classification.color}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        classification: { ...prev.classification, color: e.target.value }
                      }))}
                      disabled={!canEdit}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Duration</label>
                    <input
                      type="text"
                      value={formData.classification.duration}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        classification: { ...prev.classification, duration: e.target.value }
                      }))}
                      disabled={!canEdit}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Acoustic / Sound</label>
                    <input
                      type="text"
                      value={formData.classification.sound}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        classification: { ...prev.classification, sound: e.target.value }
                      }))}
                      disabled={!canEdit}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Location & Proximity</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.location.city}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          location: { ...prev.location, city: e.target.value }
                        }))}
                        disabled={!canEdit}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">State / Zip</label>
                      <input
                        type="text"
                        value={`${formData.location.state} ${formData.location.zip}`}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          location: { ...prev.location, zip: e.target.value.split(' ')[1] || '' }
                        }))}
                        disabled={!canEdit}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Landmark / Airspace Proximity</label>
                    <input
                      type="text"
                      value={formData.location.landmarkProximity}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location: { ...prev.location, landmarkProximity: e.target.value }
                      }))}
                      disabled={!canEdit}
                      placeholder="e.g. 1.4 miles S of Offutt AFB runway"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-400">
                    <div>Lat: {formData.location.lat}°</div>
                    <div>Lng: {formData.location.lng}°</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Environmental Parameters</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        disabled={!canEdit}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Time (CST)</label>
                      <input
                        type="text"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        disabled={!canEdit}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Weather & Temp</label>
                      <input
                        type="text"
                        value={formData.conditions.weather}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, weather: e.target.value }
                        }))}
                        disabled={!canEdit}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Moon Phase</label>
                      <input
                        type="text"
                        value={formData.conditions.moonPhase}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, moonPhase: e.target.value }
                        }))}
                        disabled={!canEdit}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Evidence & Spectral Analysis */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-white">Photographic Evidence Inspector</h4>
                  <p className="text-xs text-slate-400">
                    Apply image filters to evaluate luminance edges, compression artifacts, and IR false color.
                  </p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setPhotoFilter('normal')}
                    className={`px-2.5 py-1 rounded font-medium ${photoFilter === 'normal' ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400'}`}
                  >
                    Normal (RGB)
                  </button>
                  <button
                    onClick={() => setPhotoFilter('negative')}
                    className={`px-2.5 py-1 rounded font-medium ${photoFilter === 'negative' ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400'}`}
                  >
                    Inverted (Negative)
                  </button>
                  <button
                    onClick={() => setPhotoFilter('infrared')}
                    className={`px-2.5 py-1 rounded font-medium ${photoFilter === 'infrared' ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400'}`}
                  >
                    False Infrared
                  </button>
                  <button
                    onClick={() => setPhotoFilter('edge')}
                    className={`px-2.5 py-1 rounded font-medium ${photoFilter === 'edge' ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400'}`}
                  >
                    High Edge Contrast
                  </button>
                  <button
                    onClick={() => setPhotoFilter('contrast')}
                    className={`px-2.5 py-1 rounded font-medium ${photoFilter === 'contrast' ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400'}`}
                  >
                    Extreme Equalize
                  </button>
                </div>
              </div>

              {formData.media.length === 0 ? (
                <div className="bg-slate-950 p-12 text-center rounded-xl border border-slate-800">
                  <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-slate-300">No media attached to this report</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Witness did not attach photos, video, or radar telemetry.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.media.map((med) => {
                    let filterStyle = '';
                    if (photoFilter === 'negative') filterStyle = 'invert hue-rotate-180';
                    if (photoFilter === 'infrared') filterStyle = 'contrast-200 saturate-200 hue-rotate-90';
                    if (photoFilter === 'edge') filterStyle = 'contrast-200 brightness-125 grayscale';
                    if (photoFilter === 'contrast') filterStyle = 'contrast-300 brightness-90';

                    return (
                      <div key={med.id} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
                        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                          <img
                            src={med.url}
                            alt={med.caption}
                            className={`w-full h-full object-cover transition-all duration-300 ${filterStyle}`}
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-cyan-400 border border-cyan-800">
                            {photoFilter.toUpperCase()} FILTER
                          </div>
                        </div>

                        <div className="p-4 space-y-2 text-xs flex-1 flex flex-col justify-between">
                          <p className="text-slate-300 font-medium">{med.caption}</p>

                          {med.exifData && (
                            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80 font-mono text-[11px] text-slate-400 space-y-1">
                              <div className="text-cyan-400 font-semibold mb-1">EXIF / Sensor Metadata:</div>
                              {med.exifData.camera && <div>Camera: {med.exifData.camera}</div>}
                              {med.exifData.exposure && <div>Exposure: {med.exifData.exposure} · ISO: {med.exifData.iso}</div>}
                              {med.exifData.focalLength && <div>Optics: {med.exifData.focalLength}</div>}
                              {med.exifData.timestamp && <div>Timestamp: {med.exifData.timestamp}</div>}
                              {med.exifData.gpsCoords && <div>GPS: {med.exifData.gpsCoords}</div>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Witness PII & Redaction */}
          {activeTab === 'witness' && (
            <div className="space-y-6">
              <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-amber-300">Confidential Witness Privacy Station</div>
                  <p className="text-slate-400 mt-0.5">
                    MUFON regulations protect witness identity. The private record below is only accessible to certified Field Investigators.
                    When approved, ONLY the <strong className="text-slate-200">Redacted Public Label</strong> will appear on <code className="text-cyan-300 font-mono">mufonomaha.space</code>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Confidential Private Record */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confidential (Admin/FI Only)</span>
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      DO NOT PUBLISH
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={formData.witness.name}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          witness: { ...prev.witness, name: e.target.value }
                        }))}
                        disabled={!canEdit}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={formData.witness.email}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          witness: { ...prev.witness, email: e.target.value }
                        }))}
                        disabled={!canEdit}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={formData.witness.phone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          witness: { ...prev.witness, phone: e.target.value }
                        }))}
                        disabled={!canEdit}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Witness Occupation / Background</label>
                      <input
                        type="text"
                        value={formData.witness.occupation || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          witness: { ...prev.witness, occupation: e.target.value }
                        }))}
                        disabled={!canEdit}
                        placeholder="e.g. Avionics tech, pilot, engineer"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Redacted Public Record */}
                <div className="bg-slate-950 p-5 rounded-xl border border-emerald-900/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Public Record (mufonomaha.space)</span>
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      SAFE FOR PUBLIC
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">
                        Sanitized Witness Display String
                      </label>
                      <input
                        type="text"
                        value={formData.witness.redactedName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          witness: { ...prev.witness, redactedName: e.target.value }
                        }))}
                        disabled={!canEdit}
                        className="w-full bg-slate-900 border border-emerald-800/60 rounded px-2.5 py-1.5 text-emerald-300 font-mono"
                      />
                    </div>

                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-400 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                        <input
                          type="checkbox"
                          checked={formData.witness.isAnonymous}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            witness: { ...prev.witness, isAnonymous: e.target.checked }
                          }))}
                          disabled={!canEdit}
                          className="rounded border-slate-700 text-cyan-600 focus:ring-0 bg-slate-950"
                        />
                        <span>Witness explicitly requested anonymity</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        When enabled, personal identifiers are completely omitted from public API responses.
                      </p>
                    </div>

                    <button
                      onClick={handleAutoRedactWitness}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Auto-Sanitize & Redact PII</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Investigation Notes Log */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Append Field Investigation Note
                </h4>

                <div className="flex gap-2">
                  <select
                    value={newNoteType}
                    onChange={(e) => setNewNoteType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="internal">Internal Analysis</option>
                    <option value="interview">Witness Interview Log</option>
                    <option value="radar_check">Radar / FOIA Log</option>
                    <option value="site_visit">On-Site Field Visit</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record interview notes, radar transponder checks, physical trace measurements..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleAddNote}
                    disabled={!newNoteText.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Append Note to Case File</span>
                  </button>
                </div>
              </div>

              {/* Chronological Notes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400">Chronological Case Log</h4>
                {formData.fieldNotes.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-4 bg-slate-950 rounded-lg border border-slate-800">
                    No field notes recorded yet for this case.
                  </div>
                ) : (
                  formData.fieldNotes.map((note) => (
                    <div key={note.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{note.author}</span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 uppercase">
                            {note.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">{note.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{note.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AI Sighting Co-Pilot */}
          {activeTab === 'ai_assistant' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-950 to-slate-950 p-5 rounded-xl border border-cyan-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Gemini AI Sighting Co-Pilot (Omaha Sector Analysis)</span>
                  </div>

                  <button
                    onClick={handleRunAiAnalysis}
                    disabled={isAnalyzing}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition-colors"
                  >
                    {isAnalyzing ? (
                      <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isAnalyzing ? 'Analyzing Airspace & Narrative...' : 'Run Sighting Triage AI'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Evaluates witness testimony against Omaha local parameters (Offutt AFB 55th Wing flight corridors, Eppley approach paths, Starlink orbital passes, and astronomical visibility).
                </p>
              </div>

              {aiAnalysisResult && (
                <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Recommended Hynek:</span>
                      <span className="font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        {aiAnalysisResult.hynekClassification}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Credibility Score:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {aiAnalysisResult.credibilityScore}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-200 mb-1">Preliminary Investigative Hypothesis:</h5>
                    <p className="text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                      {aiAnalysisResult.preliminaryHypothesis}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-200 mb-1">Conventional / IFO Potential:</h5>
                    <p className="text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                      {aiAnalysisResult.potentialIFO}
                    </p>
                  </div>

                  {aiAnalysisResult.investigativeSteps && (
                    <div>
                      <h5 className="font-semibold text-slate-200 mb-1.5">Actionable Next Steps for Omaha FIs:</h5>
                      <ul className="space-y-1.5">
                        {aiAnalysisResult.investigativeSteps.map((step: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-cyan-400 font-mono">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleApplyAiSuggestions}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                    >
                      Apply AI Classification & Notes to Case
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            Case Status: <strong className="text-slate-200 uppercase font-mono">{formData.status}</strong>
            {formData.isPublishedToPublic && (
              <span className="ml-2 text-emerald-400 font-medium">· Synced to public</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {formData.status !== 'approved' && (
              <button
                onClick={() => {
                  onApprove(formData.id);
                  setFormData(prev => ({ ...prev, status: 'approved', isPublishedToPublic: true }));
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Publish</span>
              </button>
            )}

            {formData.status !== 'rejected' && (
              <button
                onClick={() => {
                  onReject(formData.id, 'Identified as Starlink', 'Flagged in case inspector');
                  setFormData(prev => ({ ...prev, status: 'rejected', isPublishedToPublic: false }));
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject / IFO</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
