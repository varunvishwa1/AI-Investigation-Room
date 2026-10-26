import { z } from 'zod';

export const registerSchema=z.object({displayName:z.string().trim().min(2).max(60),email:z.string().trim().email().max(254),password:z.string().min(10).max(128).regex(/[a-z]/,'Password needs a lowercase letter.').regex(/[A-Z]/,'Password needs an uppercase letter.').regex(/[0-9]/,'Password needs a number.'),termsAccepted:z.literal(true)}).strict();
export const loginSchema=z.object({email:z.string().trim().email().max(254),password:z.string().min(1).max(128)}).strict();
export const googleLoginSchema=z.object({credential:z.string().min(100).max(10000),termsAccepted:z.boolean().optional()}).strict();
export const onboardingSchema=z.object({currentStep:z.number().int().min(0).max(8).optional(),completed:z.boolean().optional()}).strict().refine(x=>x.currentStep!==undefined||x.completed!==undefined,'Provide onboarding progress.');
