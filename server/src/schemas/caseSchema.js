import { z } from 'zod';

const id = z.string().min(1).max(80);
const date = z.string().datetime({ offset: true });
export const scenarioRequestSchema = z.object({
  scenario: z.string().trim().min(30).max(3000),
  category: z.enum(['murder mystery', 'theft', 'missing object', 'disappearance', 'corporate mystery', 'cyber mystery', 'general detective mystery']).default('general detective mystery'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  suspectCount: z.coerce.number().int().min(3).max(6).default(4),
  evidenceIntensity: z.enum(['standard', 'detailed']).default('standard'),
}).strict();

export const generatedCaseSchema = z.object({
  title: z.string().min(4).max(120), category: z.string().min(1), difficulty: z.enum(['easy', 'medium', 'hard']),
  scenario: z.string().min(20).max(4000), briefing: z.string().min(30).max(5000), location: z.string().min(2).max(200), incidentTime: z.string().min(2).max(100),
  suspects: z.array(z.object({ id, name: z.string().min(2).max(100), role: z.string().min(2).max(120), profile: z.string().min(15).max(1500), motive: z.string().min(10).max(1200), alibi: z.string().min(10).max(1200), relationship: z.string().min(5).max(500), statement: z.string().min(5).max(800) })).min(3).max(6),
  evidence: z.array(z.object({ id, title: z.string().min(3).max(160), type: z.enum(['message','image','cctv','document','witness_statement','physical','timeline']), description: z.string().min(10).max(1000), content: z.string().min(10).max(4000), timestamp: z.string().min(2).max(100), source: z.string().min(2).max(160), relatedSuspectIds: z.array(id), relatedEventIds: z.array(id) })).min(6).max(24),
  timeline: z.array(z.object({ id, timestamp: z.string().min(2).max(100), description: z.string().min(10).max(700), relatedEvidenceIds: z.array(id), relatedSuspectIds: z.array(id) })).min(4).max(20),
  solution: z.object({ culpritId: id, summary: z.string().min(30).max(2500), decisiveEvidenceIds: z.array(id).min(2), contradictions: z.array(z.object({ explanation: z.string().min(10).max(700), evidenceIds: z.array(id).min(1) })), redHerrings: z.array(z.object({ explanation: z.string().min(10).max(700), evidenceIds: z.array(id).min(1) })), finalTimeline: z.array(z.object({ timestamp: z.string().min(2).max(100), event: z.string().min(5).max(700) })).min(3).max(20) }),
});

export const accusationRequestSchema = z.object({ suspectId: id }).strict();
export const notesRequestSchema = z.object({ notes: z.string().max(12000) }).strict();
export const createInvestigationSchema = z.object({ caseId: z.string().min(8).max(80) }).strict();

export function validateGeneratedCase(input, requested) {
  const parsed = generatedCaseSchema.safeParse(input);
  if (!parsed.success) return { success: false, issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
  const value = parsed.data;
  const unique = (items) => new Set(items.map((item) => item.id)).size === items.length;
  const suspectIds = new Set(value.suspects.map((s) => s.id));
  const evidenceIds = new Set(value.evidence.map((e) => e.id));
  const eventIds = new Set(value.timeline.map((event) => event.id));
  const issues = [];
  if (value.suspects.length !== requested.suspectCount) issues.push('Suspect count does not match the request.');
  if (!unique(value.suspects) || !unique(value.evidence) || !unique(value.timeline)) issues.push('Suspect, evidence, and timeline IDs must each be unique.');
  if (!suspectIds.has(value.solution.culpritId)) issues.push('Canonical culprit must be a suspect in this case.');
  if (value.solution.decisiveEvidenceIds.some((id) => !evidenceIds.has(id))) issues.push('Every decisive evidence reference must exist.');
  if (value.evidence.some((item) => item.relatedSuspectIds.some((id) => !suspectIds.has(id)) || item.relatedEventIds.some((id) => !eventIds.has(id)))) issues.push('Evidence contains an unresolved suspect or event reference.');
  if (value.timeline.some((item) => item.relatedEvidenceIds.some((id) => !evidenceIds.has(id)) || item.relatedSuspectIds.some((id) => !suspectIds.has(id)))) issues.push('Timeline contains an unresolved evidence or suspect reference.');
  if ([...value.solution.contradictions, ...value.solution.redHerrings].some((item) => item.evidenceIds.some((id) => !evidenceIds.has(id)))) issues.push('Solution explanation contains an unresolved evidence reference.');
  if (value.solution.finalTimeline.length < 3 || !value.solution.finalTimeline.every((item) => item.timestamp && item.event)) issues.push('The solution timeline is incomplete.');
  if (value.suspects.length < 3 || value.suspects.length > 6) issues.push('A case needs 3–6 suspects.');
  if (issues.length) return { success: false, issues };
  return { success: true, data: value };
}
