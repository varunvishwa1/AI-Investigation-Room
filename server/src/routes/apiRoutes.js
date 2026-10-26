import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createCaseController } from '../controllers/caseController.js';
import { dashboard } from '../controllers/dashboardController.js';
import { investigationController } from '../controllers/investigationController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireInvestigation } from '../middleware/investigationAccess.js';
import { requireAuth } from '../middleware/auth.js';
import { accusationRequestSchema, createInvestigationSchema, notesRequestSchema, scenarioRequestSchema } from '../schemas/caseSchema.js';

export function createApiRouter({ generationService }) {
  const router = Router();
  const cases = Router();
  const investigations = Router();
  const controller = createCaseController({ generationService });
  const generationLimit = rateLimit({ windowMs:10*60*1000, limit:30, standardHeaders:'draft-8', legacyHeaders:false, message:{success:false,error:{code:'RATE_LIMITED',message:'Too many case generation requests. Please try again later.'}} });

  router.get('/health', (_req,res)=>res.json({ success:true, message:'AI Mystery Room API is running' }));
  router.get('/dashboard',requireAuth,dashboard);
  cases.post('/generate', validateRequest(scenarioRequestSchema), requireAuth, generationLimit, controller.generate);
  cases.get('/:caseId/evidence', controller.evidence);
  cases.get('/:caseId/suspects', controller.suspects);
  cases.get('/:caseId/timeline', controller.timeline);
  cases.get('/:caseId', controller.get);
  router.use('/cases', cases);
  router.post('/investigations', requireAuth, validateRequest(createInvestigationSchema), async (req,res,next)=>{try{req.body=req.validatedBody;return await controller.createInvestigation(req,res)}catch(e){next(e)}});
  investigations.get('/:investigationId/notes', requireAuth, requireInvestigation, investigationController.getNotes);
  investigations.patch('/:investigationId/notes', requireAuth, requireInvestigation, validateRequest(notesRequestSchema), investigationController.updateNotes);
  investigations.post('/:investigationId/accusation', requireAuth, requireInvestigation, validateRequest(accusationRequestSchema), investigationController.accuse);
  investigations.get('/:investigationId/result', requireAuth, requireInvestigation, investigationController.result);
  router.use('/investigations', investigations);
  return router;
}
