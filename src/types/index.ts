export type ReportStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type HynekScale = 
  | 'NL'    // Nocturnal Light
  | 'DD'    // Daylight Disc
  | 'RV'    // Radar-Visual
  | 'CE-I'  // Close Encounter 1st Kind (<500ft, no physical traces)
  | 'CE-II' // Close Encounter 2nd Kind (physical traces / electromagnetic interference)
  | 'CE-III'// Close Encounter 3rd Kind (occupants seen)
  | 'CE-IV' // Close Encounter 4th Kind (abduction / lost time)
  | 'CE-V'; // Close Encounter 5th Kind (direct contact / CE-5)

export type ObjectShape = 
  | 'Disc' 
  | 'Triangle' 
  | 'Sphere' 
  | 'Cylinder / Cigar' 
  | 'Tic-Tac' 
  | 'Light Cluster' 
  | 'Chevron' 
  | 'Diamond' 
  | 'Other';

export type RejectionReason = 
  | 'Identified as Starlink'
  | 'Identified as Aircraft / Drone'
  | 'Astronomical / Venus / Meteor'
  | 'Military Flight (Offutt AFB)'
  | 'Insufficient Evidence'
  | 'Hoax / Fabricated'
  | 'Duplicate Report'
  | 'Other';

export interface FieldNote {
  id: string;
  author: string;
  timestamp: string;
  note: string;
  type: 'interview' | 'radar_check' | 'site_visit' | 'internal';
}

export interface MediaEvidence {
  id: string;
  type: 'image' | 'video' | 'radar';
  url: string;
  caption: string;
  exifData?: {
    camera?: string;
    iso?: string;
    exposure?: string;
    focalLength?: string;
    timestamp?: string;
    gpsCoords?: string;
  };
}

export interface SightingReport {
  id: string;
  caseNumber: string; // e.g., NE-2026-0419
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "22:15 CST"
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
    landmarkProximity: string; // e.g. "3.2 mi NW of Offutt AFB runway"
  };
  witness: {
    name: string;
    email: string;
    phone: string;
    occupation?: string;
    isAnonymous: boolean;
    redactedName: string; // e.g. "Witness A - Papillion Resident"
  };
  classification: {
    hynek: HynekScale;
    valleeCategory?: string;
    shape: ObjectShape;
    duration: string;
    color: string;
    estimatedAltitude: string;
    estimatedSpeed: string;
    sound: string;
  };
  conditions: {
    weather: string;
    visibility: string;
    moonPhase: string;
    cloudCover: string;
  };
  status: ReportStatus;
  moderationNotes: string;
  rejectionReason?: RejectionReason;
  credibilityScore: number; // 0-100
  assignedInvestigatorId?: string;
  assignedInvestigatorName?: string;
  fieldNotes: FieldNote[];
  media: MediaEvidence[];
  isPublishedToPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'moderator' | 'field_investigator' | 'reporter';
export type UserStatus = 'active' | 'disabled';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  badgeNumber?: string;
  phone?: string;
  avatarUrl?: string;
  assignedCasesCount: number;
  dateJoined: string;
  lastLogin: string;
}

export interface PublicAnnouncement {
  id: string;
  title: string;
  category: 'meeting' | 'investigation_alert' | 'workshop' | 'press_release';
  date: string;
  location: string;
  zoomLink?: string;
  content: string;
  isPublished: boolean;
}

export type AuditActionType =
  | 'APPROVE_REPORT'
  | 'REJECT_REPORT'
  | 'EDIT_REPORT'
  | 'CREATE_REPORT'
  | 'PUBLISH_DRAFT'
  | 'UPDATE_USER_ROLE'
  | 'TOGGLE_USER_STATUS'
  | 'RESET_PASSWORD'
  | 'PROVISION_USER'
  | 'SYNC_PUBLIC_FEED';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  action: AuditActionType;
  targetType: 'sighting_report' | 'user' | 'public_feed';
  targetId: string;
  targetLabel: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  severity: AuditSeverity;
}

