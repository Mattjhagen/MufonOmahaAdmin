import React, { useState } from 'react';
import { X, Plus, ShieldCheck, MapPin, Calendar, Clock, AlertCircle, FileEdit } from 'lucide-react';
import { SightingReport, HynekScale, ObjectShape, ReportStatus } from '../types';

interface NewReportModalProps {
  onClose: () => void;
  onAddReport: (newReport: SightingReport) => void;
  existingCount: number;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({
  onClose,
  onAddReport,
  existingCount
}) => {
  const currentYear = 2026;
  const nextCaseNum = `NE-${currentYear}-04${20 + existingCount}`;

  const [caseNumber, setCaseNumber] = useState(nextCaseNum);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-28');
  const [time, setTime] = useState('21:00 CST');
  
  // Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Omaha');
  const [state, setState] = useState('NE');
  const [zip, setZip] = useState('68102');
  const [landmarkProximity, setLandmarkProximity] = useState('');
  
  // Witness
  const [witnessName, setWitnessName] = useState('');
  const [witnessEmail, setWitnessEmail] = useState('');
  const [witnessPhone, setWitnessPhone] = useState('');
  const [witnessOccupation, setWitnessOccupation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Classification
  const [hynek, setHynek] = useState<HynekScale>('NL');
  const [shape, setShape] = useState<ObjectShape>('Disc');
  const [color, setColor] = useState('');
  const [duration, setDuration] = useState('');
  const [estimatedAltitude, setEstimatedAltitude] = useState('');
  const [sound, setSound] = useState('');
  
  // Status
  const [status, setStatus] = useState<ReportStatus>('pending');
  const [credibilityScore, setCredibilityScore] = useState(80);

  const [error, setError] = useState('');

  // Handle saving incomplete draft without strict validation
  const handleSaveAsDraft = () => {
    const finalTitle = title.trim() || `Draft Sighting Intake (${date})`;
    const finalDesc = description.trim() || 'Incomplete witness debrief saved by investigator. Additional details pending.';
    
    const redactedName = isAnonymous
      ? `Witness (${city} Resident${witnessOccupation ? ` / ${witnessOccupation}` : ''})`
      : witnessName || 'Witness';

    const draftReport: SightingReport = {
      id: `rep-${Date.now()}`,
      caseNumber,
      title: finalTitle.startsWith('[DRAFT]') ? finalTitle : `[DRAFT] ${finalTitle}`,
      description: finalDesc,
      date,
      time,
      location: {
        address: address.trim() || 'Omaha Metro area',
        city,
        state,
        zip,
        lat: 41.2565,
        lng: -95.9345,
        landmarkProximity: landmarkProximity.trim() || `${city} area`
      },
      witness: {
        name: witnessName.trim() || 'Confidential Witness (Incomplete)',
        email: witnessEmail.trim() || '',
        phone: witnessPhone.trim() || '(402) 555-0000',
        occupation: witnessOccupation.trim() || undefined,
        isAnonymous,
        redactedName
      },
      classification: {
        hynek,
        shape,
        duration,
        color,
        estimatedAltitude,
        estimatedSpeed: 'Variable',
        sound
      },
      conditions: {
        weather: 'Clear',
        visibility: '10 miles',
        moonPhase: 'Waxing',
        cloudCover: '10%'
      },
      status: 'draft',
      moderationNotes: 'DRAFT: Incomplete intake saved by field investigator. Hidden from main active queue.',
      credibilityScore,
      fieldNotes: [
        {
          id: `fn-${Date.now()}`,
          author: 'Field Investigator',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: 'Saved as draft. Witness interview pending completion.',
          type: 'internal'
        }
      ],
      media: [],
      isPublishedToPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddReport(draftReport);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide at least a title and a witness narrative.');
      return;
    }

    const redactedName = isAnonymous
      ? `Witness (${city} Resident${witnessOccupation ? ` / ${witnessOccupation}` : ''})`
      : witnessName || 'Witness';

    const newReport: SightingReport = {
      id: `rep-${Date.now()}`,
      caseNumber,
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      location: {
        address: address.trim() || 'Omaha Metro area',
        city,
        state,
        zip,
        lat: 41.2565,
        lng: -95.9345,
        landmarkProximity: landmarkProximity.trim() || `${city} metropolitan area`
      },
      witness: {
        name: witnessName.trim() || 'Anonymous Witness',
        email: witnessEmail.trim() || '',
        phone: witnessPhone.trim() || '(402) 555-0000',
        occupation: witnessOccupation.trim() || undefined,
        isAnonymous,
        redactedName
      },
      classification: {
        hynek,
        shape,
        duration,
        color,
        estimatedAltitude,
        estimatedSpeed: 'Variable',
        sound
      },
      conditions: {
        weather: 'Clear, 60°F',
        visibility: '10+ miles',
        moonPhase: 'Waxing Gibbous',
        cloudCover: '10%'
      },
      status,
      moderationNotes: 'Manually entered into admin portal by intake administrator.',
      credibilityScore,
      fieldNotes: [
        {
          id: `fn-${Date.now()}`,
          author: 'Intake Administrator',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: 'Case intake created manually via admin portal.',
          type: 'internal'
        }
      ],
      media: [],
      isPublishedToPublic: status === 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold">Manual Sighting Report Intake</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Case Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">MUFON Case Number</label>
              <input
                type="text"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Initial Triage Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="draft">Draft (Incomplete - Hidden from Main Queue)</option>
                <option value="pending">Pending Triage (Awaiting FI Review)</option>
                <option value="approved">Approved & Direct Publish to Public</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Sighting Headline / Title *</label>
            <input
              type="text"
              placeholder="e.g. Glowing Amber Triangle Observed Low Over Chalco Hills"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Witness Statement / Narrative *</label>
            <textarea
              rows={4}
              placeholder="Detailed witness narrative: trajectory, behavior, sound, visual appearance, and emotional reaction..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Date of Sighting</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Time of Sighting</label>
              <input
                type="text"
                placeholder="21:45 CST"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-semibold text-cyan-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Zip Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Landmark / Airspace Proximity</label>
              <input
                type="text"
                placeholder="e.g. 2 miles E of Standing Bear Lake / Eppley landing path"
                value={landmarkProximity}
                onChange={(e) => setLandmarkProximity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              />
            </div>
          </div>

          {/* Witness Details */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Witness Confidential Information</span>
              </h4>
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-600 bg-slate-900"
                />
                <span>Redact on public site</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Witness Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="witness@gmail.com"
                  value={witnessEmail}
                  onChange={(e) => setWitnessEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="(402) 555-..."
                  value={witnessPhone}
                  onChange={(e) => setWitnessPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Occupation</label>
                <input
                  type="text"
                  placeholder="Pilot, engineer, student"
                  value={witnessOccupation}
                  onChange={(e) => setWitnessOccupation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Hynek Classification</label>
              <select
                value={hynek}
                onChange={(e) => setHynek(e.target.value as HynekScale)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="NL">NL - Nocturnal Light</option>
                <option value="DD">DD - Daylight Disc</option>
                <option value="RV">RV - Radar-Visual</option>
                <option value="CE-I">CE-I - Close Encounter 1st</option>
                <option value="CE-II">CE-II - Physical Traces</option>
                <option value="CE-III">CE-III - Occupants</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Object Shape</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value as ObjectShape)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="Disc">Disc / Saucer</option>
                <option value="Triangle">Triangle</option>
                <option value="Sphere">Sphere / Orb</option>
                <option value="Tic-Tac">Tic-Tac</option>
                <option value="Chevron">Chevron</option>
                <option value="Cylinder / Cigar">Cylinder / Cigar</option>
                <option value="Light Cluster">Light Cluster</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Credibility (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={credibilityScore}
                onChange={(e) => setCredibilityScore(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSaveAsDraft}
              className="px-4 py-2 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Save partial notes as incomplete draft (hidden from main queue)"
            >
              <FileEdit className="w-4 h-4 text-cyan-400" />
              <span>Save as Incomplete Draft</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Submit & Create Case File</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
