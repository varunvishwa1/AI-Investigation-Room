import { GoogleGenAI } from '@google/genai';
import { AppError } from '../utils/errors.js';

const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' }, category: { type: 'string' }, difficulty: { type: 'string', enum: ['easy','medium','hard'] }, scenario: { type: 'string' }, briefing: { type: 'string' }, location: { type: 'string' }, incidentTime: { type: 'string' },
    suspects: { type: 'array', items: { type: 'object', properties: { id:{type:'string'},name:{type:'string'},role:{type:'string'},profile:{type:'string'},motive:{type:'string'},alibi:{type:'string'},relationship:{type:'string'},statement:{type:'string'} }, required:['id','name','role','profile','motive','alibi','relationship','statement'] } },
    evidence: { type:'array', items:{type:'object',properties:{id:{type:'string'},title:{type:'string'},type:{type:'string',enum:['message','image','cctv','document','witness_statement','physical','timeline']},description:{type:'string'},content:{type:'string'},timestamp:{type:'string'},source:{type:'string'},relatedSuspectIds:{type:'array',items:{type:'string'}},relatedEventIds:{type:'array',items:{type:'string'}}},required:['id','title','type','description','content','timestamp','source','relatedSuspectIds','relatedEventIds']}},
    timeline:{type:'array',items:{type:'object',properties:{id:{type:'string'},timestamp:{type:'string'},description:{type:'string'},relatedEvidenceIds:{type:'array',items:{type:'string'}},relatedSuspectIds:{type:'array',items:{type:'string'}}},required:['id','timestamp','description','relatedEvidenceIds','relatedSuspectIds']}},
    solution:{type:'object',properties:{culpritId:{type:'string'},summary:{type:'string'},decisiveEvidenceIds:{type:'array',items:{type:'string'}},contradictions:{type:'array',items:{type:'object',properties:{explanation:{type:'string'},evidenceIds:{type:'array',items:{type:'string'}}},required:['explanation','evidenceIds']}},redHerrings:{type:'array',items:{type:'object',properties:{explanation:{type:'string'},evidenceIds:{type:'array',items:{type:'string'}}},required:['explanation','evidenceIds']}},finalTimeline:{type:'array',items:{type:'object',properties:{timestamp:{type:'string'},event:{type:'string'}},required:['timestamp','event']}}},required:['culpritId','summary','decisiveEvidenceIds','contradictions','redHerrings','finalTimeline']},
  }, required:['title','category','difficulty','scenario','briefing','location','incidentTime','suspects','evidence','timeline','solution'],
};

export function parseGeminiJson(text) {
  if (typeof text !== 'string' || !text.trim()) throw new AppError(502, 'The case generator returned an empty response. Please retry.', 'AI_EMPTY_RESPONSE');
  try { return JSON.parse(text); } catch { throw new AppError(502, 'The case generator returned an invalid response. Please retry.', 'AI_INVALID_JSON'); }
}

export function createGeminiService({ apiKey, model, client, timeoutMs = 90000 }) {
  const sdk = client || new GoogleGenAI({ apiKey });
  const candidateModels = Array.from(new Set([model, 'gemini-3.5-flash', 'gemini-flash-lite-latest'])).filter(Boolean);
  return {
    async generateCase({ systemInstruction, userContent }) {
      let lastError;
      for (const currentModel of candidateModels) {
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            let timer;
            const response = await Promise.race([
              sdk.models.generateContent({ model: currentModel, contents: userContent, config: { systemInstruction, responseMimeType: 'application/json', responseJsonSchema: schema, temperature: 0.8, maxOutputTokens: 12000, httpOptions:{timeout:timeoutMs,retryOptions:{attempts:1}} } }),
              new Promise((_, reject) => { timer = setTimeout(() => reject(new AppError(504, 'Case generation took too long. Please try again.', 'AI_TIMEOUT')), timeoutMs); }),
            ]).finally(() => clearTimeout(timer));
            return parseGeminiJson(response.text);
          } catch (error) {
            lastError = error;
            if (error instanceof AppError) throw error;
            if (error.name === 'AbortError' || error.name === 'RequestTimeoutError') throw new AppError(504, 'Case generation took too long. Please try again.', 'AI_TIMEOUT');
            // If 503 (high demand) or 404 (model unavailable), break out of inner loop to try next model
            if (error.status === 503 || error.status === 404) break;
            if (attempt === 0 && (error.status >= 500 || error.status === 429 || !error.status)) await new Promise((resolve) => setTimeout(resolve, 350));
            else break;
          }
        }
      }
      console.error(JSON.stringify({ level:'error', component:'gemini', providerStatus:lastError?.status, errorName:lastError?.name }));
      throw new AppError(lastError?.status === 429 ? 503 : 502, lastError?.status === 429 ? 'Case generation is busy. Please retry shortly.' : 'Case generation failed. Please retry.', 'AI_PROVIDER_ERROR');
    },
  };
}
