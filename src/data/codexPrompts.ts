export interface CodexTemplate {
  id: string;
  title: string;
  category: 'complete_backend' | 'user_management' | 'sighting_moderation' | 'subdomain_routing' | 'database_schema';
  description: string;
  prompt: string;
}

export const CODEX_PROMPTS: CodexTemplate[] = [
  {
    id: 'master-backend-prompt',
    title: 'Master Codex Prompt: Full Admin Backend for Omaha MUFON (admin.mufonomaha.space)',
    category: 'complete_backend',
    description: 'The complete, production-ready specification prompt to give OpenAI Codex / GitHub Copilot / Cursor to integrate the full admin moderation & user management backend into Mattjhagen/OmahaMufonRevised.',
    prompt: `You are an expert full-stack TypeScript engineer working on the Omaha MUFON website repository (https://github.com/Mattjhagen/OmahaMufonRevised), hosted at https://mufonomaha.space/.

OBJECTIVE:
Build a secure, high-performance admin backend accessible at the subdomain 'admin.mufonomaha.space' that allows administrators to moderate UFO sighting submissions, manage users, and control public site data for the Omaha MUFON chapter.

---

### 1. ARCHITECTURE & SUBDOMAIN ROUTING
- Primary Domain: 'mufonomaha.space' (Public website: sightings feed, monthly meetings, reporting form).
- Admin Subdomain: 'admin.mufonomaha.space' (Restricted admin & field investigator moderation portal).
- Multi-Tenant / Subdomain Handling:
  - Implement Next.js / Express middleware that inspects the 'host' header ('admin.mufonomaha.space' or local 'admin.localhost:3000').
  - Route all requests on the admin subdomain through the '/admin' route group, isolated from the public layout.
  - Enforce authentication and CORS headers allowing the admin subdomain to communicate with the shared database and API.

---

### 2. CORE SPECIFICATIONS & REQUIREMENTS

#### A. UFO Sighting Reports Moderation System
1. **View All Reports**: Paginated, filterable table & cards displaying all submitted cases.
2. **Filter by Status**: 'pending' (new public submissions), 'approved' (published to public site), 'rejected' (identified IFO, hoax, or insufficient data).
3. **Approve / Reject Actions**:
   - Approving a report toggles 'isPublishedToPublic = true' and sanitizes witness PII (anonymizing witness name/contact into 'Witness [City] Resident').
   - Rejecting a report requires selecting a disposition reason ('Identified as Starlink', 'Identified as Aircraft / Drone', 'Astronomical / Venus', 'Military Flight (Offutt AFB)', 'Insufficient Evidence', 'Hoax / Fabricated').
4. **Edit Existing Report Details**:
   - Ability to modify Title, Witness Narrative, Hynek Scale ('NL', 'DD', 'RV', 'CE-I', 'CE-II', 'CE-III', 'CE-IV', 'CE-V'), Object Shape, Date/Time, Location, Elevation, and Credibility Score (0-100).
   - Add Field Notes with timestamps, author attribution, and categories (interview, radar check, site visit).
5. **Add New Reports Manually**:
   - An intake form for phone calls, mail-in reports, or field submissions received directly by Omaha MUFON investigators.

#### B. User & Field Investigator Management System
1. **User Roster**: Table of all registered users displaying Name, Email, Role, Status, Badge Number (for certified FIs), Cases Assigned, and Last Login.
2. **Search & Filter**: Search by name or email; filter by role ('admin', 'moderator', 'field_investigator', 'reporter') and status ('active', 'disabled').
3. **Account Enable / Disable**: Toggle user account active status with instant session invalidation for disabled users.
4. **Password Reset**: Generate secure temporary password or password reset token with automated email dispatch.
5. **Role-Based Access Control (RBAC)**:
   - 'admin': Full access to all settings, user management, and report moderation.
   - 'moderator': Can triage, approve, reject, and redact sighting reports.
   - 'field_investigator': Can be assigned to cases, view full witness PII, and append field investigation notes.
   - 'reporter': Read-only access to their own submitted reports.

---

### 3. DATABASE SCHEMA (Prisma ORM / PostgreSQL)

\`\`\`prisma
enum ReportStatus {
  PENDING
  APPROVED
  REJECTED
}

enum HynekScale {
  NL      // Nocturnal Light
  DD      // Daylight Disc
  RV      // Radar-Visual
  CE_I    // Close Encounter 1st Kind
  CE_II   // Close Encounter 2nd Kind (physical/EM traces)
  CE_III  // Close Encounter 3rd Kind (occupants)
  CE_IV   // Close Encounter 4th Kind (abduction)
  CE_V    // Close Encounter 5th Kind (contact)
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
  updatedAt       DateTime       @updatedAt
}

model SightingReport {
  id                   String        @id @default(cuid())
  caseNumber           String        @unique // e.g., "NE-2026-0419"
  title                String
  description          String        @db.Text
  date                 DateTime
  timeString           String        // e.g. "21:42 CST"
  
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
  redactedName         String        // Public anonymized label
  
  // MUFON Classification
  hynekCategory        HynekScale    @default(NL)
  valleeCategory       String?
  shape                String
  duration             String
  color                String
  estimatedAltitude    String
  estimatedSpeed       String
  sound                String
  
  // Status & Triage
  status               ReportStatus  @default(PENDING)
  rejectionReason      String?
  moderationNotes      String?       @db.Text
  credibilityScore     Int           @default(70)
  isPublishedToPublic  Boolean       @default(false)
  
  // Relationships
  assignedInvestigatorId String?
  assignedInvestigator   User?       @relation("AssignedInvestigator", fields: [assignedInvestigatorId], references: [id])
  fieldNotes             FieldNote[]
  media                  MediaEvidence[]
  
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

model MediaEvidence {
  id          String         @id @default(cuid())
  reportId    String
  report      SightingReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  type        String         // "image", "video", "radar"
  url         String
  caption     String?
  exifData    Json?
  createdAt   DateTime       @default(now())
}
\`\`\`

---

### 4. REST API ROUTES TO IMPLEMENT
1. \`GET /api/admin/reports?status=pending&page=1\` - Returns paginated reports with search and filter.
2. \`POST /api/admin/reports\` - Manually intake a new sighting report.
3. \`GET /api/admin/reports/:id\` - Full case details including unredacted witness info and media.
4. \`PUT /api/admin/reports/:id\` - Update report details and classifications.
5. \`PATCH /api/admin/reports/:id/status\` - Approve or reject report (body: { status: 'approved' | 'rejected', reason?: string, moderationNotes?: string }).
6. \`POST /api/admin/reports/:id/notes\` - Append a field investigation note.
7. \`GET /api/admin/users?role=&status=&q=\` - Returns user accounts.
8. \`PATCH /api/admin/users/:id/role\` - Update user role (admin only).
9. \`PATCH /api/admin/users/:id/status\` - Enable or disable user account.
10. \`POST /api/admin/users/:id/reset-password\` - Trigger temporary password reset.
11. \`GET /api/public/sightings\` - Public endpoint consumed by 'mufonomaha.space' returning ONLY approved reports with REDACTED witness info.

---

### 5. IMPLEMENTATION GUIDELINES
- Strict TypeScript with zero \`any\` types.
- Password hashing with \`argon2\` or \`bcrypt\`.
- Authentication using NextAuth.js / Auth.js or HTTP-only JWT cookies with session expiration.
- UI built with Tailwind CSS, Lucide icons, and responsive layouts matching Omaha MUFON's investigative identity (dark mode, crisp typography, radar styling).
- Write comprehensive unit & integration tests for report status transitions and PII redaction security.`
  },
  {
    id: 'user-management-prompt',
    title: 'Codex Prompt: User Management & Role-Based Access Control',
    category: 'user_management',
    description: 'Targeted prompt for implementing user list, search/filter, enable/disable status toggle, password reset generator, and role hierarchy (Admin, Moderator, Field Investigator, Reporter).',
    prompt: `You are implementing the User Management subsystem for the Omaha MUFON Admin Portal at 'admin.mufonomaha.space'.

Create the complete user management interface and API routes with the following features:
1. **User List View**:
   - Table displaying Name, Email, Role badge, Account Status (Active/Disabled), Assigned Cases count, Badge Number (for Field Investigators like "NE-014"), and Last Active timestamp.
2. **Search & Filters**:
   - Instant search by Name or Email address.
   - Filter dropdowns by Role ('all', 'admin', 'moderator', 'field_investigator', 'reporter').
   - Filter by Account Status ('all', 'active', 'disabled').
3. **Account State Toggle**:
   - Toggle button to enable/disable user accounts.
   - When disabled: revoke active session tokens immediately and prevent authentication with a friendly "Account suspended by chapter administrator" message.
4. **Password Reset Flow**:
   - Action button "Reset Password".
   - Generates a cryptographically random 16-character temporary password or one-time reset link.
   - Displays temporary password modal with one-click copy and confirmation dialog before sending notification email.
5. **Role Assignment**:
   - Dropdown or selector allowing administrators to reassign user roles.
   - Enforce hierarchy: Only 'admin' users can reassign roles or modify other administrators.
   - Roles:
     - 'admin': Full administrative control over users, settings, and site data.
     - 'moderator': Review sighting queue, approve/reject reports, edit witness redactions.
     - 'field_investigator': View assigned cases, access witness phone/email, write field notes.
     - 'reporter': Regular member; can only submit reports and view public sightings.

Provide the complete React + Tailwind component, Next.js server actions / API endpoints, and Prisma schema updates.`
  },
  {
    id: 'sighting-moderation-prompt',
    title: 'Codex Prompt: Sighting Report Triage, PII Redaction & Public Sync',
    category: 'sighting_moderation',
    description: 'Targeted prompt for the sighting queue, approve/reject workflow, manual report intake form, and automatic witness PII redaction engine.',
    prompt: `You are implementing the UFO Sighting Moderation & Witness Redaction system for Omaha MUFON (admin.mufonomaha.space).

Implement the following features:
1. **Report Queue & Triage**:
   - Tabbed view: Pending Triage (${'pending'}), Approved & Public (${'approved'}), Rejected / Identified (${'rejected'}).
   - Hynek Scale indicators: NL (Nocturnal Light), DD (Daylight Disc), RV (Radar-Visual), CE-I to CE-V.
   - Anomaly / Credibility Score slider (0-100).
2. **Approve / Reject Pipeline**:
   - 'Approve & Publish': Sets status to 'approved', sets 'isPublishedToPublic = true', triggers public feed revalidation on 'mufonomaha.space'.
   - 'Reject': Opens rejection dialog with mandatory categorized reasons (Identified as Starlink, Drone, Aircraft / Offutt AFB, Astronomical Venus/Meteor, Insufficient Evidence, Hoax).
3. **Witness PII Auto-Redaction**:
   - Provide a button 'Redact Witness PII'.
   - Automatically sanitizes private fields (replaces full witness name with anonymized string e.g. "Witness (Bellevue Resident)", hides phone & personal email from public JSON response).
4. **Manual Sighting Intake Form**:
   - Modal or page for phone-in or field-submitted sightings: Case number auto-generator ('NE-YYYY-XXXX'), Title, Witness details, Date/Time, Coordinates / Address, Shape, Description, Photo uploads.
5. **Field Notes System**:
   - Append chronologically sorted field notes with author, timestamp, and note type (interview, radar log check, site visit).

Return clean, production-ready TypeScript code with React hooks and Tailwind CSS.`
  },
  {
    id: 'subdomain-routing-prompt',
    title: 'Codex Prompt: Subdomain Architecture & Cloudflare / Nginx DNS Setup',
    category: 'subdomain_routing',
    description: 'Infrastructure and routing prompt for configuring admin.mufonomaha.space alongside mufonomaha.space with SSL, cookies, and CORS.',
    prompt: `You are configuring the subdomain architecture for 'admin.mufonomaha.space' and 'mufonomaha.space'.

Provide the complete configuration files and code:
1. **Next.js 15 Middleware / Subdomain Routing**:
   - Create \`src/middleware.ts\` that inspects \`request.headers.get('host')\`.
   - If hostname matches \`admin.mufonomaha.space\` (or \`admin.localhost:3000\` in dev), rewrite request to \`/admin\`.
   - Protect all \`/admin\` routes with session cookie verification; redirect unauthenticated visitors to \`/admin/login\`.
2. **CORS & Cookie Domain**:
   - Configure session cookies with \`domain: '.mufonomaha.space'\` so authentication can optionally span subdomains if needed, or isolate to \`admin.mufonomaha.space\`.
3. **Cloudflare / DNS Configuration**:
   - CNAME record for \`admin\` pointing to root domain or Vercel/Cloud Run deployment target.
   - SSL/TLS settings for multi-level subdomain certificates.
4. **Nginx / Reverse Proxy Config**:
   - Production Nginx server blocks for \`mufonomaha.space\` and \`admin.mufonomaha.space\` with HTTP/2 and WebSocket support.

Provide the exact code files with detailed comments.`
  }
];
