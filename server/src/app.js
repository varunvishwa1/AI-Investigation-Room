import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import { randomUUID } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import { createGeminiService } from './services/geminiService.js';
import { createCaseGenerationService } from './services/caseGenerationService.js';
import { Case } from './models/Case.js';
import { createApiRouter } from './routes/apiRoutes.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requireCsrf } from './middleware/csrf.js';

export function createApp({ config, geminiService, caseModel = Case, sessionStore }) {
  const app = express();
  const gemini = geminiService || createGeminiService({ apiKey:config.geminiApiKey, model:config.geminiModel });
  const generationService = createCaseGenerationService({ gemini, CaseModel:caseModel });
  app.disable('x-powered-by');
  app.use(helmet());
  if(config.nodeEnv==='production')app.set('trust proxy',1);
  const configuredOrigins=config.clientOrigin.split(',').map((value)=>value.trim());
  const devLanOrigin=/^http:\/\/(?:(?:localhost)|(?:127\.0\.0\.1)|(?:10(?:\.\d{1,3}){3})|(?:192\.168(?:\.\d{1,3}){2})|(?:172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})):5173$/;
  app.use(cors({origin:(origin,callback)=>{
    if(!origin||configuredOrigins.includes(origin)||(config.nodeEnv!=='production'&&devLanOrigin.test(origin)))return callback(null,true);
    return callback(null,false);
  },credentials:true}));
  app.use(express.json({ limit:'32kb', strict:true }));
  app.use((req,res,next)=>{req.requestId=randomUUID();res.setHeader('X-Request-Id',req.requestId);next()});
  app.use(session({name:'amr.sid',secret:config.sessionSecret,resave:false,saveUninitialized:false,store:sessionStore,cookie:{httpOnly:true,sameSite:'lax',secure:config.nodeEnv==='production',maxAge:7*24*60*60*1000}}));
  app.use('/api/v1', rateLimit({windowMs:60_000,limit:120,standardHeaders:'draft-8',legacyHeaders:false}));
  app.use('/api/v1',(req,_res,next)=>['GET','HEAD','OPTIONS'].includes(req.method)?next():requireCsrf(req,_res,next));
  app.use('/api/v1/auth',createAuthRoutes({googleClientId:config.googleClientId}));
  app.use('/api/v1',createApiRouter({generationService}));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
