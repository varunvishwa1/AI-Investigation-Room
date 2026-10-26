import { randomUUID } from 'node:crypto';
import { Case } from '../models/Case.js';
import { Investigation } from '../models/Investigation.js';
import { publicCase } from '../services/caseValidationService.js';
import { AppError } from '../utils/errors.js';

const send = (res, data, status = 200) => res.status(status).json({ success: true, data });
const findCase = async (caseId) => {
  if (!/^[\w-]{8,80}$/.test(caseId)) throw new AppError(400, 'Invalid case ID.', 'INVALID_CASE_ID');
  const item = await Case.findOne({ caseId, generationStatus:'ready' });
  if (!item) throw new AppError(404, 'Case not found.', 'CASE_NOT_FOUND');
  return item;
};

export function createCaseController({ generationService }) {
  return {
    async generate(req, res) {
      const item = await generationService.generate(req.validatedBody,req.user._id);
      send(res, { caseId:item.caseId, status:item.generationStatus, case:publicCase(item) }, 201);
    },
    async get(req, res) { send(res, publicCase(await findCase(req.params.caseId))); },
    async evidence(req, res) { send(res, (await findCase(req.params.caseId)).evidence); },
    async suspects(req, res) { send(res, (await findCase(req.params.caseId)).suspects); },
    async timeline(req, res) { send(res, (await findCase(req.params.caseId)).timeline); },
    async createInvestigation(req, res) {
      const item = await findCase(req.body.caseId);
      const investigation = await Investigation.create({ investigationId:randomUUID(), caseId:item.caseId, userId:req.user._id });
      send(res, { investigationId:investigation.investigationId, status:investigation.status, startedAt:investigation.startedAt }, 201);
    },
  };
}
