import { Case } from '../models/Case.js';
import { createAccusationService } from '../services/accusationService.js';
import { Investigation } from '../models/Investigation.js';
import { AppError } from '../utils/errors.js';

const send = (res, data) => res.json({ success:true, data });
const accusationService = createAccusationService({ CaseModel:Case, InvestigationModel:Investigation });

export const investigationController = {
  async updateNotes(req, res) {
    if (req.investigation.status !== 'active') throw new AppError(409, 'This investigation is complete. Notes are read-only.', 'INVESTIGATION_COMPLETED');
    req.investigation.notes = req.validatedBody.notes;
    await req.investigation.save();
    send(res, { notes:req.investigation.notes, updatedAt:req.investigation.updatedAt });
  },
  async getNotes(req, res) { send(res, { notes:req.investigation.notes, status:req.investigation.status }); },
  async accuse(req, res) {
    const investigation = await accusationService.submit(req.investigation, req.validatedBody.suspectId);
    send(res, { status:investigation.status, completedAt:investigation.completedAt });
  },
  async result(req, res) {
    if (req.investigation.status !== 'completed' || !req.investigation.result) throw new AppError(409, 'The solution is available after you submit an accusation.', 'REVEAL_NOT_PERMITTED');
    const [caseDoc] = await Promise.all([Case.findOne({caseId:req.investigation.caseId})]);
    const accused = caseDoc?.suspects.find((item)=>item.id===req.investigation.result.accusedSuspectId);
    const culprit = caseDoc?.suspects.find((item)=>item.id===req.investigation.result.culpritId);
    send(res, { ...req.investigation.result, accusedName:accused?.name, culpritName:culprit?.name, score:req.investigation.result.correct?100:0 });
  },
};
