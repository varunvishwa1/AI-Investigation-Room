import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';

export async function requireAuth(req,_res,next){
 try{
  if(!req.session?.userId)throw new AppError(401,'Sign in to continue.','AUTH_REQUIRED');
  const user=await User.findById(req.session.userId);
  if(!user){req.session.destroy(()=>{});throw new AppError(401,'Sign in to continue.','AUTH_REQUIRED')}
  req.user=user;next();
 }catch(error){next(error)}
}
