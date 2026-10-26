import { AppError } from '../utils/errors.js';

export function createAccusationService({ CaseModel, InvestigationModel }) {
  return {
    async submit(investigation, suspectId) {
      if (investigation.status !== 'active') throw new AppError(409, 'An accusation has already been submitted for this investigation.', 'INVESTIGATION_COMPLETED');
      const caseDoc = await CaseModel.findOne({ caseId: investigation.caseId }).select('+solution');
      if (!caseDoc || caseDoc.generationStatus !== 'ready') throw new AppError(404, 'Case not found.', 'CASE_NOT_FOUND');
      if (!caseDoc.suspects.some((suspect) => suspect.id === suspectId)) throw new AppError(400, 'Choose a suspect from this case.', 'INVALID_SUSPECT');
      const result = { correct: suspectId === caseDoc.solution.culpritId, accusedSuspectId: suspectId, culpritId: caseDoc.solution.culpritId, summary: caseDoc.solution.summary, decisiveEvidenceIds: caseDoc.solution.decisiveEvidenceIds, contradictions: caseDoc.solution.contradictions, redHerrings: caseDoc.solution.redHerrings, finalTimeline: caseDoc.solution.finalTimeline };
      const updated = await InvestigationModel.findOneAndUpdate({ investigationId: investigation.investigationId, status: 'active' }, { $set: { status:'completed', selectedSuspectId:suspectId, result, completedAt:new Date() } }, { new:true, runValidators:true });
      if (!updated) throw new AppError(409, 'An accusation has already been submitted for this investigation.', 'INVESTIGATION_COMPLETED');
      return updated;
    },
  };
}
