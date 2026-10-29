import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client if key is present
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// API: AI Sighting Investigation & Triage Analysis
app.post('/api/analyze-sighting', async (req, res) => {
  try {
    const { title, description, timestamp, location, shape, duration } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Fallback heuristics if API key is not yet set
      const isNight = timestamp ? timestamp.includes('21:') || timestamp.includes('22:') || timestamp.includes('23:') || timestamp.includes('00:') || timestamp.includes('01:') || timestamp.includes('02:') || timestamp.includes('03:') : true;
      const lower = (description || '').toLowerCase();
      
      let preliminaryHypothesis = "Unexplained aerial light source requiring field investigator interview.";
      let potentialIFO = "None immediately apparent; flight log cross-reference recommended.";
      let hynekCategory = isNight ? "NL (Nocturnal Light)" : "DD (Daylight Disc)";
      let credibilityScore = 78;

      if (lower.includes('train') || lower.includes('line') || lower.includes('string of lights') || lower.includes('linear')) {
        potentialIFO = "Starlink satellite constellation train pass.";
        preliminaryHypothesis = "High probability of Starlink launch deployment pass. Check Heavens-Above or CelesTrak for orbit timing.";
        credibilityScore = 45;
      } else if (lower.includes('offutt') || lower.includes('base') || lower.includes('tanker') || lower.includes('military')) {
        potentialIFO = "55th Wing RC-135 or KC-135 Stratotanker training pattern from Offutt AFB.";
        preliminaryHypothesis = "Military flight pattern correlation suspected. Cross-check Offutt AFB control tower NOTAMs.";
        credibilityScore = 65;
      } else if (lower.includes('triangle') || lower.includes('trilateral') || lower.includes('hover') || lower.includes('silent')) {
        hynekCategory = "CE-I (Close Encounter 1st Kind)";
        preliminaryHypothesis = "High-strangeness silent low-altitude trilateral craft. Field investigation warranted.";
        credibilityScore = 88;
      }

      return res.json({
        success: true,
        source: 'local-heuristics',
        analysis: {
          hynekClassification: hynekCategory,
          credibilityScore,
          preliminaryHypothesis,
          potentialIFO,
          investigativeSteps: [
            "Cross-reference ADS-B flight logs for Offutt AFB and Eppley Airfield.",
            "Verify weather conditions: cloud ceiling, wind direction, and visibility.",
            "Contact witness for high-resolution uncompressed photo/video raw files.",
            "Inspect photographic metadata (EXIF GPS and exposure timestamp)."
          ]
        }
      });
    }

    const prompt = `You are a certified MUFON Chief Field Investigator evaluating a newly submitted UFO/UAP sighting report for the Omaha, Nebraska chapter (Omaha MUFON, covering Douglas, Sarpy, Lancaster counties, Offutt AFB, and Eppley Airfield).

Sighting Details:
- Title: ${title || 'Untitled'}
- Location: ${location || 'Omaha Metro area'}
- Date/Time: ${timestamp || 'Unknown'}
- Shape: ${shape || 'Unspecified'}
- Duration: ${duration || 'Unspecified'}
- Witness Statement: "${description}"

Provide an analytical triage report in JSON format with:
1. "hynekClassification": standard Hynek category (NL: Nocturnal Light, DD: Daylight Disc, RV: Radar-Visual, CE-I: Close Encounter 1st Kind, CE-II: Physical effects, CE-III: Occupants, CE-IV: Abduction, CE-V: Contact)
2. "credibilityScore": number 0-100 evaluating narrative consistency and specificity
3. "preliminaryHypothesis": 2-3 sentences analyzing the event
4. "potentialIFO": natural/conventional candidates (Starlink, drone, Offutt military aircraft RC-135/KC-135, astronomical like Venus, fireball, flare) or "Unidentified / Low IFO Probability"
5. "investigativeSteps": array of 3-4 concrete steps for field investigators to take
6. "anonymityRecommendations": notes on what witness details should be redacted for public release on mufonomaha.space.

Return ONLY valid JSON matching this schema:
{
  "hynekClassification": string,
  "credibilityScore": number,
  "preliminaryHypothesis": string,
  "potentialIFO": string,
  "investigativeSteps": string[],
  "anonymityRecommendations": string
}`;

    let parsed = null;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      parsed = JSON.parse(response.text || '{}');
    } catch (genError: any) {
      console.warn('Gemini call failed, falling back to local domain analysis:', genError?.message);
    }

    if (parsed && parsed.hynekClassification) {
      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        analysis: parsed
      });
    }

    // High quality domain heuristics fallback for Omaha MUFON
    const lower = ((title || '') + ' ' + (description || '')).toLowerCase();
    let hynekClassification = 'NL';
    let credibilityScore = 84;
    let preliminaryHypothesis = 'Observation of anomalous nocturnal aerial light with non-standard flight characteristics.';
    let potentialIFO = 'Low initial IFO probability. Further correlation with Omaha TRACON radar required.';
    
    if (lower.includes('offutt') || lower.includes('tanker') || lower.includes('military') || lower.includes('rc-135')) {
      potentialIFO = 'Offutt AFB 55th Wing flight operations or touch-and-go approaches.';
      preliminaryHypothesis = 'Military training pattern in Sarpy County corridor suspected. Cross-check NOTAMs and flight logs.';
      credibilityScore = 72;
    } else if (lower.includes('train') || lower.includes('string') || lower.includes('line of lights') || lower.includes('starlink')) {
      potentialIFO = 'SpaceX Starlink orbital satellite deploy train.';
      preliminaryHypothesis = 'Linear synchronized progression consistent with recent LEO constellation launch.';
      credibilityScore = 38;
      hynekClassification = 'NL';
    } else if (lower.includes('triangle') || lower.includes('trilateral') || lower.includes('chevron')) {
      hynekClassification = 'CE-I';
      preliminaryHypothesis = 'Low-altitude geometric craft with reported sound attenuation. High field investigation priority.';
      credibilityScore = 94;
    }

    return res.json({
      success: true,
      source: 'domain-analysis-engine',
      analysis: {
        hynekClassification,
        credibilityScore,
        preliminaryHypothesis,
        potentialIFO,
        investigativeSteps: [
          'Verify transponder records with Eppley TRACON and Offutt AFB radar.',
          'Review local atmospheric soundings and temperature inversion profiles.',
          'Conduct recorded witness debrief and check for camera EXIF metadata.',
          'Interview adjacent residents within 2 miles for electromagnetic interference.'
        ],
        anonymityRecommendations: 'Redact witness surname and contact info before public syndication to mufonomaha.space.'
      }
    });
  } catch (error: any) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Codex Prompt Refinement & Code Simulation
app.post('/api/codex-simulation', async (req, res) => {
  try {
    const { promptText, targetStack } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        source: 'simulated',
        simulatedOutput: `// Simulated Codex output for ${targetStack || 'Next.js App Router'}\n// Connects admin.mufonomaha.space to mufonomaha.space database\n\n// 1. src/middleware.ts - Subdomain Router\nexport function middleware(req: NextRequest) {\n  const hostname = req.headers.get('host') || '';\n  if (hostname.startsWith('admin.')) {\n    return NextResponse.rewrite(new URL('/admin' + req.nextUrl.pathname, req.url));\n  }\n  return NextResponse.next();\n}\n\n// 2. Database schema ready for moderation triage queue.`
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are OpenAI Codex / GitHub Copilot. The user has provided the following prompt to implement an admin moderation backend for Omaha MUFON (admin.mufonomaha.space connecting to https://github.com/Mattjhagen/OmahaMufonRevised):

${promptText}

Produce an executive implementation preview:
1. File Tree architecture for the implementation
2. Primary core database model or schema
3. Key moderation endpoint code snippet
4. Subdomain routing snippet

Keep it clean, high quality TypeScript.`
      });

      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        simulatedOutput: response.text
      });
    } catch (e: any) {
      console.warn('Codex simulation model call failed, falling back:', e?.message);
    }

    return res.json({
      success: true,
      source: 'simulated-engine',
      simulatedOutput: `// Omaha MUFON Admin Backend - Implementation Blueprint for ${targetStack || 'Next.js 15'}
// Repository: Mattjhagen/OmahaMufonRevised | Subdomain: admin.mufonomaha.space

// 1. SUBDOMAIN ROUTING (src/middleware.ts)
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const url = req.nextUrl.clone();
  
  // Rewrites admin.mufonomaha.space to /admin application route group
  if (hostname.startsWith('admin.')) {
    url.pathname = \`/admin\${url.pathname}\`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

// 2. MODERATION & PII REDACTION ENDPOINT (src/app/api/admin/reports/[id]/route.ts)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { status, rejectionReason, moderationNotes } = await req.json();
  
  const updated = await prisma.sightingReport.update({
    where: { id: params.id },
    data: {
      status,
      rejectionReason,
      moderationNotes,
      isPublishedToPublic: status === 'APPROVED',
      updatedAt: new Date()
    }
  });

  return Response.json({ success: true, report: updated });
}

// 3. PUBLIC SYNDICATED ENDPOINT (src/app/api/public/sightings/route.ts)
export async function GET() {
  const publicCases = await prisma.sightingReport.findMany({
    where: { status: 'APPROVED', isPublishedToPublic: true },
    select: {
      caseNumber: true,
      title: true,
      description: true,
      date: true,
      timeString: true,
      location: true,
      redactedName: true, // Legal witness PII omitted
      hynekCategory: true,
      shape: true,
      credibilityScore: true,
      media: true
    }
  });

  return Response.json(publicCases);
}`
    });
  } catch (error: any) {
    console.error('Codex simulation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite or Static files handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Omaha MUFON Admin Server running on port ${port}`);
  });
}

startServer();
