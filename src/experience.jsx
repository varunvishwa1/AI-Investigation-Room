import React,{useEffect,useRef,useState}from'react';
import heroArt from './assets/mystery-hero.png';
import{ArrowDown,ArrowLeft,ArrowRight,BookOpen,Check,ChevronRight,Clock3,Compass,Eye,EyeOff,FileText,HelpCircle,Lightbulb,LockKeyhole,Mail,Map,Menu,MessageSquare,Play,Plus,ShieldCheck,Star,Users,X,Target,Image as ImageIcon,Activity,Sparkles,Dices,CheckCircle2,AlertCircle}from'lucide-react';
import{getDashboardData,googleLoginUser,loginUser,registerUser,requestPasswordReset,updateOnboarding}from'./services/authService.js';
import{generateCase}from'./services/caseService.js';
import{createInvestigation}from'./services/investigationService.js';

const modes=[{icon:Compass,title:'Solo Investigation',text:'Follow the evidence at your own pace. Every decision is yours.',action:'INVESTIGATE ALONE',available:true,art:'solo'},{icon:Users,title:'Team vs Team',text:'Put your theory to the test in a head-to-head mystery match.',action:'CHALLENGE A TEAM',available:false,art:'team'},{icon:MessageSquare,title:'Group Investigation',text:'Bring your best questions. Solve a shared case together.',action:'JOIN AN INVESTIGATION',available:false,art:'group'}];
function Reveal({children,className=''}){const ref=useRef(null);useEffect(()=>{const node=ref.current;if(!node)return;const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12});observer.observe(node);return()=>observer.disconnect()},[]);return <div ref={ref} className={`reveal ${className}`}>{children}</div>}
function Brand({onClick}){return <button className="cin-brand" onClick={onClick} aria-label="AI Mystery Room home"><span className="cin-brand-mark">M<span className="brand-dot">•</span></span><span><b>AI MYSTERY ROOM</b><small>THE INVESTIGATION DESK</small></span></button>}

export function LandingPage({user,navigate}){
 const[menu,setMenu]=useState(false);const start=()=>user?navigate(user.onboardingCompleted?'/create':'/onboarding') : navigate('/register?next=%2Fcreate');
 return <main className="cin-home">
  <header className="cin-nav"><Brand onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}/><button className="cin-mobile-menu" onClick={()=>setMenu(!menu)} aria-label="Toggle navigation"><Menu size={19}/></button><nav className={menu?'menu-open':''}><a href="#modes" onClick={()=>setMenu(false)}>Game modes</a><a href="#how-it-works" onClick={()=>setMenu(false)}>How to play</a><a href="#inside" onClick={()=>setMenu(false)}>The evidence</a>{user?<button className="nav-outline" onClick={()=>navigate('/dashboard')}>MY DESK <ArrowRight size={14}/></button>:<><button className="nav-login" onClick={()=>navigate('/login')}>Sign in</button><button className="nav-outline" onClick={()=>navigate('/register')}>CREATE ACCOUNT <ArrowRight size={14}/></button></>}</nav></header>
  <section className="cin-hero" style={{"--hero-art":`url(${heroArt})`}}><div className="hero-art"/><div className="hero-vignette"/><div className="hero-fog fog-one"/><div className="hero-fog fog-two"/><div className="hero-grain"/><div className="hero-content"><div className="hero-overline"><span/> AN ORIGINAL DETECTIVE GAME <span/></div><h1>Every Mystery<br/>Has a <em>Secret.</em></h1><p>Enter the investigation. Examine the evidence.<br className="desktop-break"/> Uncover the truth hidden in every clue.</p><div className="hero-actions"><button className="ice-button" onClick={start}>ENTER THE MYSTERY <ArrowRight size={15}/></button><a className="hero-secondary" href="#how-it-works"><Play size={13}/> HOW TO PLAY</a></div><div className="hero-note"><ShieldCheck size={14}/> Every case is fictional. Every solution is built to be found.</div></div><a className="scroll-cue" href="#modes"><span>SCROLL TO EXPLORE</span><ArrowDown size={14}/></a><div className="hero-index">01 <i>/</i> 04</div></section>
  <section className="section-dark mode-section" id="modes"><Reveal><div className="section-label">CHOOSE YOUR INVESTIGATION <span>01 — THE BEGINNING</span></div><div className="section-title-row"><h2>Three ways into<br/><em>the unknown.</em></h2><p>Every case begins with a question.<br/>Choose how you\'ll find the answer.</p></div></Reveal><div className="mode-grid">{modes.map(({icon:Icon,title,text,action,available,art},i)=><Reveal key={title} className="mode-reveal"><article className={`mode-card mode-${art}`}><div className="mode-card-art"><div className="mode-art-mark">{art==='solo'?'◈':art==='team'?'✦':'⌘'}</div><div className="mode-art-index">0{i+1}</div></div><div className="mode-card-content"><div className="mode-icon"><Icon size={16}/></div><div className="mode-availability">{available?'AVAILABLE NOW':'COMING SOON'}</div><h3>{title}</h3><p>{text}</p><button className={available?'mode-action':'mode-action disabled'} disabled={!available} onClick={start}>{action}{available&&<ArrowRight size={14}/>}</button></div></article></Reveal>)}</div><div className="mode-footnote"><span className="status-dot"/> Solo cases are ready to play. Team modes are in development.</div></section>
  <section className="evidence-showcase" id="inside"><div className="showcase-bg"/><div className="showcase-inner"><Reveal><div className="section-label">INSIDE THE INVESTIGATION <span>02 — THE PAPER TRAIL</span></div><div className="section-title-row"><h2>Truth leaves<br/><em>traces.</em></h2><p>A message sent too late. A timestamp that doesn't fit.<br/>The smallest detail can change everything.</p></div></Reveal><div className="evidence-collage"><Reveal className="showcase-card chat-show"><div className="showcase-card-head"><MessageSquare size={14}/> MESSAGE TRANSCRIPT <span>FICTIONAL</span></div><div className="chat-date">TUESDAY · 9:26 PM</div><div className="chat-msg left-msg"><small>ELI · 9:26 PM</small>Did you move the blue case like we agreed?</div><div className="chat-msg right-msg"><small>MARA · 9:28 PM</small>I told you. It's handled.</div><div className="chat-caption">A simulated conversation — every detail belongs to the case.</div></Reveal><Reveal className="showcase-card cctv-show"><div className="cctv-image"><span className="cctv-rec">● REC</span><span>CAM 03 · WEST CORRIDOR</span><i>21:19:10</i></div><div className="showcase-card-head"><Activity size={14}/> CAMERA TRANSCRIPT</div><p>A figure crosses toward the gallery carrying something flat.</p></Reveal><Reveal className="showcase-card report-show"><div className="report-stamp">BELLWEATHER<br/>ARCHIVES</div><FileText size={21}/><span>CONDITION REPORT</span><b>Conservation Record<br/>No. 014-B</b><small>Filed the day before the incident</small></Reveal><Reveal className="showcase-card board-show"><div className="showcase-card-head"><Map size={14}/> YOUR EVIDENCE BOARD</div><div className="mini-board"><span className="mini-node">MARA VOSS</span><span className="mini-node">ACCESS LOG</span><span className="mini-node">ALIBI</span><i/><i/></div><small>Connect clues. Test your theory.</small></Reveal></div><div className="demo-banner"><span>CASE PREVIEW</span> These artifacts are a demonstration of fictional evidence. Your generated case will contain its own clues.</div></div></section>
  <section className="how-section" id="how-it-works"><Reveal><div className="section-label">A METHOD, NOT A GUESS <span>03 — THE PROCESS</span></div><div className="section-title-row"><h2>Follow the evidence.<br/><em>Find the story.</em></h2><p>No detective experience required.<br/>Good questions are enough to begin.</p></div></Reveal><div className="steps-row">{[{icon:BookOpen,title:'RECEIVE THE CASE',body:'Read the briefing. Understand what happened — and what remains unknown.'},{icon:Eye,title:'EXAMINE THE EVIDENCE',body:'Inspect messages, reports, witness accounts, and the timeline.'},{icon:Map,title:'CONNECT THE CLUES',body:'Compare details. Test alibis. Keep observations separate from assumptions.'},{icon:Target,title:'IDENTIFY THE CULPRIT',body:'Make an accusation when the evidence supports your theory.'}].map((step,i)=><Reveal key={step.title} className="step-reveal"><article className="how-step"><div className="step-number">0{i+1}</div><step.icon size={22}/><h3>{step.title}</h3><p>{step.body}</p>{i<3&&<div className="step-line"/>}</article></Reveal>)}</div></section>
  <section className="room-preview"><Reveal><div className="section-label">A CLOSER LOOK <span>04 — YOUR DESK</span></div><div className="section-title-row"><h2>The room is yours<br/><em>to investigate.</em></h2><p>Briefing, suspects, evidence, and your own working theory —<br/>all in one calm, focused workspace.</p></div></Reveal><Reveal className="preview-reveal"><div className="preview-window"><div className="preview-top"><span className="preview-lights"><i/><i/><i/></span><span>AI MYSTERY ROOM <b>/</b> CASE 014</span><span className="preview-status">● ACTIVE CASE</span></div><div className="preview-body"><div className="preview-rail"><span>CASE BRIEFING</span><span>♟ &nbsp; SUSPECTS</span><span className="rail-active">▤ &nbsp; EVIDENCE</span><span>▷ &nbsp; TIMELINE</span><span>⌘ &nbsp; EVIDENCE BOARD</span><span>✎ &nbsp; PRIVATE NOTES</span></div><div className="preview-main"><small>THE BRIEFING</small><h3>The Vanishing Atlas</h3><p>A priceless manuscript disappears from a locked gallery. Four people had access. The alarm never sounded.</p><div className="preview-evidence"><div><FileText size={15}/><span><b>East wing access log</b><small>Security system · 9:18 PM</small></span></div><div><MessageSquare size={15}/><span><b>Unsent message</b><small>Eli Mercer\'s desk · 9:26 PM</small></span></div><div><ImageIcon size={15}/><span><b>Corridor camera transcript</b><small>West corridor · 9:12 PM</small></span></div></div></div><div className="preview-suspects"><small>PERSONS OF INTEREST</small><span>MV &nbsp; Mara Voss</span><span>EM &nbsp; Eli Mercer</span><span>JR &nbsp; Jonah Reed</span><span>IP &nbsp; Dr. Ines Park</span></div></div><div className="preview-bottom"><span>FICTIONAL CASE PREVIEW</span><span>Investigation workspace demonstration</span></div></div></Reveal><div className="preview-cta"><button className="text-arrow" onClick={start}>EXPLORE AN INVESTIGATION <ArrowRight size={15}/></button><span>Sample content shown. Your own case is generated when you begin.</span></div></section>
  <section className="final-cta"><div className="cta-ornament">◈</div><div className="section-label">THE NEXT MOVE IS YOURS</div><h2>The truth is<br/><em>waiting.</em></h2><p>Your first case is a few questions away.</p><div className="hero-actions"><button className="ice-button" onClick={start}>START YOUR FIRST CASE <ArrowRight size={15}/></button>{!user&&<button className="hero-secondary" onClick={()=>navigate('/register')}>CREATE AN ACCOUNT</button>}</div><div className="cta-glow"/></section>
  <footer className="cin-footer"><Brand onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}/><p>Fictional mysteries. Real deduction.</p><nav><a href="#how-it-works">HOW TO PLAY</a><a href="#modes">GAME MODES</a><button onClick={()=>navigate(user?'/onboarding':'/register?next=%2Fonboarding')}>HELP & FAQ</button><button onClick={()=>navigate('/login')}>ACCOUNT</button></nav><small>© {new Date().getFullYear()} AI MYSTERY ROOM · A WORK OF FICTION</small></footer>
 </main>
}

export function AuthPage({mode,navigate,onAuthenticated}){
 const[displayName,setDisplayName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[terms,setTerms]=useState(false),[visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[forgot,setForgot]=useState(mode==='forgot-password'),[notice,setNotice]=useState('');const register=mode==='register',googleButton=useRef(null),googleHandler=useRef(null),googleClientId=import.meta.env.VITE_GOOGLE_CLIENT_ID;
 googleHandler.current=async credential=>{setError('');setBusy(true);try{const result=await googleLoginUser(credential,terms);sessionStorage.setItem('amr-pending-next',new URLSearchParams(location.search).get('next')||'');onAuthenticated(result.data.user,result.data.next)}catch(err){setError(err.message)}finally{setBusy(false)}};
 useEffect(()=>{if(!googleClientId||forgot||!googleButton.current)return;let cancelled=false;const initialize=()=>{if(cancelled||!window.google?.accounts?.id||!googleButton.current)return;window.google.accounts.id.initialize({client_id:googleClientId,callback:response=>googleHandler.current?.(response.credential)});window.google.accounts.id.renderButton(googleButton.current,{theme:'outline',size:'large',shape:'rectangular',text:register?'signup_with':'signin_with',width:Math.min(450,googleButton.current.clientWidth||450),locale:'en'})};let script=document.querySelector('script[data-google-identity]');if(window.google?.accounts?.id)initialize();else if(script)script.addEventListener('load',initialize,{once:true});else{script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.defer=true;script.dataset.googleIdentity='true';script.addEventListener('load',initialize,{once:true});document.head.appendChild(script)}return()=>{cancelled=true}},[googleClientId,forgot,register]);
 async function submit(e){e.preventDefault();setError('');setNotice('');if(register&&password!==confirm){setError('Those passwords do not match.');return}if(register&&!terms){setError('Please accept the terms to create your account.');return}setBusy(true);try{if(forgot){await requestPasswordReset(email);setNotice('Password reset email is unavailable until a delivery provider is configured.');return}const result=register?await registerUser({displayName,email,password,termsAccepted:terms}):await loginUser({email,password});const user=result.data.user;sessionStorage.setItem('amr-pending-next',new URLSearchParams(location.search).get('next')||'');onAuthenticated(user,result.data.next)}catch(err){setError(err.message)}finally{setBusy(false)}}
 const strength=[password.length>=10,/[A-Z]/.test(password),/[a-z]/.test(password),/[0-9]/.test(password)].filter(Boolean).length;
 return <main className="auth-screen"><div className="auth-art"><div className="auth-art-image"/><div className="auth-art-shade"/><button className="auth-back" onClick={()=>navigate('/')}>← <span>BACK TO THE ROOM</span></button><div className="auth-art-copy"><div className="section-label">AI MYSTERY ROOM · CASEWORK BEGINS HERE</div><h1>{forgot?'A lost key?':register?'The first clue':'The investigation'}<br/><em>{forgot?'Find your way back.':register?'is yours.':'begins.'}</em></h1><p>{forgot?"We'll help you get back to your investigations.":register?'Create your detective profile. Your first case is waiting.':'Your next mystery is waiting. Every detail has a story.'}</p><div className="auth-art-promise"><ShieldCheck size={15}/> Your cases stay private to your account.</div></div><div className="auth-art-index">AMR <i>·</i> EST. 2025</div></div><section className="auth-form-side"><div className="auth-mobile-brand"><Brand onClick={()=>navigate('/')}/></div><div className="auth-form-wrap"><div className="auth-kicker">{forgot?'ACCOUNT RECOVERY':register?'CREATE YOUR PROFILE':'WELCOME BACK'}</div><h2>{forgot?'Reset your password':register?'Join the investigation':'Sign in'}</h2><p className="auth-subtitle">{forgot?"Enter your email and we'll send recovery instructions.":register?'A name, an email, and your curiosity.':'Sign in to continue where the evidence left off.'}</p><form onSubmit={submit} noValidate>
  {register&&<div className="auth-field"><label htmlFor="displayName">DETECTIVE NAME</label><input id="displayName" autoComplete="name" value={displayName} onChange={e=>setDisplayName(e.target.value)} minLength={2} maxLength={60} placeholder="How should we address you?" required/></div>}
  <div className="auth-field"><label htmlFor="email">EMAIL ADDRESS</label><div className="input-with-icon"><Mail size={15}/><input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} placeholder="detective@example.com" required/></div></div>
  {!forgot&&<div className="auth-field"><label htmlFor="password">PASSWORD</label><div className="input-with-icon"><LockKeyhole size={15}/><input id="password" type={visible?'text':'password'} autoComplete={register?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={register?10:1} maxLength={128} placeholder={register?'At least 10 characters':'Enter your password'} required/><button type="button" className="show-password" onClick={()=>setVisible(!visible)} aria-label={visible?'Hide password':'Show password'}>{visible?<EyeOff size={15}/>:<Eye size={15}/>}</button></div>{register&&<div className="password-guide"><div className="strength-bars">{[0,1,2,3].map(x=><i key={x} className={x<strength?'filled':''}/>)}</div><span>10+ characters, uppercase, lowercase, and a number</span></div>}</div>}
  {register&&<div className="auth-field"><label htmlFor="confirmPassword">CONFIRM PASSWORD</label><div className="input-with-icon"><LockKeyhole size={15}/><input id="confirmPassword" type={visible?'text':'password'} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Enter your password again" required/></div></div>}
  {!register&&!forgot&&<div className="auth-utility"><label><input type="checkbox" disabled/> <span>Remember me <small>(not available in this version)</small></span></label><button type="button" onClick={()=>setForgot(true)}>Forgot password?</button></div>}
  {register&&<label className="terms-check"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/><span>I agree to the <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>. I understand all cases are fictional.</span></label>}
  {error&&<div className="form-message error-message" role="alert">{error}</div>}{notice&&<div className="form-message info-message" role="status">{notice}</div>}
  <button className="ice-button auth-submit" disabled={busy}>{busy?<><span className="spinner"/> {forgot?'Sending…':register?'Creating profile…':'Signing in…'}</>:<>{forgot?'SEND RECOVERY REQUEST':register?'CREATE ACCOUNT':'SIGN IN'} <ArrowRight size={15}/></>}</button>
  {!forgot&&<><div className="auth-divider"><span/> OR CONTINUE WITH <span/></div>{googleClientId?<div ref={googleButton} className="google-button-slot"/>:<button type="button" className="google-button-unavailable" disabled>Google sign-in · Configure OAuth client ID</button>}</>} </form><div className="auth-switch">{forgot?<button onClick={()=>setForgot(false)}>← Back to sign in</button>:register?<>Already have a profile? <button onClick={()=>navigate('/login')}>Sign in</button></>:<>New to the room? <button onClick={()=>navigate('/register')}>Create an account</button></>}</div><div className="auth-privacy"><LockKeyhole size={12}/> Protected with a secure server session</div></div><div className="auth-footer"><span>AI MYSTERY ROOM</span><span>FICTIONAL CASES · PRIVATE INVESTIGATIONS</span></div></section></main>
}

export function DashboardPage({user,navigate,onLogout,onReplay}){
 const[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;getDashboardData().then(res=>{if(active)setData(res.data)}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
 return <main className="dashboard-screen"><header className="dashboard-nav"><Brand onClick={()=>navigate('/')}/><nav><button onClick={onReplay}><HelpCircle size={15}/> HOW TO PLAY</button><button className="dash-avatar">{user.displayName.slice(0,2).toUpperCase()}</button><button className="nav-login" onClick={onLogout}>SIGN OUT</button></nav></header><section className="dashboard-welcome"><div className="section-label">YOUR PRIVATE INVESTIGATION DESK</div><h1>Welcome back,<br/><em>Detective {user.displayName}.</em></h1><p>Every case is a chance to see what others missed.</p><button className="ice-button" onClick={()=>navigate('/create')}>START AN INVESTIGATION <ArrowRight size={15}/></button><div className="dashboard-orbit">◈</div></section><div className="dashboard-content"><div className="dash-section-title"><div><div className="section-label">YOUR CASEBOOK</div><h2>Continue your investigation</h2></div><button onClick={()=>navigate('/create')}>+ NEW CASE</button></div>{error&&<div className="form-message error-message" role="alert">{error}</div>}{loading?<div className="dash-loading"><span className="spinner"/> Opening your casebook…</div>:data?.recentInvestigations?.length?<div className="casebook-grid">{data.recentInvestigations.map(item=><button className="casebook-card" key={item.investigationId} onClick={()=>{localStorage.setItem('amr-case',item.caseId);sessionStorage.setItem('amr-investigation',item.investigationId);navigate('/investigation')}}><div className="casebook-ornament">◈</div><div className="section-label">{item.status==='completed'?'CASE CLOSED':'ACTIVE INVESTIGATION'}</div><h3>{item.title}</h3><p>{item.difficulty} · Updated {new Date(item.updatedAt).toLocaleDateString()}</p><span>{item.status==='completed'?'REVIEW CASE':'CONTINUE CASE'} <ArrowRight size={13}/></span></button>)}</div>:<div className="dashboard-empty"><div className="empty-seal">◈</div><h3>Your casebook is empty.</h3><p>Start a solo investigation. Your cases and notes are saved to your account.</p><button className="text-arrow" onClick={()=>navigate('/create')}>CREATE YOUR FIRST CASE <ArrowRight size={14}/></button></div>}
 <div className="dash-lower"><section className="dash-stats"><div className="section-label">DETECTIVE RECORD</div><h3>Your work, counted.</h3><div className="stats-row"><div><b>{data?.stats?.casesStarted??'—'}</b><span>CASES STARTED</span></div><div><b>{data?.stats?.casesSolved??'—'}</b><span>CASES CLOSED</span></div></div><small>Statistics reflect server-recorded solo investigations.</small></section><section className="dash-learning"><div className="section-label">SKILLS & SUPPORT</div><h3>Need a field guide?</h3><p>Replay the training mystery or review how the investigation room works.</p><button onClick={onReplay}>RESTART TRAINING <ArrowRight size={13}/></button></section><section className="dash-coming"><div className="section-label">FUTURE MODES</div><h3>Better together.</h3><p>Team matches and group cases are being prepared.</p><span><Users size={14}/> MULTIPLAYER · COMING SOON</span></section></div></div></main>
}

const tourTargets=[['briefing','Case briefing','Start here. The briefing gives you the incident, setting, and first questions to answer.'],['suspects','Suspect directory','Meet the people connected to the case. Motive is context, not proof.'],['collection','Evidence collection','Open a clue to read its details and look for facts you can verify.'],['timeline','Investigation timeline','Put events in order. Timestamps can confirm or challenge an alibi.'],['board','Evidence board','Connect clues to build a theory. Your links are ideas, not verified case facts.'],['notes','Private notes','Record questions or observations. Notes stay private to your investigation.'],['assistant','Detective assistant','A guide can offer grounded hints. AI assistance is not guaranteed truth.'],['accusation','Accusation panel','Make your final choice after checking whether evidence supports it.'],['progress','Case progress','Track your place in this training tour and what remains to inspect.']];
const trainingSuspects=[{id:'mira',name:'Mira Sol',role:'Research lead',motive:'The presentation would expose a gap in her latest results.',alibi:'Says she left the building at 7:00 PM.',quote:'“I was out before the evening lock-up.”'},{id:'oren',name:'Oren Bell',role:'Lab assistant',motive:'Wanted credit for a discovery in the file.',alibi:'Says he stayed in the lab until 7:30 PM.',quote:'“I never entered the study.”'},{id:'talia',name:'Talia Quill',role:'Building archivist',motive:'Had no known reason to take the file.',alibi:'Says she was in the archive room all evening.',quote:'“I was cataloguing the old journals.”'}];
const trainingEvidence=[{title:'Message exchange',time:'6:48 PM',body:'Oren: “The file is still in the study cabinet.”\nMira: “Please leave it there until the review.”',type:'SIMULATED MESSAGE'},{title:'Building entry log',time:'7:18 PM',body:'Mira Sol — east entrance, badge accepted.\nOren Bell — lab entrance, badge accepted.',type:'ACCESS RECORD'},{title:'Witness statement',time:'7:22 PM',body:'The evening custodian saw Mira leave the study corridor carrying a document sleeve.',type:'WITNESS ACCOUNT'},{title:'Document timestamp',time:'7:24 PM',body:'A scan of the missing research file was created from the study terminal.',type:'DIGITAL RECORD'}];
export function OnboardingPage({user,navigate,onCompleted,onProgress}){
 const[step,setStep]=useState(Math.min(7,user.onboardingCurrentStep||0)),[busy,setBusy]=useState(false),[tourIndex,setTourIndex]=useState(0),[tour,setTour]=useState(false),[spot,setSpot]=useState(null),[opened,setOpened]=useState([]),[chosen,setChosen]=useState(''),[hint,setHint]=useState(false),[attempted,setAttempted]=useState(false),[guide,setGuide]=useState('');
 const tourRef=useRef(null);
 useEffect(()=>{if(!tour)return;const update=()=>{const el=document.querySelector(`[data-tour="${tourTargets[tourIndex][0]}"]`);if(!el)return setSpot(null);const r=el.getBoundingClientRect();setSpot({top:r.top,left:r.left,width:r.width,height:r.height})};update();const observer=new ResizeObserver(update);observer.observe(document.body);window.addEventListener('scroll',update,true);window.addEventListener('resize',update);const key=e=>{if(e.key==='Escape')setTour(false);if(e.key==='ArrowRight')setTourIndex(i=>Math.min(8,i+1));if(e.key==='ArrowLeft')setTourIndex(i=>Math.max(0,i-1))};window.addEventListener('keydown',key);return()=>{observer.disconnect();window.removeEventListener('scroll',update,true);window.removeEventListener('resize',update);window.removeEventListener('keydown',key)}},[tour,tourIndex]);
 async function persist(next,complete=false){setBusy(true);try{await updateOnboarding(complete?{completed:true,currentStep:8}:{currentStep:next});setStep(next);if(complete){onCompleted();const intended=sessionStorage.getItem('amr-pending-next');sessionStorage.removeItem('amr-pending-next');navigate(intended==='/create'?'/create':'/dashboard')}else if(next>=8){onCompleted();navigate('/dashboard')}}catch(error){if(import.meta.env.DEV){setStep(next);if(complete){onCompleted();navigate('/dashboard')}else if(next>=8){onCompleted();navigate('/dashboard')}}else setGuide(error.message)}finally{setBusy(false)}}
 function skip(){persist(8,true)}
 function next(){if(step===4&&(!opened.includes(0)||!opened.includes(1)||!chosen)){setGuide('Open the message and entry log, then choose a suspect to make your training accusation.');return}if(step===4&&!attempted){setGuide('Submit your accusation to see how the evidence fits together.');return}setGuide('');if(step===7)persist(8,true);else persist(step+1)}
 function accuseTraining(){setAttempted(true);if(chosen==='mira'){setGuide('Correct. The entry log and file timestamp contradict Mira\'s alibi, and the custodian places her near the study.')}else setGuide('Not quite. Recheck the entry time against the document timestamp. Motive alone cannot prove who took the file.')}
 const welcome=step===0;
 return <main className="onboarding-screen"><header className="onboarding-nav"><Brand onClick={()=>navigate('/')}/><div className="onboarding-nav-right"><span><Clock3 size={13}/> ABOUT 7 MINUTES</span><button onClick={skip} disabled={busy}>SKIP TRAINING <X size={14}/></button></div></header><div className="onboarding-progress"><div style={{width:`${Math.min(100,step/8*100)}%`}}/></div>
  {welcome?<section className="welcome-step"><div className="welcome-art"><div className="welcome-layers"/><span className="welcome-symbol">◈</span></div><div className="welcome-copy"><div className="section-label">YOUR FIRST INVESTIGATION STARTS HERE</div><h1>Welcome,<br/><em>Detective.</em></h1><p>Every case hides a story. Discover what really happened by examining evidence, questioning suspects, and connecting the clues.</p><div className="welcome-meta"><span><Clock3 size={14}/> ABOUT 7 MINUTES</span><span><ShieldCheck size={14}/> NO SCORE, NO PRESSURE</span></div><button className="ice-button" onClick={()=>persist(1)}>BEGIN MY TRAINING <ArrowRight size={15}/></button><button className="skip-link" onClick={skip}>I'll find my own way <ArrowRight size={13}/></button></div><div className="welcome-counter">TRAINING FILE <b>00 — 08</b></div></section>:<section className="onboarding-content"><div className="onboarding-stephead"><div className="section-label">FIELD TRAINING <span>STEP {String(step).padStart(2,'0')} / 08</span></div><div className="step-track">{Array.from({length:8},(_,i)=><i key={i} className={i<step?'done':i===step?'current':''}/>)}</div></div>
    {step===1&&<div className="tutorial-copy-step"><span className="large-step-icon"><BookOpen size={24}/></span><div className="section-label">THE MISSION</div><h1>Read the room.<br/><em>Find the truth.</em></h1><p>You'll receive a fictional case with suspects, evidence, statements, and a timeline. Your job is to compare what people say with what the evidence shows.</p><div className="concept-grid">{[['CASE','The mystery you need to solve.'],['SUSPECTS','People who may be connected.'],['EVIDENCE','Information that helps establish what happened.'],['TIMELINE','The events in the order they occurred.'],['ACCUSATION','Your final decision, supported by clues.']].map(([title,body])=><div key={title}><b>{title}</b><p>{body}</p></div>)}</div></div>}
    {step===2&&<div className="tutorial-copy-step"><span className="large-step-icon"><Users size={24}/></span><div className="section-label">CHOOSE YOUR MODE</div><h1>Investigate your<br/><em>own way.</em></h1><p>The kind of investigation changes who you work with and which actions are available.</p><div className="tutorial-mode-grid">{modes.map(({icon:Icon,title,text,available})=><article key={title} className={available?'':'future-mode'}><Icon size={20}/><div><b>{title}</b><p>{text}</p><span>{available?'AVAILABLE NOW':'COMING SOON'}</span></div></article>)}</div><div className="tutorial-tip"><Lightbulb size={16}/> Solo Investigation is ready now. Multiplayer modes will be clearly marked until they're available.</div></div>}
    {step===3&&<div className="tutorial-copy-step tour-step"><div className="section-label">A TOUR OF YOUR DESK</div><h1>Know where<br/><em>to look.</em></h1><p>We'll point out the real parts of this investigation room. Use the keyboard arrows or the controls to move through the tour.</p><button className="ice-button" onClick={()=>{setTour(true);setTourIndex(0)}}><Compass size={15}/> START THE DESK TOUR</button><div className="tour-preview-grid">{tourTargets.map(([id,title])=><div key={id} data-tour={id} className={`tour-target tour-${id}`}><span>{title}</span>{id==='assistant'&&<small>TRAINING GUIDE</small>}</div>)}</div></div>}
    {step===4&&<div className="training-step"><div className="section-label">PRACTICE CASE · TRAINING ONLY</div><h1>The Missing<br/><em>Research File</em></h1><p className="training-intro">A research file disappeared from a locked study room shortly before an important presentation. Three people were in the building that evening. What happened?</p><div className="training-layout"><div className="training-evidence"><h3>OPEN THE EVIDENCE</h3>{trainingEvidence.map((item,i)=><button className={`training-evidence-item ${opened.includes(i)?'opened':''}`} key={item.title} onClick={()=>setOpened(xs=>xs.includes(i)?xs:[...xs,i])}><span className="training-type">{item.type}</span><b>{item.title}</b><small>{item.time}</small>{opened.includes(i)&&<p>{item.body}</p>}</button>)}</div><div className="training-suspects"><h3>PERSONS OF INTEREST</h3>{trainingSuspects.map(item=><button key={item.id} className={`training-suspect ${chosen===item.id?'chosen':''}`} onClick={()=>{setChosen(item.id);setGuide(`${item.name}: ${item.quote}`)}}><b>{item.name}</b><small>{item.role} · possible motive: {item.motive}</small><span>{item.quote}</span></button>)}<button className="training-hint" onClick={()=>setHint(true)}><Lightbulb size={14}/> {hint?'Hint: compare Mira\'s departure claim to the 7:18 entry and 7:24 scan.':'Need a small hint?'}</button><button className="ice-button training-accuse" onClick={accuseTraining} disabled={opened.length<2||!chosen}>SUBMIT TRAINING ACCUSATION <ArrowRight size={14}/></button>{guide&&<p className={`training-guidance ${attempted&&chosen==='mira'?'correct':''}`} role="status">{guide}</p>}</div></div><p className="training-privacy">The training mystery is separate from your saved cases. You can try again if your first theory doesn\'t fit.</p></div>}
    {step===5&&<div className="tutorial-copy-step"><span className="large-step-icon"><Target size={24}/></span><div className="section-label">A PRACTICAL METHOD</div><h1>Evidence before<br/><em>instinct.</em></h1><p>Start broad, then test each claim against something you can verify.</p><ol className="method-list">{['Read the case briefing carefully.','Review every suspect and their stated alibi.','Open the evidence and record useful timestamps.','Build a timeline from the case facts.','Compare what people said with what the records show.','Connect clues that support the same theory.','Ask for a hint if you feel stuck.','Accuse only when evidence supports your conclusion.'].map((x,i)=><li key={x}><span>{String(i+1).padStart(2,'0')}</span>{x}</li>)}</ol><div className="tutorial-tip"><ShieldCheck size={16}/> Motive can help you ask a question. By itself, it isn\'t proof.</div></div>}
    {step===6&&<div className="tutorial-copy-step assistant-tutorial"><span className="large-step-icon"><Lightbulb size={24}/></span><div className="section-label">A GUIDE, NOT AN ANSWER KEY</div><h1>Meet your detective<br/><em>assistant.</em></h1><p>When connected, the assistant can summarize evidence, compare statements, and offer graduated hints grounded in your case.</p><div className="assistant-example-list">{['Summarize the strongest evidence.','Which statements contradict the timeline?','What should I investigate next?','Give me a small hint without revealing the answer.'].map(x=><div key={x}><MessageSquare size={14}/>{x}</div>)}</div><div className="assistant-unavailable"><span className="status-dot muted-dot"/> The in-game AI assistant is not connected in this version. This training guide works without AI, and we won't show invented AI replies.</div><div className="tutorial-tip"><ShieldCheck size={16}/> AI hints can help you think. The case\'s server-stored solution determines the result.</div></div>}
    {step===7&&<div className="completion-step"><div className="completion-medal"><Star size={25}/></div><div className="section-label">TRAINING FILE COMPLETE</div><h1>Your training<br/><em>is complete.</em></h1><p>You\'ve learned how to read a case, inspect clues, compare the timeline, and make an evidence-based accusation.</p><div className="skills-learned"><span><Check size={13}/> Read case briefings</span><span><Check size={13}/> Compare alibis with records</span><span><Check size={13}/> Connect evidence, not guesses</span><span><Check size={13}/> Request a hint when needed</span></div><div className="recommend-mode"><Compass size={17}/><span><b>YOUR FIRST CASE</b><small>Solo Investigation · available now</small></span><ChevronRight size={16}/></div></div>}
    {guide&&step!==4&&<div className="form-message error-message" role="alert">{guide}</div>}
    <div className="onboarding-controls">{step>1?<button className="back-step" onClick={()=>{setGuide('');persist(step-1)}} disabled={busy}><ArrowLeft size={14}/> PREVIOUS</button>:<span/>}<span>{step} OF 8</span>{step===7?<button className="ice-button" onClick={next} disabled={busy}>{busy?'SAVING…':'START MY FIRST INVESTIGATION'} <ArrowRight size={14}/></button>:<button className="ice-button" onClick={next} disabled={busy}>{busy?'SAVING…':'CONTINUE'} <ArrowRight size={14}/></button>}</div>
   </section>}
   {tour&&<div className="tour-layer"><div className="tour-spot" style={spot?{top:spot.top-8,left:spot.left-8,width:spot.width+16,height:spot.height+16}:undefined}/><div className="tour-dialog" ref={tourRef} role="dialog" aria-modal="true" aria-labelledby="tour-title" style={spot?{top:Math.min(window.innerHeight-210,spot.top+spot.height+14),left:Math.max(18,Math.min(window.innerWidth-350,spot.left))}:undefined}><button className="tour-close" onClick={()=>setTour(false)} aria-label="Close tour"><X size={16}/></button><div className="section-label">DESK TOUR · {tourIndex+1} / {tourTargets.length}</div><h2 id="tour-title">{tourTargets[tourIndex][1]}</h2><p>{tourTargets[tourIndex][2]}</p><div className="tour-dialog-controls"><button onClick={()=>setTourIndex(i=>Math.max(0,i-1))} disabled={tourIndex===0}>PREVIOUS</button><button onClick={()=>tourIndex===tourTargets.length-1?setTour(false):setTourIndex(i=>i+1)}>{tourIndex===tourTargets.length-1?'FINISH':'NEXT'} <ArrowRight size={13}/></button><button onClick={()=>setTour(false)}>SKIP TOUR</button></div></div></div>}
   <footer className="onboarding-footer"><span>AI MYSTERY ROOM · BEGINNER FIELD GUIDE</span><button onClick={skip}>EXIT TRAINING <X size={13}/></button></footer>
 </main>
}

const PRESET_STORIES = [
  {
    title: 'The Midnight Sapphire Heist',
    category: 'theft',
    difficulty: 'medium',
    suspectCount: 4,
    intensity: 'standard',
    tag: 'Gallery Theft',
    prompt: 'A priceless renaissance sapphire vanished from a locked glass gallery during a scheduled 90-second blackout. Four specialists had clearance, but the biometric laser perimeter was disabled from an internal terminal.'
  },
  {
    title: 'The Diplomatic Express Affair',
    category: 'missing object',
    difficulty: 'hard',
    suspectCount: 4,
    intensity: 'detailed',
    tag: 'Classic Train Mystery',
    prompt: 'A sealed treaty briefcase was covertly swapped for an exact replica while the luxury express crossed the mountain tunnel. Only the first-class passengers held keys to the corridor.'
  },
  {
    title: 'The Quantum Protocol Sabotage',
    category: 'corporate mystery',
    difficulty: 'hard',
    suspectCount: 4,
    intensity: 'detailed',
    tag: 'Tech Thriller',
    prompt: 'An encrypted quantum synthesis drive was scrubbed from the isolated air-gapped terminal 15 minutes before a landmark audit. The four lead research directors each claim they were attending the live keynote.'
  },
  {
    title: 'The Reclusive Clockmaker',
    category: 'disappearance',
    difficulty: 'easy',
    suspectCount: 3,
    intensity: 'standard',
    tag: 'Gothic Manor',
    prompt: 'An eccentric horologist disappeared from his cliffside workshop during a coastal storm, leaving behind an active automaton, a locked cellar door, and a coded pocket watch.'
  }
];

const GENERATION_STAGES = [
  'Formulating mystery premise and motive...',
  'Interrogating personas and conflicting alibis...',
  'Placing forensic clues and digital timestamp logs...',
  'Validating case consistency and fair-play deduction...'
];

export function CreateCasePage({navigate,onCreated}){
 const[scenario,setScenario]=useState(''),
      [category,setCategory]=useState('general detective mystery'),
      [difficulty,setDifficulty]=useState('medium'),
      [suspectCount,setSuspectCount]=useState(4),
      [intensity,setIntensity]=useState('standard'),
      [busy,setBusy]=useState(false),
      [stageIndex,setStageIndex]=useState(0),
      [error,setError]=useState(''),
      [selectedPreset,setSelectedPreset]=useState(null);

 useEffect(()=>{
   if(!busy) return;
   const interval = setInterval(()=>{
     setStageIndex(i=>(i+1)%GENERATION_STAGES.length);
   }, 2800);
   return ()=>clearInterval(interval);
 }, [busy]);

 function applyPreset(p){
   setSelectedPreset(p.title);
   setScenario(p.prompt);
   setCategory(p.category);
   setDifficulty(p.difficulty);
   setSuspectCount(p.suspectCount);
   setIntensity(p.intensity);
   setError('');
 }

 function rollRandom(){
   const pick = PRESET_STORIES[Math.floor(Math.random()*PRESET_STORIES.length)];
   applyPreset(pick);
 }

 async function submit(e){
   e.preventDefault();
   if(scenario.trim().length<30){
     setError('Please provide at least 30 characters for your fictional mystery premise.');
     return;
   }
   setError('');
   setBusy(true);
   setStageIndex(0);
   try{
     const response=await generateCase({scenario:scenario.trim(),category,difficulty,suspectCount,evidenceIntensity:intensity});
     const investigation=await createInvestigation(response.data.case.caseId);
     onCreated(response.data.case,investigation.data);
     navigate('/investigation');
   }catch(err){
     setError(err.message || 'Case generation failed. Please try again.');
   }finally{
     setBusy(false);
   }
 }

 const charCount = scenario.trim().length;
 const isLongEnough = charCount >= 30;

 return <main className="create-screen">
   <header className="dashboard-nav">
     <Brand onClick={()=>navigate('/')}/>
     <button className="nav-login" onClick={()=>navigate('/dashboard')}>
       <ArrowLeft size={14}/> BACK TO MY DESK
     </button>
   </header>

   <section className="create-layout">
     <div className="create-intro">
       <div className="section-label">THE NEXT CASE FILE</div>
       <h1>Begin with<br/><em>what happened.</em></h1>
       <p>Describe a fictional mystery. Gemini will synthesize the suspects, alibis, forensic clues, and timeline, and the server verifies fair-play consistency before launching your investigation.</p>
       
       <div className="create-assurance"><ShieldCheck size={16}/> The solution stays private until you submit your accusation.</div>
       <div className="create-assurance"><Clock3 size={16}/> AI case generation takes just a few seconds.</div>

       <div className="premise-presets">
         <div className="presets-header">
           <span className="presets-title"><Sparkles size={13}/> PREMISE STARTERS</span>
           <button type="button" className="random-prompt-btn" onClick={rollRandom}>
             <Dices size={13}/> Roll Random Premise
           </button>
         </div>
         <div className="preset-grid">
           {PRESET_STORIES.map(p=>(
             <div 
               key={p.title} 
               className={`preset-card ${selectedPreset===p.title?'active-preset':''}`}
               onClick={()=>applyPreset(p)}
             >
               <div className="preset-top">
                 <span className="preset-tag">{p.tag}</span>
                 <span className="preset-difficulty">{p.difficulty} · {p.suspectCount} suspects</span>
               </div>
               <div className="preset-title">{p.title}</div>
               <div className="preset-desc">{p.prompt}</div>
             </div>
           ))}
         </div>
       </div>
     </div>

     <form className="create-form-interactive" onSubmit={submit}>
       <div className="form-section-head">
         <div className="section-label">INVESTIGATION PARAMETERS</div>
         {selectedPreset && <span className="preset-tag">Preset: {selectedPreset}</span>}
       </div>

       <label className="field-label" htmlFor="premise">FICTIONAL STORY PREMISE</label>
       <textarea 
         id="premise" 
         className="interactive-textarea"
         value={scenario} 
         onChange={e=>{setScenario(e.target.value); setSelectedPreset(null);}} 
         minLength={30} 
         maxLength={3000} 
         required 
         placeholder="Describe what occurred... e.g. A priceless artifact disappeared from a locked vault during a lightning storm..."
       />

       <div className="premise-meta-bar">
         {isLongEnough ? (
           <span className="valid-status ok"><CheckCircle2 size={13}/> Premise meets minimum length requirement ({charCount} chars)</span>
         ) : (
           <span className="valid-status warn"><AlertCircle size={13}/> Minimum 30 characters required ({charCount} / 30)</span>
         )}
         <span style={{color:'#7c8f95'}}>{charCount} / 3,000</span>
       </div>

       <label className="field-label">MYSTERY CATEGORY</label>
       <div className="chip-group">
         {['general detective mystery','theft','murder mystery','missing object','corporate mystery','cyber mystery','disappearance'].map(c=>(
           <button
             type="button"
             key={c}
             className={`chip-btn ${category===c?'selected':''}`}
             onClick={()=>setCategory(c)}
           >
             {c}
           </button>
         ))}
       </div>

       <div className="form-control-row">
         <div>
           <label className="field-label" htmlFor="difficulty">DIFFICULTY</label>
           <select 
             id="difficulty" 
             className="custom-select"
             value={difficulty} 
             onChange={e=>setDifficulty(e.target.value)}
           >
             <option value="easy">Easy (Direct clues, simple alibis)</option>
             <option value="medium">Medium (Subtle alibis, realistic clues)</option>
             <option value="hard">Hard (Elaborate alibis, red herrings)</option>
           </select>
         </div>

         <div>
           <label className="field-label" htmlFor="suspects">SUSPECTS</label>
           <select 
             id="suspects" 
             className="custom-select"
             value={suspectCount} 
             onChange={e=>setSuspectCount(Number(e.target.value))}
           >
             {[3,4,5,6].map(n=><option key={n} value={n}>{n} Persons of Interest</option>)}
           </select>
         </div>
       </div>

       <div className="form-control-row" style={{marginTop:0}}>
         <div style={{gridColumn:'1 / -1'}}>
           <label className="field-label" htmlFor="evidence">EVIDENCE COLLECTION DEPTH</label>
           <select 
             id="evidence" 
             className="custom-select"
             value={intensity} 
             onChange={e=>setIntensity(e.target.value)}
           >
             <option value="standard">Standard (5 key evidence items: records, messages, witness statements)</option>
             <option value="detailed">Detailed (Expanded forensic dossier with additional timeline traces)</option>
           </select>
         </div>
       </div>

       <div className="fiction-notice">
         ⓘ Cases are strictly fictional. Do not include identifying details about real persons.
       </div>

       {error && <div className="form-message error-message" role="alert">{error}</div>}

       {busy ? (
         <div className="loading-box">
           <div className="loading-head">
             <span className="spinner"/>
             <b>INVESTIGATION ENGINE IN PROGRESS</b>
           </div>
           <div className="loading-step-list">
             {GENERATION_STAGES.map((stg, idx)=>(
               <div key={stg} className={`loading-step ${idx===stageIndex?'active':''}`}>
                 <span className="step-dot"/>
                 {stg}
               </div>
             ))}
           </div>
         </div>
       ) : (
         <button 
           type="submit" 
           className="ice-button create-submit" 
           disabled={!isLongEnough}
         >
           GENERATE MYSTERY & OPEN INVESTIGATION <ArrowRight size={15}/>
         </button>
       )}
     </form>
   </section>
 </main>;
}
