import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

async function withServer(fn) {
  const app=createApp({config:{geminiApiKey:'test-only',geminiModel:'test-model',sessionSecret:'a-test-session-secret-long-enough-to-sign-cookies',nodeEnv:'test',clientOrigin:'http://localhost:5173'},geminiService:{generateCase:async()=>({})}});
  const server=app.listen(0);
  await new Promise(resolve=>server.once('listening',resolve));
  try { await fn(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve=>server.close(resolve)); }
}
async function getCsrf(base){const response=await fetch(`${base}/api/v1/auth/csrf`);const payload=await response.json();return{token:payload.data.csrfToken,cookie:response.headers.get('set-cookie')?.split(';')[0]}}

test('health endpoint returns the public health contract without infrastructure details',async()=>withServer(async base=>{
 const response=await fetch(`${base}/api/v1/health`);const body=await response.json();
 assert.equal(response.status,200);assert.deepEqual(body,{success:true,message:'AI Mystery Room API is running'});
 assert.equal(JSON.stringify(body).includes('mongodb'),false);assert.equal(JSON.stringify(body).includes('test-only'),false);
}));

test('development CORS allows Vite from a private LAN address',async()=>withServer(async base=>{
 const response=await fetch(`${base}/api/v1/health`,{headers:{origin:'http://10.91.217.179:5173'}});
 assert.equal(response.status,200);
 assert.equal(response.headers.get('access-control-allow-origin'),'http://10.91.217.179:5173');
 assert.equal(response.headers.get('access-control-allow-credentials'),'true');
}));

test('case generation validates input before calling Gemini',async()=>withServer(async base=>{
 const csrf=await getCsrf(base);
 const response=await fetch(`${base}/api/v1/cases/generate`,{method:'POST',headers:{'content-type':'application/json',cookie:csrf.cookie,'x-csrf-token':csrf.token},body:JSON.stringify({scenario:'too short'})});
 const body=await response.json();assert.equal(response.status,400);assert.equal(body.success,false);assert.equal(body.error.code,'INVALID_REQUEST');
}));

test('unknown API routes use a consistent safe error response',async()=>withServer(async base=>{
 const response=await fetch(`${base}/api/v1/not-a-route`);const body=await response.json();
 assert.equal(response.status,404);assert.equal(body.success,false);assert.equal(body.error.code,'NOT_FOUND');
}));

test('investigation notes require the signed-in account session',async()=>withServer(async base=>{
 const response=await fetch(`${base}/api/v1/investigations/test-session/notes`);const body=await response.json();
 assert.equal(response.status,401);assert.equal(body.error.code,'AUTH_REQUIRED');
}));

test('mutating requests require a session-bound CSRF token',async()=>withServer(async base=>{
 const csrf=await getCsrf(base);
 const denied=await fetch(`${base}/api/v1/cases/generate`,{method:'POST',headers:{'content-type':'application/json',cookie:csrf.cookie},body:JSON.stringify({scenario:'A sufficiently long premise that should be rejected without a CSRF header.'})});
 assert.equal(denied.status,403);assert.equal((await denied.json()).error.code,'CSRF_INVALID');
 const passed=await fetch(`${base}/api/v1/cases/generate`,{method:'POST',headers:{'content-type':'application/json',cookie:csrf.cookie,'x-csrf-token':csrf.token},body:JSON.stringify({scenario:'A sufficiently long premise that should reach the authentication check.'})});
 assert.equal(passed.status,401);assert.equal((await passed.json()).error.code,'AUTH_REQUIRED');
}));

import { googleLoginSchema, loginSchema, onboardingSchema, registerSchema } from '../src/schemas/authSchema.js';

test('registration enforces password strength and explicit terms acceptance',()=>{
 const base={displayName:'Casey Vale',email:'casey@example.com',password:'MysteryRoom9',termsAccepted:true};
 assert.equal(registerSchema.safeParse(base).success,true);
 assert.equal(registerSchema.safeParse({...base,password:'weak'}).success,false);
 assert.equal(registerSchema.safeParse({...base,termsAccepted:false}).success,false);
});

test('onboarding progress accepts valid steps and rejects invalid progress',()=>{
 assert.equal(onboardingSchema.safeParse({currentStep:4}).success,true);
 assert.equal(onboardingSchema.safeParse({completed:true}).success,true);
 assert.equal(onboardingSchema.safeParse({currentStep:9}).success,false);
 assert.equal(onboardingSchema.safeParse({}).success,false);
});

test('login rejects extra request fields',()=>{
 assert.equal(loginSchema.safeParse({email:'casey@example.com',password:'abc'}).success,true);
 assert.equal(loginSchema.safeParse({email:'casey@example.com',password:'abc',role:'admin'}).success,false);
});

test('Google sign-in validates an ID-token credential and reports missing OAuth setup',async()=>withServer(async base=>{
 const csrf=await getCsrf(base);
 const response=await fetch(`${base}/api/v1/auth/google`,{method:'POST',headers:{'content-type':'application/json',cookie:csrf.cookie,'x-csrf-token':csrf.token},body:JSON.stringify({credential:'x'.repeat(120),termsAccepted:true})});
 assert.equal(response.status,503);assert.equal((await response.json()).error.code,'GOOGLE_AUTH_NOT_CONFIGURED');
}));

test('Google auth schema rejects missing credentials and extra fields',()=>{
 assert.equal(googleLoginSchema.safeParse({credential:'x'.repeat(120)}).success,true);
 assert.equal(googleLoginSchema.safeParse({credential:'short'}).success,false);
 assert.equal(googleLoginSchema.safeParse({credential:'x'.repeat(120),admin:true}).success,false);
});
