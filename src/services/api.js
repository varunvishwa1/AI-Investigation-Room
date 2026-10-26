const configuredBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const localApi = (() => { try { const url=new URL(configuredBase); return ['localhost','127.0.0.1','::1'].includes(url.hostname)&&url.port==='5000'&&url.pathname.replace(/\/$/,'')==='/api/v1'; } catch { return false; } })();
const BASE_URL = import.meta.env.DEV && localApi ? '/api/v1' : configuredBase.replace(/\/$/,'');
let csrfToken=null,csrfPromise=null;

async function getCsrf(){
 if(csrfToken)return csrfToken;
 if(!csrfPromise)csrfPromise=fetch(`${BASE_URL}/auth/csrf`,{credentials:'include',headers:{Accept:'application/json'}}).then(async response=>{const payload=await response.json();if(!response.ok)throw new Error(payload?.error?.message||'Could not start a secure session.');csrfToken=payload.data.csrfToken;return csrfToken}).catch(()=>{throw new Error('The API is unavailable. Start `npm run dev:server` and confirm its MongoDB connection.')} ).finally(()=>{csrfPromise=null});
 return csrfPromise;
}

export async function apiRequest(path, { body, method = 'GET' } = {}, csrfRetry=false) {
  const headers = { Accept:'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if(!['GET','HEAD','OPTIONS'].includes(method))headers['X-CSRF-Token']=await getCsrf();
  let response;
  try { response = await fetch(`${BASE_URL}${path}`, { method, headers, credentials:'include', body:body===undefined?undefined:JSON.stringify(body) }); }
  catch { throw new Error('Could not reach the AI Mystery Room server. Check that the backend is running and try again.'); }
  const payload = await response.json().catch(()=>null);
  if(response.status===403&&payload?.error?.code==='CSRF_INVALID'&&!csrfRetry){csrfToken=null;await getCsrf();return apiRequest(path,{body,method},true)}
  if (!response.ok || payload?.success === false) throw new Error(payload?.error?.message || 'The request could not be completed. Please try again.');
  if(path==='/auth/login'||path==='/auth/register'||path==='/auth/google')csrfToken=null;
  return payload;
}
