import mongoose from 'mongoose';

const suspectSchema = new mongoose.Schema({ id: { type: String, required: true }, name: { type: String, required: true }, role: { type: String, required: true }, profile: { type: String, required: true }, motive: { type: String, required: true }, alibi: { type: String, required: true }, relationship: { type: String, required: true }, statement: { type: String, required: true } }, { _id: false });
const evidenceSchema = new mongoose.Schema({ id: { type: String, required: true }, title: { type: String, required: true }, type: { type: String, required: true }, description: { type: String, required: true }, content: { type: String, required: true }, timestamp: { type: String, required: true }, source: { type: String, required: true }, relatedSuspectIds: [String], relatedEventIds: [String] }, { _id: false });
const eventSchema = new mongoose.Schema({ id: { type: String, required: true }, timestamp: { type: String, required: true }, description: { type: String, required: true }, relatedEvidenceIds: [String], relatedSuspectIds: [String] }, { _id: false });
const explanationSchema = new mongoose.Schema({ explanation: { type: String, required: true }, evidenceIds: [String] }, { _id: false });
const solutionSchema = new mongoose.Schema({ culpritId: { type: String, required: true }, summary: { type: String, required: true }, decisiveEvidenceIds: [String], contradictions: [explanationSchema], redHerrings: [explanationSchema], finalTimeline: [{ timestamp: String, event: String }] }, { _id: false, strict: 'throw' });

const caseSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true, index: true }, createdBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',index:true}, title: { type: String, required: true }, scenario: { type: String, required: true }, category: { type: String, required: true }, difficulty: { type: String, required: true }, briefing: { type: String, required: true }, location: { type: String, required: true }, incidentTime: { type: String, required: true }, suspects: { type: [suspectSchema], required: true }, evidence: { type: [evidenceSchema], required: true }, timeline: { type: [eventSchema], required: true }, solution: { type: solutionSchema, required: true, select: false }, generationStatus: { type: String, enum: ['ready'], default: 'ready', required: true }, schemaVersion: { type: Number, default: 1, required: true },
}, { timestamps: true, minimize: false });

caseSchema.pre('validate', function validateSolution(next) {
  if (this.solution && !this.suspects.some((suspect) => suspect.id === this.solution.culpritId)) this.invalidate('solution.culpritId', 'Culprit must belong to the suspect list.');
  next();
});

export const Case = mongoose.models.Case || mongoose.model('Case', caseSchema);
