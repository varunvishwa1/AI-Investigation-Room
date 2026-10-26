import { validateGeneratedCase } from '../schemas/caseSchema.js';

export { validateGeneratedCase };

export function publicCase(caseDoc) {
  const item = typeof caseDoc.toObject === 'function' ? caseDoc.toObject() : caseDoc;
  const { solution, __v, ...safe } = item;
  return safe;
}
