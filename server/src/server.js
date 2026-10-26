import dns from 'node:dns';
import { loadConfig } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { createApp } from './app.js';
import MongoStore from 'connect-mongo';

let server,sessionStore;
try {
  const config=loadConfig();
  if (config.mongoUri?.startsWith('mongodb+srv://')) {
    try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
  }
  await connectDatabase(config.mongoUri);
  sessionStore=MongoStore.create({mongoUrl:config.mongoUri,collectionName:'sessions',ttl:7*24*60*60});
  server=createApp({config,sessionStore}).listen(config.port,'0.0.0.0',()=>console.log(JSON.stringify({level:'info',message:'AI Mystery Room API listening',port:config.port,environment:config.nodeEnv})));
} catch (error) {
  const detail=String(error.message||'');
  const safeMessage=detail.startsWith('Missing required server configuration:')?detail:'Unable to connect to MongoDB or initialize the API.';
  console.error(JSON.stringify({level:'error',message:'Server startup failed',detail:safeMessage,code:error.code||error.name}));
  process.exitCode=1;
}

async function shutdown(signal) {
  console.log(JSON.stringify({level:'info',message:'Server shutting down',signal}));
  if (server) await new Promise((resolve)=>server.close(resolve));
  if(sessionStore)await sessionStore.close();
  await disconnectDatabase();
  process.exit(0);
}
process.on('SIGINT',()=>shutdown('SIGINT'));
process.on('SIGTERM',()=>shutdown('SIGTERM'));
