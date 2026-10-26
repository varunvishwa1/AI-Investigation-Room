# Data model

## User

Stores display name, normalized unique email, bcrypt password hash, role, onboarding completion/current step, and timestamps. Password hashes are excluded from normal queries and user API projections.

## Case

Stores a unique `caseId`, original premise and generation options, title, briefing, location, suspects, evidence, timeline, ready status, schema version, and timestamps. The canonical solution is a strict nested schema with `select: false`. Validation checks that the culprit ID belongs to the suspect array.

## Investigation

Stores investigation ID, case ID, owning user ID, status, notes, selected suspect, final result, and start/completion timestamps. The result is written once when the status transitions from active to completed.

## MediaAsset

Stores asset ID, case ID, type, external storage reference, MIME type, status, and metadata. Large media content is not stored in a Mongo document.

## Privacy boundary

Public case serializers expose only player-visible case material. The canonical answer is disclosed through a completed result after the player submits an accusation. Investigations and notes are scoped to the signed-in owner.
