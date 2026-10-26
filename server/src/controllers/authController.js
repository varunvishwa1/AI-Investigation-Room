import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import {User}from'../models/User.js';
import {AppError}from'../utils/errors.js';
import {issueCsrfToken}from'../middleware/csrf.js';

const safeUser=user=>({id:user._id.toString(),displayName:user.displayName,email:user.email,role:user.role,onboardingCompleted:user.onboardingCompleted,onboardingCurrentStep:user.onboardingCurrentStep,onboardingCompletedAt:user.onboardingCompletedAt});
const regenerate=req=>new Promise((resolve,reject)=>req.session.regenerate(error=>error?reject(error):resolve()));
const saveSession=req=>new Promise((resolve,reject)=>req.session.save(error=>error?reject(error):resolve()));
const hashCost=12;
const dummyHash='$2b$12$wZQfB9XTX5LPxEB4m5rc0eGQ1CAtHCsU9Os/ZlrLHiPAkFx1vD1l2';

export const authController={
 csrf(req,res){res.json({success:true,data:{csrfToken:issueCsrfToken(req)}})},
 async register(req,res){
  const{displayName,email,password}=req.validatedBody;const normalized=email.toLowerCase();
  const passwordHash=await bcrypt.hash(password,hashCost);
  let user;
  try{user=await User.create({displayName,email:normalized,passwordHash})}catch(error){if(error.code===11000)throw new AppError(409,'An account with those details could not be created. Try signing in instead.','REGISTRATION_FAILED');throw error}
  await regenerate(req);req.session.userId=user._id.toString();await saveSession(req);
  res.status(201).json({success:true,data:{user:safeUser(user),next:'onboarding'}});
 },
 async login(req,res){
  const{email,password}=req.validatedBody;const user=await User.findOne({email:email.toLowerCase()}).select('+passwordHash');
  const matches=await bcrypt.compare(password,user?.passwordHash||dummyHash);
  if(!user||!matches)throw new AppError(401,'Email or password is incorrect.','INVALID_CREDENTIALS');
  await regenerate(req);req.session.userId=user._id.toString();await saveSession(req);
  res.json({success:true,data:{user:safeUser(user),next:user.onboardingCompleted?'dashboard':'onboarding'}});
 },
 async me(req,res){res.json({success:true,data:{user:safeUser(req.user)}})},
 async logout(req,res){await new Promise(resolve=>req.session.destroy(()=>resolve()));res.clearCookie('amr.sid',{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production'});res.json({success:true,data:{loggedOut:true}})},
 async onboarding(req,res){res.json({success:true,data:{completed:req.user.onboardingCompleted,currentStep:req.user.onboardingCurrentStep,completedAt:req.user.onboardingCompletedAt}})},
 async updateOnboarding(req,res){
  const{currentStep,completed}=req.validatedBody;
  if(currentStep!==undefined)req.user.onboardingCurrentStep=currentStep;
  if(completed===true){req.user.onboardingCompleted=true;req.user.onboardingCurrentStep=8;req.user.onboardingCompletedAt=req.user.onboardingCompletedAt||new Date()}
  if(completed===false){req.user.onboardingCompleted=false;req.user.onboardingCompletedAt=null}
  await req.user.save();res.json({success:true,data:{completed:req.user.onboardingCompleted,currentStep:req.user.onboardingCurrentStep,completedAt:req.user.onboardingCompletedAt}});
 },
 forgotPassword(_req,res){res.status(503).json({success:false,error:{code:'EMAIL_NOT_CONFIGURED',message:'Password reset email is unavailable because no delivery provider is configured.'}})},
};

export function createGoogleAuthController({clientId}){
 const oauthClient=new OAuth2Client(clientId);
 return async function googleLogin(req,res){
  if(!clientId)throw new AppError(503,'Google sign-in is not configured. Add GOOGLE_CLIENT_ID to server/.env and VITE_GOOGLE_CLIENT_ID to the frontend environment.','GOOGLE_AUTH_NOT_CONFIGURED');
  let payload;
  try{const ticket=await oauthClient.verifyIdToken({idToken:req.validatedBody.credential,audience:clientId});payload=ticket.getPayload()}catch{throw new AppError(401,'Google could not verify this sign-in. Please try again.','GOOGLE_CREDENTIAL_INVALID')}
  if(!payload?.sub||!payload.email||payload.email_verified!==true)throw new AppError(401,'Use a Google account with a verified email address.','GOOGLE_EMAIL_UNVERIFIED');
  const email=payload.email.toLowerCase();
  let user=await User.findOne({$or:[{googleId:payload.sub},{email}]}).select('+googleId');
  if(!user){
   if(req.validatedBody.termsAccepted!==true)throw new AppError(400,'Accept the Terms and Privacy Policy before creating an account.','TERMS_REQUIRED');
   const candidateName=(payload.name||email.split('@')[0]).trim().slice(0,60);
   const displayName=candidateName.length>=2?candidateName:'Detective';
   try{user=await User.create({displayName,email,googleId:payload.sub})}catch(error){if(error.code===11000)throw new AppError(409,'That Google account could not be linked. Try signing in again.','GOOGLE_ACCOUNT_CONFLICT');throw error}
  }else if(!user.googleId){user.googleId=payload.sub;await user.save()}
  await regenerate(req);req.session.userId=user._id.toString();await saveSession(req);
  res.json({success:true,data:{user:safeUser(user),next:user.onboardingCompleted?'dashboard':'onboarding'}});
 };
}
