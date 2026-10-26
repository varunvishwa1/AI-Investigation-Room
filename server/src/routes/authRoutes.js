import{Router}from'express';
import{rateLimit}from'express-rate-limit';
import{authController,createGoogleAuthController}from'../controllers/authController.js';
import{requireAuth}from'../middleware/auth.js';
import{validateRequest}from'../middleware/validateRequest.js';
import{googleLoginSchema,loginSchema,onboardingSchema,registerSchema}from'../schemas/authSchema.js';

const authRateLimit=rateLimit({windowMs:15*60*1000,limit:12,standardHeaders:'draft-8',legacyHeaders:false});
export function createAuthRoutes({googleClientId}){
const authRoutes=Router();
authRoutes.get('/csrf',authController.csrf);
authRoutes.post('/register',authRateLimit,validateRequest(registerSchema),authController.register);
authRoutes.post('/login',authRateLimit,validateRequest(loginSchema),authController.login);
authRoutes.post('/google',authRateLimit,validateRequest(googleLoginSchema),createGoogleAuthController({clientId:googleClientId}));
authRoutes.post('/logout',requireAuth,authController.logout);
authRoutes.get('/me',requireAuth,authController.me);
authRoutes.post('/forgot-password',authController.forgotPassword);
authRoutes.get('/onboarding',requireAuth,authController.onboarding);
authRoutes.patch('/onboarding',requireAuth,validateRequest(onboardingSchema),authController.updateOnboarding);
return authRoutes;
}
