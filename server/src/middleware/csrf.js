import { createHmac,randomBytes,timingSafeEqual } from 'node:crypto';
import { AppError } from '../utils/errors.js';

export function issueCsrfToken(req){
 if(!req.session.csrfSecret)req.session.csrfSecret=randomBytes(32).toString('hex');
 return createHmac('sha256',req.session.csrfSecret).update(req.sessionID).digest('hex');
}
export function requireCsrf(req,_res,next){
 const received=req.get('X-CSRF-Token');
 if(!req.session?.csrfSecret||typeof received!=='string')return next(new AppError(403,'Refresh the page and try again.','CSRF_INVALID'));
 const expected=issueCsrfToken(req);
 const a=Buffer.from(received);const b=Buffer.from(expected);
 if(a.length!==b.length||!timingSafeEqual(a,b))return next(new AppError(403,'Refresh the page and try again.','CSRF_INVALID'));
 next();
}
