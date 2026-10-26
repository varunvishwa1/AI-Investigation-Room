import React,{useEffect,useMemo,useState} from 'react';
import{createRoot}from'react-dom/client';
import{BrowserRouter,useLocation,useNavigate}from'react-router-dom';
import{LandingPage,AuthPage,DashboardPage,OnboardingPage,CreateCasePage}from'./experience.jsx';
import{getCurrentUser,logoutUser,getDashboardData}from'./services/authService.js';
import{generateCase,getCase}from'./services/caseService.js';
import{apiRequest}from'./services/api.js';
import{createInvestigation,getResult,saveNotes,submitAccusation}from'./services/investigationService.js';
import'./styles.css';
import'./cinematic.css';

const nav=[['Overview','◫'],['Evidence room','▤'],['Suspects','♟'],['Timeline','▷'],['Evidence board','⌘'],['Case notes','✎']];
const colors=['coral','blue','green','purple','amber','slate'];
const iconByType={message:'▤',image:'▥',cctv:'▣',document:'▤',witness_statement:'◎',physical:'◈',timeline:'▷'};
const displayType={message:'Messages',image:'Images',cctv:'CCTV',document:'Documents',witness_statement:'Witnesses',physical:'Physical',timeline:'Timeline'};
function normalizeCase(input){
 if(input.caseId==='dev-vanishing-atlas')return input;
 return {...input,incidentTime:input.incidentTime||'',suspects:input.suspects.map((s,i)=>({...s,detail:s.profile,initials:s.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase(),color:colors[i%colors.length],quote:`“${s.statement}”`})),evidence:input.evidence.map(e=>({...e,type:displayType[e.type]||e.type,icon:iconByType[e.type]||'▤',time:e.timestamp,source:e.source,tag:displayType[e.type]||e.type,body:`${e.description}\n\n${e.content}`})),timeline:input.timeline.map(e=>[e.timestamp,e.description,'']),solution:null};
}
function Workspace({user,navigate,demoMode=false}){
 const[page,setPage]=useState('Overview'),[caseInfo,setCaseInfo]=useState(null),[selected,setSelected]=useState(null),[filter,setFilter]=useState('All evidence'),[query,setQuery]=useState(''),[selectedSuspect,setSelectedSuspect]=useState(null),[showAccuse,setShowAccuse]=useState(false),[accuse,setAccuse]=useState(''),[result,setResult]=useState(null),[hint,setHint]=useState(0),[note,setNote]=useState(()=>localStorage.getItem('amr-note')||''),[connections,setConnections]=useState(()=>JSON.parse(localStorage.getItem('amr-connections')||'[]')),[left,setLeft]=useState(''),[right,setRight]=useState(''),[connectionLabel,setConnectionLabel]=useState('Supports'),[toast,setToast]=useState(''),[showCreate,setShowCreate]=useState(false),[scenario,setScenario]=useState(''),[category,setCategory]=useState('general detective mystery'),[difficulty,setDifficulty]=useState('medium'),[suspectCount,setSuspectCount]=useState(4),[intensity,setIntensity]=useState('standard'),[creating,setCreating]=useState(false),[mobileMenu,setMobileMenu]=useState(false),[session,setSession]=useState(null),[notesSaved,setNotesSaved]=useState(true),[recentCases,setRecentCases]=useState([]);
 function notify(msg){setToast(msg);setTimeout(()=>setToast(''),3200)}
 const suspects=caseInfo?.suspects||[],evidence=caseInfo?.evidence||[],timeline=caseInfo?.timeline||[];
 useEffect(()=>{let live=true;getDashboardData().then(r=>{if(live&&r.data?.recentInvestigations)setRecentCases(r.data.recentInvestigations)}).catch(()=>{});return()=>{live=false}},[]);
 useEffect(()=>{let live=true;if(demoMode&&import.meta.env.DEV)import('./mockCase.js').then(({vanishingAtlas})=>{if(live){const item=normalizeCase(vanishingAtlas);setCaseInfo(item);setSelected(item.evidence[0]);setSession({demo:true});setLeft(item.evidence[0].id);setRight(item.evidence[3].id)}});return()=>{live=false}},[demoMode]);
 useEffect(()=>{let live=true;const restore=async()=>{const id=localStorage.getItem('amr-case');const investigationId=sessionStorage.getItem('amr-investigation');if(!id||!investigationId||demoMode)return;try{const{data}=await getCase(id);if(!live)return;const item=normalizeCase(data);setCaseInfo(item);setSelected(item.evidence[0]);setLeft(item.evidence[0]?.id||'');setRight(item.evidence[1]?.id||'');setSession({investigationId});const notes=await apiRequest(`/investigations/${investigationId}/notes`);setNote(notes.data.notes||'');if(notes.data.status==='completed'){const solved=await getResult(investigationId);setResult(solved.data)}}catch{localStorage.removeItem('amr-case');sessionStorage.removeItem('amr-investigation')}};restore();return()=>{live=false}},[demoMode]);
 useEffect(()=>{localStorage.setItem('amr-note',note)},[note]);useEffect(()=>{localStorage.setItem('amr-connections',JSON.stringify(connections))},[connections]);
 useEffect(()=>{if(!session?.investigationId||session.demo||!caseInfo)return;setNotesSaved(false);const timer=setTimeout(()=>saveNotes(session.investigationId,note).then(()=>setNotesSaved(true)).catch(()=>setNotesSaved(false)),650);return()=>clearTimeout(timer)},[note,session,caseInfo]);
 useEffect(()=>{const h=e=>{setLeft(e.detail.id);setPage('Evidence board');notify('Clue selected. Add a connection from the board.')};window.addEventListener('save-clue',h);return()=>window.removeEventListener('save-clue',h)},[]);
 useEffect(()=>{const keys=['Overview','Evidence room','Suspects','Timeline','Evidence board','Case notes'];const h=e=>{if(e.target.matches('input,textarea,select'))return;if(e.key.toLowerCase()==='n'){navigate('/create');return}if(/^[1-6]$/.test(e.key))setPage(keys[Number(e.key)-1])};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)},[]);
 const visibleEvidence=useMemo(()=>evidence.filter(e=>(filter==='All evidence'||e.type===filter)&&(e.title+' '+e.body+' '+e.source).toLowerCase().includes(query.toLowerCase())),[evidence,filter,query]);
 function go(value){setPage(value);setMobileMenu(false)}
 function clearCurrentCase(){localStorage.removeItem('amr-case');localStorage.removeItem('amr-note');localStorage.removeItem('amr-connections');sessionStorage.removeItem('amr-investigation');setCaseInfo(null);setSession(null);setResult(null);setNote('');setConnections([]);setPage('Overview')}
 async function switchCase(item){
  localStorage.setItem('amr-case',item.caseId);
  sessionStorage.setItem('amr-investigation',item.investigationId);
  try{
    const{data}=await getCase(item.caseId);
    const normalized=normalizeCase(data);
    setCaseInfo(normalized);
    setSelected(normalized.evidence[0]);
    setLeft(normalized.evidence[0]?.id||'');
    setRight(normalized.evidence[1]?.id||'');
    setSession({investigationId:item.investigationId});
    const notes=await apiRequest(`/investigations/${item.investigationId}/notes`);
    setNote(notes.data.notes||'');
    if(notes.data.status==='completed'){
      const solved=await getResult(item.investigationId);
      setResult(solved.data);
    }else{
      setResult(null);
    }
    setPage('Overview');
    notify(`Loaded: ${item.title}`);
  }catch(e){notify(e.message)}
 }
 async function generate(e){e.preventDefault();if(scenario.trim().length<30){notify('Add at least 30 characters to your premise.');return}setCreating(true);try{const response=await generateCase({scenario:scenario.trim(),category,difficulty,suspectCount,evidenceIntensity:intensity});const item=normalizeCase(response.data.case);const created=await createInvestigation(item.caseId);const nextSession={investigationId:created.data.investigationId};localStorage.setItem('amr-case',item.caseId);sessionStorage.setItem('amr-investigation',nextSession.investigationId);localStorage.removeItem('amr-note');localStorage.removeItem('amr-connections');setNote('');setConnections([]);setResult(null);setAccuse('');setHint(0);setCaseInfo(item);setSelected(item.evidence[0]);setLeft(item.evidence[0]?.id||'');setRight(item.evidence[1]?.id||'');setSession(nextSession);setPage('Overview');setShowCreate(false);setScenario('');notify('Your case is ready. The investigation has begun.')}catch(error){notify(error.message)}finally{setCreating(false)}}
 async function submitAnswer(){if(!accuse){notify('Choose a suspect first.');return}try{if(session?.demo&&import.meta.env.DEV){const canonical=caseInfo.solution;setResult({correct:accuse===canonical.culpritId,accusedName:suspects.find(s=>s.id===accuse)?.name,culpritName:suspects.find(s=>s.id===canonical.culpritId)?.name,summary:canonical.summary,decisiveEvidenceIds:canonical.decisiveEvidenceIds,finalTimeline:canonical.finalTimeline,contradictions:canonical.contradictions,redHerrings:canonical.redHerrings,score:accuse===canonical.culpritId?100:0})}else{await submitAccusation(session.investigationId,accuse);const solved=await getResult(session.investigationId);setResult(solved.data)}setShowAccuse(false);go('Overview')}catch(error){notify(error.message)}}
 function addConnection(){if(!left||!right||left===right){notify('Choose two different clues.');return}setConnections(items=>[{id:Date.now(),left,right,label:connectionLabel},...items]);notify('Connection added to your board.')}
 const sample=caseInfo?.caseId==='dev-vanishing-atlas';
 const initials=(user?.displayName||'AD').slice(0,2).toUpperCase();
 return <div className="app-shell">
  <aside className={`sidebar ${mobileMenu?'open':''}`}><div className="brand"><button className="sidebar-brand-btn" onClick={()=>navigate('/dashboard')} title="Back to Casebook / My Desk"><div className="brand-mark">M<span className="brand-dot">•</span></div><div><b>MYSTERY ROOM</b><small>THE INVESTIGATION DESK</small></div></button></div><div className="workspace-label">YOUR WORKSPACE</div><button className="new-case" onClick={()=>navigate('/create')}><span>+</span> New investigation <kbd>N</kbd></button><div className="side-heading">INVESTIGATE</div><nav>{nav.map(([name,icon])=><button key={name} className={`nav-item ${page===name?'active':''}`} onClick={()=>go(name)}><span className="icon">{icon}</span>{name}{name==='Evidence room'&&caseInfo&&<span className="nav-count">{String(evidence.length).padStart(2,'0')}</span>}</button>)}</nav><div className="side-heading recent-heading">RECENT CASES</div>
  {recentCases.length>0?<div className="recent-cases-list">{recentCases.slice(0,4).map(rc=><button key={rc.investigationId} className={`recent-case-row ${session?.investigationId===rc.investigationId?'active-case':''}`} onClick={()=>session?.investigationId===rc.investigationId?go('Overview'):switchCase(rc)}><span className="case-dot"/><span><b>{rc.title}</b><small>{rc.status==='completed'?'SOLVED':'IN PROGRESS'}</small></span></button>)}</div>:caseInfo?<button className="recent-case" onClick={()=>go('Overview')}><span className="case-dot"/><span><b>{caseInfo.title}</b><small>IN PROGRESS</small></span><span className="more">···</span></button>:<p className="muted side-empty">No investigations yet.</p>}
  <div className="sidebar-bottom"><div className="fiction-label"><span>ⓘ</span><span><b>Fiction, by design.</b><small>Every case is a work of fiction.</small></span></div><div className="profile"><div className="avatar user-avatar">{initials}</div><span><b>{user?.displayName||'Investigator'}</b><small>Independent investigator</small></span></div></div></aside>
  <main className="main-area"><header className="topbar"><button className="mobile-toggle" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Toggle menu">☰</button><div className="breadcrumb"><button className="breadcrumb-link" onClick={()=>navigate('/dashboard')}>CASE FILES</button><b>/</b><strong>{caseInfo?.title?.toUpperCase()||'INVESTIGATION DESK'}</strong></div><div className="top-actions"><button className="nav-desk-btn" onClick={()=>navigate('/dashboard')} title="Return to your Casebook">← MY DESK</button><span className="save-status"><i/> {notesSaved?'All changes saved':'Saving notes…'}</span><button className="icon-btn" aria-label="Notifications" onClick={()=>notify("You're all caught up.")}>🔔<i className="notification-dot"/></button><button className="topbar-avatar-btn" onClick={()=>navigate('/dashboard')} title="Go to My Desk"><div className="avatar user-avatar small-avatar">{initials}</div></button></div></header>
  <div className="content-wrap">{!caseInfo?<section className="empty-dashboard"><div className="brand-mark">M<span className="brand-dot">•</span></div><div className="eyebrow"><span className="live-dot"/> THE INVESTIGATION DESK</div><h1>Every clue tells a story.<br/><em>Can you find the truth?</em></h1><p>Build a fictional mystery, inspect the evidence, and make your case. Your next investigation is waiting.</p><button className="primary-btn" onClick={()=>navigate('/create')}>+ &nbsp; Start investigating</button><div className="fiction-notice">ⓘ AI-generated cases are fictional. The case solution stays private until you submit your accusation.</div></section>:<>
    <section className="case-heading"><div><div className="eyebrow"><span className="live-dot"/> SOLO INVESTIGATION <span className="eyebrow-sep">·</span> {caseInfo.caseId==='dev-vanishing-atlas'?'SAMPLE CASE':'CASE FILE'}</div><h1>{caseInfo.title}</h1><p className="subtitle">{caseInfo.briefing}</p><div className="case-meta"><span>▷ &nbsp;{caseInfo.location}</span><span className="meta-divider"/><span className="difficulty-pill"><i/>{caseInfo.difficulty.toUpperCase()}</span><span className="fiction-pill">FICTIONAL CASE</span></div></div><button className="more-case" onClick={()=>notify('Case options')}>···</button></section>
    <div className="workspace-tabs">{nav.map(([name,icon])=><button key={name} onClick={()=>go(name)} className={page===name?'selected':''}><span className="icon">{icon}</span>{name}</button>)}</div>
    {page==='Overview'&&<Overview {...{caseInfo,suspects,evidence,timeline,result,hint,setHint,setPage:go,setShowAccuse,setSelected,setFilter,setSuspect:setSelectedSuspect,notify,onReplay:clearCurrentCase}}/>}
    {page==='Evidence room'&&<div className="page-layout"><section className="panel evidence-library"><div className="panel-head"><div><div className="section-kicker">THE COLLECTION</div><h2>Evidence room <span className="small-count">{String(evidence.length).padStart(2,'0')}</span></h2></div><button className="filter-button" onClick={()=>setFilter(filter==='All evidence'?'Documents':'All evidence')}>☷ &nbsp;Filter</button></div><div className="search-box"><span>🔍</span><input placeholder="Search evidence..." value={query} onChange={e=>setQuery(e.target.value)}/><kbd>⌘ K</kbd></div><div className="filter-chips">{['All evidence',...[...new Set(evidence.map(x=>x.type))]].map(item=><button onClick={()=>setFilter(item)} className={filter===item?'chip-active':''} key={item}>{item}</button>)}</div><div className="evidence-list">{visibleEvidence.map(item=><button className={`evidence-row ${selected?.id===item.id?'picked':''}`} key={item.id} onClick={()=>setSelected(item)}><span className="evidence-icon">{item.icon}</span><span className="evidence-row-info"><b>{item.title}</b><small>{item.source} · {item.time}</small></span><span className="row-arrow">→</span></button>)}{!visibleEvidence.length&&<div className="empty-state">No evidence matches your search.</div>}</div></section><EvidenceViewer item={selected} onSelectSuspect={s=>setSelectedSuspect(s)} suspects={suspects}/></div>}
    {page==='Suspects'&&<section className="panel full-panel"><div className="panel-head"><div><div className="section-kicker">PERSONS OF INTEREST</div><h2>Suspect directory <span className="small-count">{suspects.length}</span></h2></div><span className="muted">All suspects are presumed innocent.</span></div><div className="suspect-grid">{suspects.map(item=><button className="suspect-card" key={item.id} onClick={()=>setSelectedSuspect(item)}><div className={`avatar suspect-avatar ${item.color}`}>{item.initials}</div><span className="suspect-main"><b>{item.name}</b><small>{item.role}</small><span className="suspect-quote">{item.quote}</span></span><span className="row-arrow">→</span></button>)}</div></section>}
    {page==='Timeline'&&<section className="panel full-panel"><div className="panel-head"><div><div className="section-kicker">RECONSTRUCT THE NIGHT</div><h2>Case timeline</h2></div><span className="muted">Case times as provided in the evidence</span></div><div className="timeline-page">{timeline.map(([time,label,color],i)=><div className="timeline-item" key={`${time}-${i}`}><div className="timeline-time">{time}</div><div className={`timeline-marker ${color||''}`}/><div className="timeline-text"><b>{label}</b><small>Evidence-linked event</small></div></div>)}</div></section>}
    {page==='Evidence board'&&<div className="board-layout"><section className="panel board-panel"><div className="panel-head"><div><div className="section-kicker">YOUR WORKING THEORY</div><h2>Evidence board</h2></div><span className="muted">Private to you</span></div><div className="board-canvas"><div className="board-watermark">⌘</div><div className="board-node suspect-node"><div className="node-type">SUSPECT</div><b>{suspects[0]?.name||'Suspect'}</b><small>{suspects[0]?.role}</small></div><div className="board-node clue-node"><div className="node-type">EVIDENCE</div><b>{evidence[0]?.title||'Clue'}</b><small>{evidence[0]?.time}</small></div><div className="board-lines"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="34" y1="34" x2="55" y2="20"/></svg></div><span className="board-caption">A connection is a theory. The evidence remains the source of truth.</span></div><div className="board-controls"><label>CONNECT TWO CLUES</label><div className="connect-fields"><select value={left} onChange={e=>setLeft(e.target.value)}>{evidence.map(x=><option value={x.id} key={x.id}>{x.title}</option>)}</select><span>→</span><select value={right} onChange={e=>setRight(e.target.value)}>{evidence.map(x=><option value={x.id} key={x.id}>{x.title}</option>)}</select><select value={connectionLabel} onChange={e=>setConnectionLabel(e.target.value)}><option>Supports</option><option>Contradicts</option><option>Related</option><option>Uncertain</option></select><button className="primary-btn small-primary" onClick={addConnection}>+ Add link</button></div></div><div className="saved-links">{connections.map(c=><div className="saved-link" key={c.id}><span className="link-dot"/><b>{evidence.find(x=>x.id===c.left)?.title}</b><span className="link-label">{c.label.toLowerCase()}</span><b>{evidence.find(x=>x.id===c.right)?.title}</b><button onClick={()=>setConnections(xs=>xs.filter(x=>x.id!==c.id))} aria-label="Remove connection">×</button></div>)}</div></section><div className="board-aside"><Assistant hint={hint} setHint={setHint} notify={notify} suspects={suspects} evidence={evidence} timeline={timeline}/></div></div>}
    {page==='Case notes'&&<section className="panel full-panel notes-page"><div className="panel-head"><div><div className="section-kicker">PRIVATE TO YOU</div><h2>Investigation notes</h2></div><span className="saved-note"><i/> {notesSaved?'Saved automatically':'Saving…'}</span></div><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="What stands out? Record observations, questions, or a theory..."/><div className="note-hint">{session?.demo?'Your notes stay on this device.':session?'Your notes save to this investigation.':'Notes are saved on this device.'}</div><div className="note-prompts"><b>Questions to consider</b><span>Who had the opportunity to reach the incident location?</span><span>Does anyone's alibi conflict with the timeline?</span><span>Which clues are direct evidence, and which are assumptions?</span></div></section>}
   </>}</div>
   <footer className="footer"><span>AMR <i>•</i> {caseInfo?'CASE FILE':'INVESTIGATION DESK'}</span><span>A fictional investigation experience <i>•</i> Your theory is yours</span><button onClick={()=>notify('Keyboard shortcuts: N new case · 1–6 navigate')}>SHORTCUTS <kbd>?</kbd></button></footer></main>
   {showAccuse&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setShowAccuse(false)}><div className="modal accusation-modal"><button className="modal-close" onClick={()=>setShowAccuse(false)}>×</button><div className="modal-symbol">⚖</div><div className="section-kicker">FINAL SUBMISSION</div><h2>Make your accusation</h2><p>Review the evidence before you decide. Submitting reveals the case solution.</p><label className="field-label" htmlFor="accused">WHO DO YOU ACCUSE?</label><select id="accused" value={accuse} onChange={e=>setAccuse(e.target.value)}><option value="">Select a suspect</option>{suspects.map(item=><option key={item.id} value={item.id}>{item.name} · {item.role}</option>)}</select><div className="submit-warning">You have one final accusation for this case.</div><button className="primary-btn full-button" onClick={submitAnswer}>Submit accusation <span>→</span></button><button className="cancel-btn" onClick={()=>setShowAccuse(false)}>Keep investigating</button></div></div>}
   {selectedSuspect&&<SuspectModal suspect={selectedSuspect} onClose={()=>setSelectedSuspect(null)} onNote={()=>{setNote(n=>`${n}${n?'\n\n':''}${selectedSuspect.name}: ${selectedSuspect.alibi}`);setSelectedSuspect(null);go('Case notes');notify('Alibi added to your notes.')}}/>}
   {showCreate&&<form className="modal-backdrop" onSubmit={generate}><div className="modal create-modal"><button type="button" className="modal-close" onClick={()=>setShowCreate(false)}>×</button><div className="section-kicker">START A NEW CASE</div><h2>What happened?</h2><p>Set the premise. Gemini will create suspects, a timeline, and evidence around it.</p><label className="field-label" htmlFor="scenario">YOUR FICTIONAL SCENARIO</label><textarea id="scenario" value={scenario} onChange={e=>setScenario(e.target.value)} minLength="30" maxLength="3000" placeholder="A priceless painting disappeared from a locked gallery during a storm..." required/><div className="char-count">{scenario.length} / 3,000 characters · minimum 30</div><div className="form-row"><div><label className="field-label" htmlFor="category">CATEGORY</label><select id="category" value={category} onChange={e=>setCategory(e.target.value)}><option value="murder mystery">Murder mystery</option><option value="theft">Theft</option><option value="missing object">Missing object</option><option value="disappearance">Disappearance</option><option value="corporate mystery">Corporate mystery</option><option value="cyber mystery">Cyber mystery</option><option value="general detective mystery">Detective mystery</option></select></div><div><label className="field-label" htmlFor="difficulty">DIFFICULTY</label><select id="difficulty" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div></div><div className="form-row"><div><label className="field-label" htmlFor="suspect-count">SUSPECTS</label><select id="suspect-count" value={suspectCount} onChange={e=>setSuspectCount(Number(e.target.value))}>{[3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></div><div><label className="field-label" htmlFor="intensity">EVIDENCE</label><select id="intensity" value={intensity} onChange={e=>setIntensity(e.target.value)}><option value="standard">Standard</option><option value="detailed">Detailed</option></select></div></div><div className="fiction-notice">ⓘ Cases are fictional. Do not include identifying details about real people.</div><button className="primary-btn full-button" disabled={creating}>{creating?<><span className="spinner"/> Generating and checking case…</>:<>Generate mystery <span>→</span></>}</button></div></form>}
   {toast&&<div className="toast" role="status">✓ &nbsp;{toast}</div>}
  </div>
}

function Overview({caseInfo,suspects,evidence,timeline,result,hint,setHint,setPage,setShowAccuse,setSelected,setFilter,setSuspect,notify,onReplay}){
 return <>
  <div className="dashboard-grid">
   <div className="main-column">
    <section className="panel briefing-panel">
     <div className="panel-head">
      <div><div className="section-kicker">THE BRIEFING</div><h2>{caseInfo.title}</h2></div>
      <span className="case-status"><i/> {result?'CASE COMPLETE':'ACTIVE CASE'}</span>
     </div>
     <p className="briefing-copy">{caseInfo.briefing}</p>
     <div className="briefing-facts">
      <div><span>LOCATION</span><b>{caseInfo.location}</b></div>
      <div><span>INCIDENT</span><b>{caseInfo.incidentTime}</b></div>
      <div><span>PERSONS OF INTEREST</span><b>{String(suspects.length).padStart(2,'0')} identified</b></div>
     </div>
    </section>
    <section className="panel evidence-panel">
     <div className="panel-head">
      <div><div className="section-kicker">FOLLOW THE PAPER TRAIL</div><h2>Recent evidence</h2></div>
      <button className="text-link" onClick={()=>setPage('Evidence room')}>View all evidence →</button>
     </div>
     <div className="recent-evidence">
      {evidence.slice(0,3).map((item,i)=><button className="recent-evidence-row" key={item.id} onClick={()=>{setSelected(item);setFilter('All evidence');setPage('Evidence room')}}><span className={`evidence-icon recent-icon tone-${i}`}>{item.icon}</span><span className="recent-info"><b>{item.title}</b><small>{item.source} <i>·</i> {item.time}</small></span><span className="tag">{item.tag}</span><span className="row-arrow">→</span></button>)}
     </div>
     <button className="all-evidence-link" onClick={()=>setPage('Evidence room')}>+ &nbsp;Open evidence room</button>
    </section>
    <section className="panel timeline-panel">
     <div className="panel-head">
      <div><div className="section-kicker">PIECES OF THE NIGHT</div><h2>Timeline</h2></div>
      <button className="text-link" onClick={()=>setPage('Timeline')}>Full timeline →</button>
     </div>
     <div className="mini-timeline">
      {timeline.slice(0,6).map(([time,label,color],i)=><div className="mini-time-row" key={`${time}-${i}`}><span className="mini-time">{time}</span><span className={`mini-dot ${color||''}`}/><span className="mini-label">{label}</span></div>)}
     </div>
    </section>
   </div>
   <aside className="right-column">
    <section className="panel suspects-panel">
     <div className="panel-head">
      <div><div className="section-kicker">PEOPLE TO QUESTION</div><h2>Suspects <span className="small-count">{String(suspects.length).padStart(2,'0')}</span></h2></div>
      <button className="text-link" onClick={()=>setPage('Suspects')}>All →</button>
     </div>
     <div className="suspect-list">
      {suspects.map(item=><button key={item.id} className="suspect-row" onClick={()=>setSuspect(item)}><div className={`avatar suspect-avatar ${item.color}`}>{item.initials}</div><span><b>{item.name}</b><small>{item.role}</small></span><span className="suspect-chevron">›</span></button>)}
     </div>
     <button className="compare-link" onClick={()=>setPage('Suspects')}>Compare alibis <span>→</span></button>
    </section>
    <Assistant hint={hint} setHint={setHint} notify={notify} suspects={suspects} evidence={evidence} timeline={timeline}/>
    <section className="accuse-card">
     <div className="accuse-emblem">⚖</div>
     <div>
      <div className="section-kicker">WHEN YOU'RE READY</div>
      <h3>Trust your instincts.</h3>
      <p>Choose who you believe is responsible.</p>
     </div>
     <button onClick={()=>result?notify('Your result appears below.'):setShowAccuse(true)}>{result?'Accusation submitted':'Make an accusation'} <span>→</span></button>
    </section>
   </aside>
  </div>
  {result&&<SolutionReveal result={result} caseInfo={caseInfo} suspects={suspects} onReplay={onReplay}/>}
 </>
}

function Assistant({hint,setHint,notify,suspects=[],evidence=[],timeline=[]}){
 const[tab,setTab]=useState('hints');
 const guidance=[
  "Need a nudge? Ask a question that helps you inspect the public evidence.",
  "HINT 01 · Which suspect's account can you verify against a time-stamped record?",
  "HINT 02 · Compare two independent clues that mention the same person or event.",
  "HINT 03 · Check whether a suspect's alibi fits the sequence of evidence."
 ];
 return <section className="assistant-card">
  <div className="assistant-heading">
   <div className="assistant-mark">✦</div>
   <div><b>Detective's desk</b><small>YOUR CASE ASSISTANT</small></div>
   <span className="online-dot"/>
  </div>
  <div className="assistant-tabs">
   <button className={`assistant-tab-btn ${tab==='hints'?'active':''}`} onClick={()=>setTab('hints')}>HINTS</button>
   <button className={`assistant-tab-btn ${tab==='analyst'?'active':''}`} onClick={()=>setTab('analyst')}>ANALYST</button>
   <button className={`assistant-tab-btn ${tab==='organizer'?'active':''}`} onClick={()=>setTab('organizer')}>ORGANIZER</button>
  </div>
  {tab==='hints'&&<>
   <p>{guidance[hint]}</p>
   <div className="assistant-footer">
    <span>{hint}/3 hints used</span>
    <button disabled={hint>=3} onClick={()=>setHint(x=>Math.min(3,x+1))}>{hint>=3?'No hints left':'Get a hint'} →</button>
   </div>
  </>}
  {tab==='analyst'&&<div className="analyst-view">
   <p className="analyst-lead">Cross-referencing timeline against suspect accounts:</p>
   <div className="analyst-insights">
    {suspects.slice(0,3).map((s,i)=><div key={s.id} className="analyst-item"><span className="analyst-dot">•</span><div><b>{s.name}</b>: Alibi states <i>"{s.alibi?.slice(0,60)}..."</i>. Compare with {timeline[i] ? `${timeline[i][0]} record` : 'case timeline'}.</div></div>)}
   </div>
  </div>}
  {tab==='organizer'&&<div className="organizer-view">
   <p className="organizer-lead">Dossier overview:</p>
   <div className="organizer-metrics">
    <div><b>{suspects.length}</b><span>SUSPECTS</span></div>
    <div><b>{evidence.length}</b><span>CLUES</span></div>
    <div><b>{timeline.length}</b><span>EVENTS</span></div>
   </div>
   <div className="organizer-status">✓ All clues are grounded in verified case data. Motives indicate interest, not legal proof.</div>
  </div>}
 </section>
}

function EvidenceViewer({item,onSelectSuspect,suspects=[]}){
 const related=suspects.filter(s=>item&&item.body&&item.body.toLowerCase().includes(s.name.toLowerCase()));
 return <section className="panel viewer-panel">
  <div className="viewer-top"><span className="section-kicker">EVIDENCE VIEWER</span><button className="icon-btn" aria-label="Save clue">★</button></div>
  {item?<>
   <div className="document-mark">{item.icon}</div>
   <div className="viewer-label">{item.type.toUpperCase()} <i>·</i> {item.time?.toUpperCase()}</div>
   <h2>{item.title}</h2>
   <div className="viewer-source">SOURCE <b>{item.source}</b></div>
   <div className="evidence-content">{item.body.split('\n').map((line,i)=><React.Fragment key={i}>{line||<br/>}{line&&<br/>}</React.Fragment>)}</div>
   {related.length>0&&<div className="viewer-suspects-badge"><label>MENTIONED SUSPECTS:</label>{related.map(s=><button key={s.id} className="badge-suspect-btn" onClick={()=>onSelectSuspect&&onSelectSuspect(s)}>{s.name} →</button>)}</div>}
   <div className="viewer-actions">
    <button onClick={()=>navigator.clipboard?.writeText(item.title)}>▫ &nbsp; Copy reference</button>
    <button onClick={()=>window.dispatchEvent(new CustomEvent('save-clue',{detail:item}))}>+ &nbsp; Add to board</button>
   </div>
  </>:<div className="empty-state">Choose an evidence item to inspect.</div>}
 </section>
}

function SolutionReveal({result,caseInfo,suspects,onReplay}){
 return <section className="panel solution-panel">
  <div className={`solution-badge ${result.correct?'':'incorrect-badge'}`}>{result.correct?'CORRECT DEDUCTION':'CASE CLOSED · INCORRECT'}</div>
  <div className="section-kicker">THE SOLUTION</div>
  <h2>{result.correct?(caseInfo.solution?.correctSummary||`You identified ${result.culpritName}.`):`${result.culpritName} was responsible.`}</h2>
  <p>Your accusation: <b>{result.accusedName||suspects.find(s=>s.id===result.accusedSuspectId)?.name}</b>. The case solution: <b>{result.culpritName||suspects.find(s=>s.id===result.culpritId)?.name}</b>. {result.summary}</p>
  <div className="solution-reasoning">{(result.decisiveEvidenceIds||[]).slice(0,3).map((id,i)=><div key={id}><span>{String(i+1).padStart(2,'0')}</span><p>{caseInfo.evidence.find(e=>e.id===id)?.title||id} was decisive evidence.</p></div>)}</div>
  <div className="result-score">CASE SCORE <b>{result.score??(result.correct?100:0)}</b></div>
  <button className="secondary-btn" onClick={onReplay}>↺ &nbsp; Start a new case</button>
 </section>
}

function SuspectModal({suspect,onClose,onNote}){
 return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal suspect-modal">
  <button className="modal-close" onClick={onClose}>×</button>
  <div className="suspect-profile-head">
   <div className={`avatar suspect-avatar ${suspect.color}`}>{suspect.initials}</div>
   <div><div className="section-kicker">PERSON OF INTEREST</div><h2>{suspect.name}</h2><p>{suspect.role}</p></div>
  </div>
  <div className="profile-detail"><label>BACKGROUND</label><p>{suspect.detail}</p></div>
  <div className="profile-detail"><label>POSSIBLE MOTIVE</label><p>{suspect.motive}</p></div>
  <div className="profile-detail"><label>STATED ALIBI</label><p>{suspect.alibi}</p></div>
  <blockquote>{suspect.quote}</blockquote>
  <button className="secondary-btn full-button" onClick={onNote}>+ Add alibi to notes</button>
 </div></div>
}

function RoutedApp(){
 const location=useLocation(),navigateTo=useNavigate(),[user,setUser]=useState(null),[loading,setLoading]=useState(true);
 const go=path=>navigateTo(path);
 useEffect(()=>{let live=true;getCurrentUser().then(r=>{if(live)setUser(r.data.user)}).catch(()=>{}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[location.pathname]);
 const path=location.pathname;
 if(loading)return <div className="route-loading">Opening your case file…</div>;
 if(['/login','/register','/forgot-password'].includes(path))return <AuthPage mode={path.slice(1)} navigate={go} onAuthenticated={(u,next)=>{setUser(u);const intended=sessionStorage.getItem('amr-pending-next');go(intended|| (next==='dashboard'?'/dashboard':'/onboarding'))}}/>;
 if(path==='/onboarding')return user?<OnboardingPage user={user} navigate={go} onCompleted={()=>setUser(u=>({...u,onboardingCompleted:true}))} onProgress={u=>setUser(u)}/>:<AuthPage mode="login" navigate={go} onAuthenticated={(u)=>{setUser(u);go('/onboarding')}}/>;
 if(path==='/dashboard')return user?<DashboardPage user={user} navigate={go} onLogout={async()=>{await logoutUser().catch(()=>{});setUser(null);go('/')}} onReplay={()=>go('/onboarding')}/>:<AuthPage mode="login" navigate={go} onAuthenticated={(u,next)=>{setUser(u);const intended=sessionStorage.getItem('amr-pending-next');go(intended|| (next==='dashboard'?'/dashboard':'/onboarding'))}}/>;
 if(path==='/create')return user?<CreateCasePage navigate={go} onCreated={(c,i)=>{localStorage.setItem('amr-case',c.caseId);sessionStorage.setItem('amr-investigation',i.investigationId)}}/>:<AuthPage mode="login" navigate={go} onAuthenticated={u=>{setUser(u);if(!u.onboardingCompleted)sessionStorage.setItem('amr-pending-next','/create');go(u.onboardingCompleted?'/create':'/onboarding')}}/>;
 if(path==='/investigation')return user?<Workspace user={user} navigate={go}/>:<AuthPage mode="login" navigate={go} onAuthenticated={u=>{setUser(u);if(!u.onboardingCompleted)sessionStorage.setItem('amr-pending-next','/investigation');go(u.onboardingCompleted?'/investigation':'/onboarding')}}/>;
 if(path==='/sample'&&import.meta.env.DEV)return <Workspace user={user} navigate={go} demoMode/>;
 return <LandingPage user={user} navigate={go}/>;
}
createRoot(document.getElementById('root')).render(<BrowserRouter><RoutedApp/></BrowserRouter>);
