import { apiRequest } from './api.js';
export const createInvestigation = (caseId) => apiRequest('/investigations',{method:'POST',body:{caseId}});
export const saveNotes = (investigationId,notes) => apiRequest(`/investigations/${encodeURIComponent(investigationId)}/notes`,{method:'PATCH',body:{notes}});
export const submitAccusation = (investigationId,suspectId) => apiRequest(`/investigations/${encodeURIComponent(investigationId)}/accusation`,{method:'POST',body:{suspectId}});
export const getResult = (investigationId) => apiRequest(`/investigations/${encodeURIComponent(investigationId)}/result`);
