import { apiRequest } from './api.js';
export const generateCase = (body) => apiRequest('/cases/generate',{method:'POST',body});
export const getCase = (caseId) => apiRequest(`/cases/${encodeURIComponent(caseId)}`);
