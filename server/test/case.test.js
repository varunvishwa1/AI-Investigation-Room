import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGeneratedCase } from '../src/schemas/caseSchema.js';
import { publicCase } from '../src/services/caseValidationService.js';
import { parseGeminiJson, createGeminiService } from '../src/services/geminiService.js';
import { createAccusationService } from '../src/services/accusationService.js';
import { createCaseGenerationService } from '../src/services/caseGenerationService.js';
import { Case } from '../src/models/Case.js';

const requested={scenario:'A silver compass disappears from a locked observatory during a snowstorm.',category:'theft',difficulty:'medium',suspectCount:3,evidenceIntensity:'standard'};
const fixture={title:'The Observatory Compass',category:'theft',difficulty:'medium',scenario:requested.scenario,briefing:'During a snowstorm a silver compass disappears from a locked observatory. Three people remained inside.',location:'Northstar Observatory',incidentTime:'Last night, 9:00 PM',suspects:[
 {id:'s1',name:'Ada Vale',role:'Astronomer',profile:'A careful astronomer who maintains the observatory instruments and knows the building well.',motive:'She hoped to sell a rare artifact to fund her research.',alibi:'She says she remained in the library throughout the storm.',relationship:'Curator of the observatory archive.',statement:'I did not enter the instrument room after closing.'},
 {id:'s2',name:'Ben Orr',role:'Caretaker',profile:'The observatory caretaker who checks the doors and heating system each evening.',motive:'He is frustrated by a recent change to his work schedule.',alibi:'He says he was in the boiler room at nine.',relationship:'Maintains the observatory building.',statement:'I was nowhere near the instrument room.'},
 {id:'s3',name:'Cy Rowan',role:'Researcher',profile:'A visiting researcher studying old navigation instruments.',motive:'The compass would complete a collection he has discussed acquiring.',alibi:'He says he left before the storm began.',relationship:'Visiting academic.',statement:'I left the site before the evening checks.'},
],evidence:[
 {id:'e1',title:'Door ledger',type:'document',description:'The instrument-room door ledger.',content:'At 9:03 PM Ada signed into the instrument room.',timestamp:'9:03 PM',source:'Observatory ledger',relatedSuspectIds:['s1'],relatedEventIds:['t1']},
 {id:'e2',title:'Warm gloves',type:'physical',description:'A pair of gloves beside the case.',content:'Warm gloves with silver polish on the fingertips were found beside the empty compass case.',timestamp:'9:12 PM',source:'Instrument room',relatedSuspectIds:['s1'],relatedEventIds:['t2']},
 {id:'e3',title:'Library note',type:'message',description:'A note in the library.',content:'Ada asks Ben to leave the service corridor unlocked at nine.',timestamp:'8:51 PM',source:'Library desk',relatedSuspectIds:['s1','s2'],relatedEventIds:['t1']},
 {id:'e4',title:'Snow trail',type:'witness_statement',description:'A witness saw tracks.',content:'Fresh tracks stopped at the observatory side entrance, not the main road.',timestamp:'9:20 PM',source:'Witness',relatedSuspectIds:['s2'],relatedEventIds:['t3']},
 {id:'e5',title:'Room photograph',type:'image',description:'A fictional image of the room.',content:'The empty plinth has a faint smear of silver polish near its base.',timestamp:'9:15 PM',source:'Scene photo',relatedSuspectIds:['s1'],relatedEventIds:['t2']},
 {id:'e6',title:'Hall camera',type:'cctv',description:'A corridor camera transcript.',content:'At 9:04 a person matching Ada enters the instrument room carrying a cloth.',timestamp:'9:04 PM',source:'Corridor camera',relatedSuspectIds:['s1'],relatedEventIds:['t1']},
],timeline:[{id:'t1',timestamp:'9:03 PM',description:'Ada enters the instrument room.',relatedEvidenceIds:['e1','e3','e6'],relatedSuspectIds:['s1']},{id:'t2',timestamp:'9:12 PM',description:'Compass disappears from the display plinth.',relatedEvidenceIds:['e2','e5'],relatedSuspectIds:['s1']},{id:'t3',timestamp:'9:20 PM',description:'A witness finds fresh tracks at the side entrance.',relatedEvidenceIds:['e4'],relatedSuspectIds:['s2']},{id:'t4',timestamp:'9:35 PM',description:'The curator closes the observatory for the night.',relatedEvidenceIds:['e1'],relatedSuspectIds:['s2']}],solution:{culpritId:'s1',summary:'Ada used the service passage and hid the compass inside a cloth.',decisiveEvidenceIds:['e1','e2','e6'],contradictions:[{explanation:'Ada claimed she stayed in the library, but the door ledger and camera place her in the instrument room.',evidenceIds:['e1','e6']}],redHerrings:[{explanation:'The snow tracks suggest an outside intruder but predate the theft.',evidenceIds:['e4']}],finalTimeline:[{timestamp:'8:51 PM',event:'Ada asks Ben about the corridor.'},{timestamp:'9:03 PM',event:'Ada enters the instrument room.'},{timestamp:'9:12 PM',event:'Ada takes and conceals the compass.'}]}};

test('scenario request rejects too-short and extra input',async()=>{
 const {scenarioRequestSchema}=await import('../src/schemas/caseSchema.js');
 assert.equal(scenarioRequestSchema.safeParse({...requested,scenario:'too short'}).success,false);
 assert.equal(scenarioRequestSchema.safeParse({...requested,unexpected:true}).success,false);
 assert.equal(scenarioRequestSchema.safeParse(requested).success,true);
});
test('case validation accepts complete case and rejects invalid culprit references',()=>{
 assert.equal(validateGeneratedCase(fixture,requested).success,true,JSON.stringify(validateGeneratedCase(fixture,requested).issues));
 const bad=structuredClone(fixture);bad.solution.culpritId='missing';
 assert.ok(validateGeneratedCase(bad,requested).issues.some((item)=>item.includes('culprit')));
});
test('case validator rejects dangling evidence and suspect references',()=>{
 const bad=structuredClone(fixture);bad.timeline[0].relatedEvidenceIds.push('not_real');
 assert.ok(validateGeneratedCase(bad,requested).issues.some((item)=>item.includes('unresolved')));
});
test('generation retries a structurally invalid draft and persists only a valid case',async()=>{
 let calls=0,saved;
 const service=createCaseGenerationService({gemini:{generateCase:async()=>{calls++;return calls===1?{...structuredClone(fixture),solution:{...fixture.solution,culpritId:'unknown'}}:structuredClone(fixture)}},CaseModel:{create:async(value)=>{saved=value;return value}}});
 const created=await service.generate(requested);
 assert.equal(calls,2);assert.equal(saved.solution.culpritId,'s1');assert.equal(created.generationStatus,'ready');
});
test('invalid canonical culprit fails Mongoose model validation',async()=>{
 const malformed=new Case({caseId:'model-test-123',...structuredClone(fixture),solution:{...fixture.solution,culpritId:'unknown'}});
 await assert.rejects(()=>malformed.validate(),(error)=>error.name==='ValidationError'&&Boolean(error.errors['solution.culpritId']));
});
test('public case serialization excludes canonical solution fields',()=>{
 const safe=publicCase({...fixture,caseId:'case-123',generationStatus:'ready',solution:fixture.solution});
 assert.equal('solution' in safe,false);assert.equal('culpritId' in safe,false);
});
test('Gemini response parsing accepts JSON and rejects malformed content',()=>{
 assert.deepEqual(parseGeminiJson('{"ok":true}'),{ok:true});
 assert.throws(()=>parseGeminiJson('not json'),{code:'AI_INVALID_JSON'});
});
test('Gemini SDK service uses configured model, JSON output, bounded timeout and parses response',async()=>{
 let request;
 const client={models:{generateContent:async(input)=>{request=input;return{text:'{"ok":true}'}}}};
 const service=createGeminiService({apiKey:'test-key',model:'test-model',client,timeoutMs:100});
 assert.deepEqual(await service.generateCase({systemInstruction:'fictional case rules',userContent:'{}'}),{ok:true});
 assert.equal(request.model,'test-model');assert.equal(request.config.systemInstruction,'fictional case rules');assert.equal(request.config.responseMimeType,'application/json');assert.equal(request.config.httpOptions.timeout,100);assert.equal(request.config.httpOptions.retryOptions.attempts,1);
});
test('accusation service returns a stable correct result and rejects duplicate submissions',async()=>{
 let status='active',storedResult;
 const caseDoc={generationStatus:'ready',suspects:[{id:'s1'}],solution:fixture.solution};
 const CaseModel={findOne(){return{select:async()=>caseDoc}}};
 const InvestigationModel={findOneAndUpdate:async(_q,update)=>{if(status!=='active')return null;status='completed';storedResult=update.$set.result;return{status,result:storedResult}}};
 const service=createAccusationService({CaseModel,InvestigationModel});
 assert.equal((await service.submit({investigationId:'i1',caseId:'c1',status},'s1')).result.correct,true);
 await assert.rejects(()=>service.submit({investigationId:'i1',caseId:'c1',status},'s1'),{code:'INVESTIGATION_COMPLETED'});
});
