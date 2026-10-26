import { Investigation } from '../models/Investigation.js';
import { AppError } from '../utils/errors.js';

export async function requireInvestigation(req, _res, next) {
  try {
    if(!req.user)throw new AppError(401,'Sign in to continue.','AUTH_REQUIRED');
    const investigation = await Investigation.findOne({ investigationId: req.params.investigationId,userId:req.user._id });
    if (!investigation) throw new AppError(404, 'Investigation not found.', 'INVESTIGATION_NOT_FOUND');
    req.investigation = investigation;
    next();
  } catch (error) { next(error); }
}
