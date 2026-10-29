import { SightingReport, UserAccount, PublicAnnouncement, AuditLogEntry } from '../types';

export const INITIAL_REPORTS: SightingReport[] = [
  {
    id: 'rep-001',
    caseNumber: 'NE-2026-0419',
    title: 'Luminous Chevron with Pulsing Blue Halo over Offutt AFB South Perimeter',
    description: 'Observed a silent, chevron-shaped craft gliding silently from the south towards the Offutt Air Force Base airspace at approximately 1,800 feet. The object had five faint amber illumination points along the trailing wing edge and a faint, pulsating blue halo around the leading apex. No jet wash, rotor sound, or FAA strobe beacons were present. It maintained a constant 45-knot velocity before making an instantaneous 90-degree vector change eastward across the Missouri River towards Mills County, Iowa.',
    date: '2026-10-24',
    time: '21:42 CST',
    location: {
      address: 'Near Fort Crook Rd S & Capehart Rd',
      city: 'Bellevue',
      state: 'NE',
      zip: '68123',
      lat: 41.1124,
      lng: -95.9182,
      landmarkProximity: '1.4 miles S of Offutt AFB runway 12/30'
    },
    witness: {
      name: 'Michael R. Henderson',
      email: 'm.henderson82@gmail.com',
      phone: '(402) 555-0193',
      occupation: 'Aviation Avionics Technician (Retired)',
      isAnonymous: true,
      redactedName: 'Witness A (Bellevue Resident / Avionics Tech)'
    },
    classification: {
      hynek: 'NL',
      valleeCategory: 'MA1 (Maneuver / Trajectory Change)',
      shape: 'Chevron',
      duration: '4 minutes 20 seconds',
      color: 'Matte dark slate with amber nodes and cyan glow',
      estimatedAltitude: '1,800 ft AGL',
      estimatedSpeed: '45 kts cruise, instantaneous acceleration > 400 kts',
      sound: 'Completely silent in calm wind conditions'
    },
    conditions: {
      weather: 'Clear, 54°F',
      visibility: '10+ miles',
      moonPhase: 'Waxing Gibbous (72% illumination)',
      cloudCover: '0% scattered'
    },
    status: 'pending',
    moderationNotes: 'High-credibility witness with avionics background. Witness requested anonymity on public website. Needs radar log cross-check with Offutt AFB control tower and Omaha TRACON.',
    credibilityScore: 92,
    assignedInvestigatorId: 'usr-002',
    assignedInvestigatorName: 'David Miller (Senior FI)',
    fieldNotes: [
      {
        id: 'fn-101',
        author: 'Sarah Vance (Moderator)',
        timestamp: '2026-10-25 09:15',
        note: 'Intake triage completed. Initial flight radar check shows no transponder returns on ADS-B Exchange at 21:40-21:46 CST.',
        type: 'internal'
      },
      {
        id: 'fn-102',
        author: 'David Miller (Senior FI)',
        timestamp: '2026-10-25 14:30',
        note: 'Witness contacted via telephone. Description is meticulous. Two additional neighbors reported a momentary television RF flicker at 21:43.',
        type: 'interview'
      }
    ],
    media: [
      {
        id: 'med-01',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Night sky capture facing south towards Offutt AFB corridor with enhanced exposure',
        exifData: {
          camera: 'Sony Alpha 7 IV',
          iso: '6400',
          exposure: '1/4 sec',
          focalLength: '85mm f/1.8',
          timestamp: '2026-10-24 21:43:12 CST',
          gpsCoords: '41.1124° N, 95.9182° W'
        }
      }
    ],
    isPublishedToPublic: false,
    createdAt: '2026-10-25T03:15:00Z',
    updatedAt: '2026-10-25T14:30:00Z'
  },
  {
    id: 'rep-002',
    caseNumber: 'NE-2026-0412',
    title: 'Silent Metallic Tic-Tac Object Hovering against 35kt Winds at Standing Bear Lake',
    description: 'While walking dogs along the north loop trail of Standing Bear Lake in Northwest Omaha, noticed a smooth, oblong white capsule with no visible wings, control surfaces, seams, or exhaust plume. The object hung stationary over the center of the lake for over 9 minutes despite gusty 35 mph northwesterly winds. Suddenly accelerated vertically at an extreme climb rate without producing any sonic boom.',
    date: '2026-10-18',
    time: '15:10 CST',
    location: {
      address: '6404 N 132nd St',
      city: 'Omaha',
      state: 'NE',
      zip: '68164',
      lat: 41.3204,
      lng: -96.1215,
      landmarkProximity: 'Directly over Standing Bear Lake Reservoir'
    },
    witness: {
      name: 'Dr. Gregory Vance',
      email: 'gvance.ne@gmail.com',
      phone: '(402) 555-8492',
      occupation: 'Biophysicist, UNMC',
      isAnonymous: false,
      redactedName: 'Dr. Gregory Vance (Northwest Omaha)'
    },
    classification: {
      hynek: 'DD',
      valleeCategory: 'FB1 (Flyby / Stationary Hover)',
      shape: 'Tic-Tac',
      duration: '9 minutes 45 seconds',
      color: 'Matte bright white / porcelain finish',
      estimatedAltitude: '900 ft AGL',
      estimatedSpeed: 'Stationary hover, then vertical ascent > Mach 2',
      sound: 'Absolute silence'
    },
    conditions: {
      weather: 'Partly cloudy, 48°F, NW winds 28-35 mph gusting',
      visibility: '15 miles',
      moonPhase: 'First Quarter',
      cloudCover: '25% altocumulus'
    },
    status: 'approved',
    moderationNotes: 'Case verified by Field Investigation team. Weather records confirm 34 kt sustained winds; stationary hover without drift eliminates standard weather balloons or tethered blimps.',
    credibilityScore: 96,
    assignedInvestigatorId: 'usr-004',
    assignedInvestigatorName: 'Dr. Aris Thorne (Scientific Advisor)',
    fieldNotes: [
      {
        id: 'fn-201',
        author: 'Dr. Aris Thorne',
        timestamp: '2026-10-19 11:00',
        note: 'Site inspection conducted at Standing Bear Lake. No ground traces due to altitude of object. Wind meter data from Millard Airport cross-referenced.',
        type: 'site_visit'
      }
    ],
    media: [
      {
        id: 'med-02',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        caption: 'Telephoto daylight frame showing smooth oblong target against broken cloud layer',
        exifData: {
          camera: 'Canon EOS R6 Mark II',
          iso: '400',
          exposure: '1/2000 sec',
          focalLength: '300mm f/4',
          timestamp: '2026-10-18 15:14:02 CST'
        }
      }
    ],
    isPublishedToPublic: true,
    createdAt: '2026-10-18T22:00:00Z',
    updatedAt: '2026-10-20T16:15:00Z'
  },
  {
    id: 'rep-003',
    caseNumber: 'NE-2026-0388',
    title: 'Linear Train of 22 Bright Pearls in Synchronized Northwest Track',
    description: 'Witness reported a rigid straight line of evenly spaced glowing white lights marching across the zenith from southwest to northeast. Lasted approximately 3 minutes before dimming uniformly as they entered the Earth shadow.',
    date: '2026-10-12',
    time: '20:05 CST',
    location: {
      address: 'Shadow Lake Towne Center area',
      city: 'Papillion',
      state: 'NE',
      zip: '68046',
      lat: 41.1345,
      lng: -96.0354,
      landmarkProximity: 'Shadow Lake Amphitheater'
    },
    witness: {
      name: 'Jessica Thorne',
      email: 'j.thorne.ne@outlook.com',
      phone: '(402) 555-7312',
      isAnonymous: true,
      redactedName: 'Witness (Papillion Resident)'
    },
    classification: {
      hynek: 'NL',
      shape: 'Light Cluster',
      duration: '3 minutes',
      color: 'Uniform bright white',
      estimatedAltitude: 'Low Earth Orbit (~550 km)',
      estimatedSpeed: 'Orbital velocity ~17,500 mph',
      sound: 'None'
    },
    conditions: {
      weather: 'Clear, 61°F',
      visibility: '10 miles',
      moonPhase: 'Waxing Crescent',
      cloudCover: '0%'
    },
    status: 'rejected',
    rejectionReason: 'Identified as Starlink',
    moderationNotes: 'Resolved as Starlink Group 10-12 train. SpaceX launch confirmed 2 days prior. Heavens-Above ephemeris confirms direct pass over Omaha coordinates at 20:04-20:08 CST with visual magnitude +1.8.',
    credibilityScore: 35,
    assignedInvestigatorId: 'usr-003',
    assignedInvestigatorName: 'Sarah Vance (Moderator)',
    fieldNotes: [
      {
        id: 'fn-301',
        author: 'Sarah Vance',
        timestamp: '2026-10-12 21:30',
        note: 'Cross-referenced CelesTrak TLE orbital elements. Precise match for Starlink train. Courteous explanation email sent to witness.',
        type: 'internal'
      }
    ],
    media: [],
    isPublishedToPublic: false,
    createdAt: '2026-10-12T20:45:00Z',
    updatedAt: '2026-10-12T21:35:00Z'
  },
  {
    id: 'rep-004',
    caseNumber: 'NE-2026-0371',
    title: 'Massive Dark Trilateral Craft with Amber Ventral Node over Platte River Corridor',
    description: 'Witness was driving westbound along Highway 66 near Platte River State Park when their vehicle FM radio experienced loud cyclic static. Looked up through the windshield to see a gigantic equilateral triangle spanning an estimated 250 feet across, passing just above the tree canopy (under 300 feet). A deep, resonant low-frequency hum was felt in the witness chest. The craft featured three soft white lights at the vertices and a swirling amber node in the center.',
    date: '2026-09-28',
    time: '23:14 CST',
    location: {
      address: 'Hwy 66 & 346th St near Platte River State Park',
      city: 'Louisville / Sarpy County border',
      state: 'NE',
      zip: '68037',
      lat: 41.0182,
      lng: -96.2198,
      landmarkProximity: 'Platte River Valley ridge'
    },
    witness: {
      name: 'Bradley M. Jensen',
      email: 'bjensen_trucking@yahoo.com',
      phone: '(402) 555-4421',
      occupation: 'Commercial Logistics Driver',
      isAnonymous: true,
      redactedName: 'Witness C (Commercial Driver / Sarpy Co.)'
    },
    classification: {
      hynek: 'CE-I',
      valleeCategory: 'CE1 (Close Encounter <500 ft)',
      shape: 'Triangle',
      duration: '1 minute 45 seconds',
      color: 'Non-reflective matte obsidian with amber center',
      estimatedAltitude: '250-300 ft AGL',
      estimatedSpeed: '25-30 mph crawl',
      sound: 'Low-frequency sub-bass hum, radio electromagnetic static'
    },
    conditions: {
      weather: 'Calm, 58°F, misty river valley',
      visibility: '6 miles',
      moonPhase: 'Full Moon (98% illumination)',
      cloudCover: '10% low valley mist'
    },
    status: 'approved',
    moderationNotes: 'High-significance Close Encounter (CE-I). Full field investigation conducted by David Miller. Second independent witness confirmed identical sighting 4 miles downriver at Mahoney State Park.',
    credibilityScore: 98,
    assignedInvestigatorId: 'usr-002',
    assignedInvestigatorName: 'David Miller (Senior FI)',
    fieldNotes: [
      {
        id: 'fn-401',
        author: 'David Miller',
        timestamp: '2026-09-29 10:15',
        note: 'Witness interview recorded. In-person visit to exact GPS coordinates on Hwy 66. Electromagnetic sweep did not show residual magnetic field on roadside vegetation.',
        type: 'site_visit'
      },
      {
        id: 'fn-402',
        author: 'Dr. Aris Thorne',
        timestamp: '2026-09-30 16:00',
        note: 'Correlated with second witness report NE-2026-0372. Trajectory matches west-to-east path following the river topography.',
        type: 'internal'
      }
    ],
    media: [
      {
        id: 'med-04',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        caption: 'Platte River valley crossing site where the electromagnetic radio disruption occurred',
        exifData: {
          camera: 'iPhone 15 Pro Max',
          iso: '1600',
          exposure: '1/15 sec',
          timestamp: '2026-09-29 10:40:00 CST'
        }
      }
    ],
    isPublishedToPublic: true,
    createdAt: '2026-09-29T02:30:00Z',
    updatedAt: '2026-10-01T12:00:00Z'
  },
  {
    id: 'rep-005',
    caseNumber: 'NE-2026-0354',
    title: 'Rapidly Maneuvering Golden Spherical Light over Gene Leahy Mall & RiverFront',
    description: 'Witness seated at the RiverFront park overlooking the Bob Kerrey Pedestrian Bridge noticed a brilliant golden orb hovering at roughly 600 feet above the river. It performed multiple rapid zig-zag maneuvers before accelerating south towards Bellevue.',
    date: '2026-09-14',
    time: '22:30 CST',
    location: {
      address: '1001 Douglas St (Gene Leahy Mall / RiverFront)',
      city: 'Omaha',
      state: 'NE',
      zip: '68102',
      lat: 41.2586,
      lng: -95.9312,
      landmarkProximity: 'Bob Kerrey Pedestrian Bridge / Missouri River'
    },
    witness: {
      name: 'Elena Rostova',
      email: 'e.rostova.art@gmail.com',
      phone: '(402) 555-9011',
      occupation: 'Graphic Designer',
      isAnonymous: false,
      redactedName: 'Elena Rostova (Downtown Omaha)'
    },
    classification: {
      hynek: 'NL',
      shape: 'Sphere',
      duration: '2 minutes',
      color: 'Warm radiant gold / amber',
      estimatedAltitude: '600 ft AGL',
      estimatedSpeed: 'Hover to ~250 mph',
      sound: 'None'
    },
    conditions: {
      weather: 'Clear, 68°F',
      visibility: '10 miles',
      moonPhase: 'Waxing Crescent',
      cloudCover: '5%'
    },
    status: 'pending',
    moderationNotes: 'Under review. Checking if local drone show or permitted light projection was occurring at Heartland of America Park.',
    credibilityScore: 75,
    assignedInvestigatorId: 'usr-003',
    assignedInvestigatorName: 'Sarah Vance (Moderator)',
    fieldNotes: [
      {
        id: 'fn-501',
        author: 'Sarah Vance',
        timestamp: '2026-09-15 13:00',
        note: 'Submitted inquiry to Omaha Parks & Recreation to verify drone permits for Sept 14th evening.',
        type: 'internal'
      }
    ],
    media: [
      {
        id: 'med-05',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
        caption: 'Downtown Omaha skyline view near Gene Leahy Mall',
        exifData: {
          camera: 'Google Pixel 8 Pro',
          iso: '800',
          exposure: '1/30 sec',
          timestamp: '2026-09-14 22:31:05 CST'
        }
      }
    ],
    isPublishedToPublic: false,
    createdAt: '2026-09-15T04:00:00Z',
    updatedAt: '2026-09-15T13:00:00Z'
  },
  {
    id: 'rep-006',
    caseNumber: 'NE-2026-0340',
    title: 'High-Altitude Daylight Cylinder Crossing Eppley Commercial Arrival Corridor',
    description: 'Private pilot flying a Cessna 172 at 4,500 ft MSL inbound to Council Bluffs Municipal Airport (KCBF) visually acquired a polished silver cylindrical object at approximately 12,000 ft moving southwest. Object had no visible contrail, wings, or vertical stabilizer.',
    date: '2026-08-30',
    time: '11:22 CST',
    location: {
      address: 'Airspace over Missouri River corridor',
      city: 'Council Bluffs / Omaha border',
      state: 'IA/NE',
      zip: '51503',
      lat: 41.2612,
      lng: -95.8503,
      landmarkProximity: '8 nautical miles ESE of Eppley Airfield (KOMA)'
    },
    witness: {
      name: 'Capt. Thomas Albright',
      email: 't.albright.fly@gmail.com',
      phone: '(712) 555-3211',
      occupation: 'FAA Commercial Multi-Engine Pilot & Flight Instructor',
      isAnonymous: true,
      redactedName: 'Witness (FAA Certified Commercial Pilot)'
    },
    classification: {
      hynek: 'DD',
      shape: 'Cylinder / Cigar',
      duration: '45 seconds',
      color: 'Brushed aluminum / reflective chrome',
      estimatedAltitude: '12,000 ft MSL',
      estimatedSpeed: '450 knots estimated',
      sound: 'Cockpit ambient noise only'
    },
    conditions: {
      weather: 'CAVOK (Ceiling and Visibility OK), 74°F',
      visibility: '20+ miles',
      moonPhase: 'Daylight',
      cloudCover: '0%'
    },
    status: 'approved',
    moderationNotes: 'Aviation case verified. Omaha TRACON radar playback requested via FOIA. Pilot witness holds over 3,200 flight hours.',
    credibilityScore: 97,
    assignedInvestigatorId: 'usr-002',
    assignedInvestigatorName: 'David Miller (Senior FI)',
    fieldNotes: [
      {
        id: 'fn-601',
        author: 'David Miller',
        timestamp: '2026-08-31 09:00',
        note: 'Pilot debrief completed. Corroborated with FAA flight plan records. Aircraft transponder did not log TCAS collision alert, indicating target had no active Mode S transponder.',
        type: 'interview'
      }
    ],
    media: [],
    isPublishedToPublic: true,
    createdAt: '2026-08-30T18:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z'
  },
  {
    id: 'rep-007',
    caseNumber: 'NE-2026-0421',
    title: '[DRAFT] Incomplete Voice Debrief: Amber Nodes along I-80 Gretna Corridor',
    description: 'Initial phone intake notes: Motorist observed two amber glowing objects trailing a westbound commercial airliner at ~6,000 ft near I-80 Exit 432 (Gretna / Hwy 31). Witness phone line disconnected during initial narrative. Awaiting follow-up callback and smartphone video footage before promoting to active triage queue.',
    date: '2026-10-27',
    time: '20:15 CST',
    location: {
      address: 'I-80 & Hwy 31 Interchange',
      city: 'Gretna',
      state: 'NE',
      zip: '68028',
      lat: 41.1394,
      lng: -96.2415,
      landmarkProximity: '1.2 miles S of Gretna Outlet Mall'
    },
    witness: {
      name: 'James K. (Partial Intake)',
      email: 'jk_nebraska@gmail.com',
      phone: '(402) 555-6671',
      isAnonymous: true,
      redactedName: 'Witness (Gretna Resident)'
    },
    classification: {
      hynek: 'NL',
      shape: 'Light Cluster',
      duration: 'Incomplete (~2 min reported)',
      color: 'Amber / Orange',
      estimatedAltitude: '6,000 ft estimated',
      estimatedSpeed: 'Matching airliner (~250 kts)',
      sound: 'Unknown / inside vehicle'
    },
    conditions: {
      weather: 'Clear, 52°F',
      visibility: '10 miles',
      moonPhase: 'Waning Gibbous',
      cloudCover: '15%'
    },
    status: 'draft',
    moderationNotes: 'DRAFT MODE: Incomplete intake. Field investigator callback scheduled for tomorrow evening. Hidden from public and main active queue.',
    credibilityScore: 60,
    assignedInvestigatorId: 'usr-002',
    assignedInvestigatorName: 'David Miller (Senior FI)',
    fieldNotes: [
      {
        id: 'fn-701',
        author: 'David Miller',
        timestamp: '2026-10-27 20:45',
        note: 'Left voicemail with witness requesting raw video file recorded on iPhone.',
        type: 'internal'
      }
    ],
    media: [],
    isPublishedToPublic: false,
    createdAt: '2026-10-27T20:30:00Z',
    updatedAt: '2026-10-27T20:45:00Z'
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-001',
    name: 'Matt Hagen',
    email: 'mattjhagen0@gmail.com',
    role: 'admin',
    status: 'active',
    badgeNumber: 'NE-001',
    phone: '(402) 555-0100',
    assignedCasesCount: 4,
    dateJoined: '2024-01-15',
    lastLogin: '2026-10-29 13:45 CST'
  },
  {
    id: 'usr-002',
    name: 'David Miller',
    email: 'd.miller@mufonnebraska.org',
    role: 'field_investigator',
    status: 'active',
    badgeNumber: 'NE-014',
    phone: '(402) 555-0144',
    assignedCasesCount: 3,
    dateJoined: '2024-03-20',
    lastLogin: '2026-10-29 11:20 CST'
  },
  {
    id: 'usr-003',
    name: 'Sarah Vance',
    email: 's.vance@mufonomaha.space',
    role: 'moderator',
    status: 'active',
    badgeNumber: 'NE-022',
    phone: '(402) 555-0189',
    assignedCasesCount: 2,
    dateJoined: '2024-07-10',
    lastLogin: '2026-10-29 12:10 CST'
  },
  {
    id: 'usr-004',
    name: 'Dr. Aris Thorne',
    email: 'a.thorne@unomaha.edu',
    role: 'field_investigator',
    status: 'active',
    badgeNumber: 'NE-009',
    phone: '(402) 555-0199',
    assignedCasesCount: 1,
    dateJoined: '2024-09-01',
    lastLogin: '2026-10-27 16:30 CST'
  },
  {
    id: 'usr-005',
    name: 'Marcus Reed',
    email: 'm.reed.field@gmail.com',
    role: 'reporter',
    status: 'active',
    phone: '(402) 555-0211',
    assignedCasesCount: 0,
    dateJoined: '2025-02-14',
    lastLogin: '2026-10-24 20:00 CST'
  },
  {
    id: 'usr-006',
    name: 'Linda Kowalski',
    email: 'l.kowalski@cox.net',
    role: 'reporter',
    status: 'disabled',
    phone: '(402) 555-0312',
    assignedCasesCount: 0,
    dateJoined: '2025-05-18',
    lastLogin: '2026-08-11 09:12 CST'
  }
];

export const INITIAL_ANNOUNCEMENTS: PublicAnnouncement[] = [
  {
    id: 'ann-01',
    title: 'Monthly Omaha MUFON Meeting: Radar Correlation in Nebraska UAP Cases',
    category: 'meeting',
    date: 'Saturday, November 14, 2026 · 1:00 PM CST',
    location: 'W. Dale Clark Main Library & Live Hybrid Zoom',
    zoomLink: 'https://zoom.us/j/9482019482',
    content: 'Join Chief Field Investigator David Miller as we analyze primary radar returns from Eppley TRACON and Offutt Air Force Base during recent tri-county observations. Open to the public and all registered members.',
    isPublished: true
  },
  {
    id: 'ann-02',
    title: 'Field Investigation Protocol Training Workshop (Fall 2026)',
    category: 'workshop',
    date: 'Saturday, December 5, 2026 · 10:00 AM CST',
    location: 'Chalco Hills Recreation Center, Papillion NE',
    content: 'Hands-on training in physical trace sampling, soil core collection, triangulation mathematics, and witness interview techniques for prospective Field Investigators.',
    isPublished: true
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-29 13:42:15 CST',
    actor: {
      id: 'usr-001',
      name: 'Matt Hagen',
      email: 'mattjhagen0@gmail.com',
      role: 'admin'
    },
    action: 'APPROVE_REPORT',
    targetType: 'sighting_report',
    targetId: 'rep-002',
    targetLabel: 'Case NE-2026-0412 (Standing Bear Lake)',
    details: 'Approved report for publication on mufonomaha.space. Witness identity sanitized as Dr. Gregory Vance (Northwest Omaha).',
    previousValue: 'Status: PENDING',
    newValue: 'Status: APPROVED (Public Sync Active)',
    severity: 'info'
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-29 11:15:30 CST',
    actor: {
      id: 'usr-001',
      name: 'Matt Hagen',
      email: 'mattjhagen0@gmail.com',
      role: 'admin'
    },
    action: 'UPDATE_USER_ROLE',
    targetType: 'user',
    targetId: 'usr-002',
    targetLabel: 'User: David Miller',
    details: 'Elevated user role to Field Investigator with badge credentials NE-014. Granted access to unredacted witness contact telemetry.',
    previousValue: 'Role: REPORTER',
    newValue: 'Role: FIELD_INVESTIGATOR',
    severity: 'warning'
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-28 16:50:00 CST',
    actor: {
      id: 'usr-001',
      name: 'Matt Hagen',
      email: 'mattjhagen0@gmail.com',
      role: 'admin'
    },
    action: 'TOGGLE_USER_STATUS',
    targetType: 'user',
    targetId: 'usr-006',
    targetLabel: 'User: Linda Kowalski',
    details: 'Account disabled due to prolonged inactivity (>12 months) and failed bounce notifications. Revoked all active session tokens.',
    previousValue: 'Status: ACTIVE',
    newValue: 'Status: DISABLED',
    severity: 'warning'
  },
  {
    id: 'aud-004',
    timestamp: '2026-10-26 18:22:10 CST',
    actor: {
      id: 'usr-003',
      name: 'Sarah Vance',
      email: 's.vance@mufonomaha.space',
      role: 'moderator'
    },
    action: 'REJECT_REPORT',
    targetType: 'sighting_report',
    targetId: 'rep-003',
    targetLabel: 'Case NE-2026-0388 (Papillion)',
    details: 'Classified report as IFO: Identified as Starlink Group 10-12 orbital satellite pass. Courtesy explanation notification dispatched to witness.',
    previousValue: 'Status: PENDING',
    newValue: 'Status: REJECTED (IFO: Identified as Starlink)',
    severity: 'info'
  },
  {
    id: 'aud-005',
    timestamp: '2026-10-25 14:35:40 CST',
    actor: {
      id: 'usr-001',
      name: 'Matt Hagen',
      email: 'mattjhagen0@gmail.com',
      role: 'admin'
    },
    action: 'RESET_PASSWORD',
    targetType: 'user',
    targetId: 'usr-005',
    targetLabel: 'User: Marcus Reed',
    details: 'Initiated administrator password reset. Generated temporary 16-character secure credential with 24-hour expiration token.',
    severity: 'info'
  },
  {
    id: 'aud-006',
    timestamp: '2026-10-25 03:20:10 CST',
    actor: {
      id: 'usr-003',
      name: 'Sarah Vance',
      email: 's.vance@mufonomaha.space',
      role: 'moderator'
    },
    action: 'EDIT_REPORT',
    targetType: 'sighting_report',
    targetId: 'rep-001',
    targetLabel: 'Case NE-2026-0419 (Bellevue / Offutt AFB)',
    details: 'Updated classification coordinates and added witness anonymity flag per witness request. Assigned Senior FI David Miller.',
    severity: 'info'
  }
];

