# AI Mystery Room

## Master Product Specification and Single Source of Truth

**Document ID:** AMR-SPEC-001\
**Version:** 1.0.0\
**Status:** Approved baseline for implementation\
**Product:** AI Mystery Room\
**Primary implementer:** OpenAI Codex\
**Frontend:** React + JavaScript + Vite\
**Backend:** Node.js + Express + JavaScript\
**Database:** MongoDB + Mongoose\
**AI provider:** Google Gemini\
**Realtime:** Socket.IO\
**Document authority:** This file is the canonical source of product and
engineering requirements.

------------------------------------------------------------------------

# 0. Instructions for Codex

Before writing or changing code, read this file in full and inspect the
existing repository. Do not replace existing work without understanding
it.

## Non-negotiable rules

1.  Treat this specification as the primary source of truth.
2.  Use the MERN stack and Gemini specified here. Do not change core
    technologies without approval.
3.  Build in phases. Do not attempt a large, unreviewed rewrite.
4.  Keep Gemini credentials and all other secrets on the server.
5.  Keep the canonical culprit, answer key, and hidden solution on the
    server until the permitted reveal point.
6.  Never trust the browser for authorization, scoring, case status,
    timer results, or answer correctness.
7.  Validate every AI-generated case and every user-controlled request.
8.  Use mock cases only for development and automated tests. Do not
    leave the main production journey dependent on mock data.
9.  Do not add P2 features before the P0 core journey is reliable.
10. Do not claim completion without testing the implemented behavior.
11. If a major requirement is ambiguous, identify it and propose a safe
    default before making a breaking architectural decision.
12. Keep this specification and supporting implementation documentation
    synchronized. If a requirement changes, update this file through an
    explicit approved change.

## First action

Inspect the repository and report: - Current project structure and
technologies. - Existing working features. - Gaps against this
specification. - Security or architectural risks. - A phased
implementation plan. Then begin Phase 1 unless a major decision needs
approval.

------------------------------------------------------------------------

# 1. Product Vision

AI Mystery Room is an AI-powered fictional mystery investigation
platform. Users can create or play mysteries, inspect evidence,
interview AI-driven fictional suspects, connect clues, and identify a
culprit. The product supports solo play, competitive team play, and
collaborative group investigations.

The signature experience combines: - AI-generated, internally consistent
mysteries. - Multiple evidence formats: simulated chats, documents,
photographs, witness statements, timelines, and optional CCTV-style
media. - Interactive deduction and evidence connection. - Controlled AI
suspect interrogation. - Solo, Team vs Team, and Group Investigation
modes. - Mystery Exchange, where teams submit story premises and other
teams solve the resulting cases. - Server-validated answers, fair
scoring, and explainable solution reveals.

**Product promise:** Every published mystery has a stable, explainable
solution that can be deduced from the evidence made available to
players.

## 1.1 Product principles

-   **Fairness:** Players should not need to guess facts never supplied
    or reasonably inferable.
-   **Consistency:** A published case's culprit and canonical facts do
    not change during play.
-   **Agency:** Players choose what to inspect, whom to question, and
    how to connect clues.
-   **Social play:** Teams can compete or collaborate with clear privacy
    boundaries.
-   **Transparency:** AI-created content is fictional and presented as
    such.
-   **Accessibility:** Core gameplay must work on desktop, tablet, and
    mobile.
-   **Resilience:** Optional media failure must not make a valid case
    unplayable.
-   **Security:** Hidden solutions and private team notes are protected
    server-side.

------------------------------------------------------------------------

# 2. Scope and Release Priorities

Priority definitions: - **P0:** Required for the first reliable playable
release. - **P1:** Important follow-up after P0 is stable. - **P2:**
Future expansion, not part of the initial MVP.

## 2.1 P0 MVP

1.  Landing page and game-mode selection.
2.  Scenario creation form.
3.  Gemini case generation and structured validation.
4.  Case briefing and suspect directory.
5.  Evidence room with simulated messages, documents, and textual/image
    placeholders.
6.  Timeline and basic evidence board.
7.  Basic hints that do not reveal the answer.
8.  Accusation submission and server-side result.
9.  Solution reveal and explanation.
10. MongoDB persistence.
11. Guest solo play or a simple secure player session.
12. Basic account model planned so multiplayer can be added without
    rewriting the domain.
13. Responsive and accessible interface.
14. Automated tests for validation, answer-key protection, and the
    complete solo journey.
15. Environment configuration and setup documentation.

## 2.2 P1 Multiplayer release

1.  User accounts and profiles.
2.  Team creation, joining, membership, and roles.
3.  Private invitations and invite codes.
4.  Match lobby and ready states.
5.  Team vs Team mode.
6.  Realtime team chat and match events through Socket.IO.
7.  Group Investigation with multiple teams.
8.  Shared findings, private notes, and shared evidence board.
9.  Team scoring and match results.
10. Reconnection and persisted match state.
11. Mystery Exchange: team-created story premises assigned to other
    teams.

## 2.3 P1 immersive gameplay

1.  AI suspect interrogation.
2.  Detective assistant with hint and analysis modes.
3.  Evidence comparison and zoom.
4.  CCTV-style stills and transcript viewer.
5.  Dynamic evidence unlocks controlled by the backend.
6.  Investigation tasks and team assignments.
7.  Score breakdown and case replay.

## 2.4 P2 future enhancements

-   Actual generated video/audio, through optional separate media
    providers.
-   Advanced 3D investigation room.
-   Ranked seasons, tournaments, and leaderboards.
-   Daily mystery challenge.
-   Community case library and ratings.
-   Spectator mode.
-   Multiplayer matchmaking.
-   Premium subscriptions.
-   Native mobile apps.
-   Voice-based suspect interviews.
-   Advanced analytics and creator reputation.

Do not implement P2 features before the P0 acceptance criteria pass.

------------------------------------------------------------------------

# 3. Game Modes

## 3.1 Solo Investigation

**Purpose:** One player solves one case independently.

Flow: 1. Choose Solo. 2. Enter a scenario or select an available sample
case. 3. Choose category, difficulty, suspect count, and evidence level.
4. Generate or load the case. 5. Review briefing and suspects. 6.
Explore evidence, timeline, and investigation board. 7. Optionally
request a limited hint. 8. Submit one final accusation, according to the
case rules. 9. View the solution and score. 10. Save the result to the
user's history when an account is available.

Solo must remain fully playable without multiplayer services or a live
media-generation provider.

## 3.2 Team vs Team

**Purpose:** Two or more teams compete to solve a mystery.

Recommended initial configuration: - 2--8 teams per match,
configurable. - 2--6 members per team, configurable. - Same canonical
case and equivalent public evidence for every team. - Host-controlled
start after the lobby requirements are satisfied. - Server-authoritative
timer, state transitions, submissions, and scoring.

Competitive match flow: 1. Host creates a match and selects Team vs
Team. 2. Host configures case category, difficulty, duration, team
limits, hint rules, and scoring. 3. Teams join through invitation or a
private code. 4. Players ready up. 5. Host starts the match; the server
freezes settings and starts the official timer. 6. All teams receive the
same public case information at the match start. 7. Team members examine
evidence and discuss in their private team workspace. 8. A team can
submit its final accusation according to match rules. 9. Server locks
the submission and calculates the result. 10. Results remain hidden
until the configured reveal time if the match is simultaneous. 11. The
server publishes rankings and the solution. 12. The match record is
retained for review.

Competition format A: **Same Case Race**. Every team solves the same
case. Rank by score, then correct-submission time, then a documented
tie-breaker.

Competition format B: **Mystery Exchange**. Each participating team
submits a story premise. The server generates and validates a case for
each premise, then assigns each case to a different team. A team cannot
solve its own submitted case in that round. The creator cannot change
the canonical solution after publication. The case must be locked before
assignment. Creator teams can receive a post-round quality report, but
they cannot decide whether another team's answer is correct.

## 3.3 Group Investigation

**Purpose:** Multiple players and teams collaborate to solve one shared
case rather than compete.

Flow: 1. A host creates a private group investigation. 2. Participants
join and are organized into teams or workgroups. 3. The host selects or
generates a case. 4. The server creates a shared investigation session.
5. The group sees common evidence and a shared board. 6. Teams may
receive assigned areas such as digital messages, timeline, CCTV, or
witness interviews. 7. Teams record private notes and publish selected
findings to the shared workspace. 8. The group discusses evidence and
develops a shared theory. 9. An authorized member submits the final
group accusation. 10. The server reveals the solution and records
participation and outcome.

Privacy rules: - Public case evidence is visible to authorized
participants. - Team-private notes are visible only to that team and
authorized moderators if required. - Shared findings are visible to all
group participants. - A user's private scratch notes must not be
broadcast automatically. - A team must explicitly publish a finding to
the shared workspace. - The canonical answer remains hidden from all
players until the permitted reveal. - Group membership and permissions
must be checked on every protected request and socket event.

Suggested starting limits: 2--5 teams in a group, with limits
configurable by the server.

## 3.4 Mode comparison

  -----------------------------------------------------------------------
  Capability        Solo              Team vs Team      Group
                                                        Investigation
  ----------------- ----------------- ----------------- -----------------
  Players           One               Multiple          Multiple
                                      competing teams   collaborating
                                                        teams

  Case              Individual        Same case or      One shared case
                                      exchanged cases   

  Notes             Private to player Private to team   Private team
                                                        notes plus shared
                                                        findings

  Chat              Optional          Team chat         Team and group
                    assistant                           chat

  Board             Personal          Team board        Shared board plus
                                                        team workspaces

  Final answer      Player            Each team         Authorized group
                                                        submission

  Ranking           Personal score    Competitive       Collaboration
                                      ranking           outcome, optional
                                                        participation
                                                        score
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 4. Mystery Exchange

Mystery Exchange is a core differentiator: teams contribute story
premises and other teams solve AI-generated cases based on those
premises.

## 4.1 Creator workflow

1.  Team submits an original fictional premise.
2.  Creator selects category, tone, difficulty, suspect range, and
    evidence types.
3.  Backend validates input and runs safety checks.
4.  Gemini generates the canonical case, including culprit, timeline,
    evidence, and solution.
5.  Validation engine checks completeness, logical consistency, and
    solvability.
6.  Invalid cases are repaired or rejected within a bounded retry limit.
7.  A validated case is locked and marked ready for assignment.
8.  Server assigns it to a different team or a configured challenge
    pool.
9.  Solving team investigates without access to the hidden solution.
10. After the round, creator receives aggregate feedback and a
    case-quality report.

## 4.2 Integrity rules

-   The creator cannot edit the culprit, solution, or evidence after
    assignment.
-   Changes after publication require a new case version and must not
    alter an active match.
-   A team cannot be assigned its own case in a competitive exchange
    round.
-   Creator identity and private author notes are not shown to solving
    teams unless explicitly configured.
-   The server determines correctness and scoring.
-   Cases that fail validation cannot enter a competitive match.
-   The system must not allow a creator to place personal information
    about a real person into a fictional accusation.

## 4.3 Future community features

Case ratings, creator badges, public sharing, and community moderation
are P2. The initial Mystery Exchange can use private invitation-only
rounds.

------------------------------------------------------------------------

# 5. User Roles and Permissions

Roles are contextual; one user may hold different roles in different
teams or groups.

-   **Player:** Investigates and submits permitted actions.
-   **Team member:** Player within a team.
-   **Team leader:** Manages team membership and may submit the team
    answer.
-   **Match host:** Configures and starts a match, subject to server
    rules.
-   **Group owner:** Manages a collaborative group.
-   **Observer:** Can watch only where the mode allows it; cannot submit
    answers or access hidden solution data.
-   **Administrator:** Moderates abusive content and manages platform
    operations using audited privileged access.

Minimum rules: - Do not trust a role value sent by the client. - Check
the authenticated user and stored membership on the server. - Only
authorized team leaders or configured members may submit team answers. -
Only the host may start or cancel a lobby before the match begins. -
Once a competitive match starts, host powers cannot change its case,
scoring rules, or timer. - Administrative access must be audited and
must not be used to expose answers to competitors.

------------------------------------------------------------------------

# 6. User Journeys and Pages

## 6.1 Public pages

### Landing page

-   Product name and clear value proposition.
-   Primary CTA: Start Investigating.
-   Three mode cards: Solo, Team vs Team, Group Investigation.
-   How it works.
-   Featured fictional case preview.
-   Clear statement that cases and evidence are AI-generated fiction.
-   Sign in / create account entry points when authentication exists.
-   Footer with privacy, terms, and contact/help links.

Suggested headline: **Every Clue Tells a Story. Can You Find the
Truth?**

### Authentication

-   Sign up, sign in, sign out.
-   Secure password handling if password authentication is chosen.
-   Password reset workflow if supported.
-   Clear validation and error messages.
-   Do not store plaintext passwords.

### Dashboard

-   Start a new investigation.
-   Resume an in-progress investigation.
-   Recent cases and results.
-   Create/join a team.
-   Create/join a group.
-   Join by invite code.
-   Mystery Exchange access when enabled.
-   Profile and preferences.

## 6.2 Case creation page

Required inputs: - Scenario: 30--3,000 characters. - Category: murder
mystery, theft, missing object, disappearance, corporate mystery, cyber
mystery, general detective mystery. - Difficulty: Easy, Medium, Hard. -
Suspects: 3--6. - Evidence intensity: Standard or Detailed. - Optional
setting, time period, tone, and constraints.

The product must frame scenarios as fiction and reject or safely
redirect requests to fabricate accusations against identifiable real
people.

Buttons: Generate Mystery, Clear, Back.

Preserve input on failure. Validate on both client and server.

## 6.3 Generation state

Show actual workflow stages where possible: 1. Understanding the
premise. 2. Creating suspects and motives. 3. Establishing the timeline.
4. Generating evidence. 5. Checking consistency. 6. Preparing the case.

Do not fake progress percentages. Use a job ID and polling or Socket.IO
updates if generation is asynchronous. Prevent duplicate generation
submissions. Show retryable error states.

## 6.4 Investigation room

Desktop layout: - Header: case title, status, timer if relevant, menu. -
Left navigation: briefing, evidence categories, timeline, notes,
board. - Main area: selected evidence viewer or interactive board. -
Side panel: suspect directory or detective assistant. - Bottom or
persistent action: Review/Submit Accusation.

Required sections: - Case briefing. - Suspect profiles. - Evidence
room. - Timeline. - Notes. - Evidence connection board. - Optional
detective assistant. - Accusation flow.

Mobile layout must use tabs or collapsible panels, readable evidence,
touch-friendly controls, and an accessible accusation action.

## 6.5 Lobby

-   Match/group name and mode.
-   Host and participants.
-   Team list and membership.
-   Ready status.
-   Case category and difficulty.
-   Timer and rules.
-   Invite code/link.
-   Start button visible only to authorized host.
-   Leave lobby action.
-   Clear connection status and reconnection handling.

## 6.6 Results page

-   Correct/incorrect result.
-   Player/team accusation.
-   Canonical culprit.
-   Score breakdown.
-   Decisive evidence.
-   Timeline explanation.
-   Red-herring explanations.
-   Hints used and time where relevant.
-   Team ranking for competitive mode.
-   Replay, return to dashboard, or review case actions.

Do not reveal the canonical answer until the configured reveal condition
is satisfied.

------------------------------------------------------------------------

# 7. Interactive Gameplay Features

## 7.1 Evidence room

Evidence types: - Fictional chat conversations and call logs. - Emails
and documents. - Photographs and scene images. - CCTV-style stills or
transcripts. - Witness statements and interview transcripts. -
Physical-object descriptions. - Access logs, receipts, and timeline
records. - Optional audio/video assets.

Every evidence item includes an ID, title, type, description, content or
asset reference, source, relevant time, linked suspects/events, and a
narrative purpose. Do not expose hidden validation fields or the answer
key.

Messages should use a simulated interface clearly identified as
fictional, not a real WhatsApp integration.

## 7.2 Evidence board

Use a node-and-edge board so players can connect: - Suspects. -
Evidence. - Events. - Motives. - Locations. - Theories.

Players may label connections: Supports, Contradicts, Related, or
Uncertain. These connections are player theories, not canonical facts.
The app must distinguish player-created links from verified case
relationships. Persist board state per player/team/group as appropriate.

React Flow is the preferred starting library. Provide a list-based
alternative for accessibility and small screens.

## 7.3 Detective assistant

Modes: - **Hint:** Gives a graduated clue without naming the culprit. -
**Analyst:** Compares player-selected evidence and explains
contradictions. - **Organizer:** Summarizes known facts, suspects, and
open questions.

Rules: - Use only authorized public evidence and the current user's
permitted notes. - Do not reveal the hidden solution before reveal. - Do
not invent facts or evidence. - Ground claims in evidence IDs where
possible. - Use server-side prompts and response validation. - Apply
rate limits and hint limits where match rules require fairness. - In
competitive mode, apply the same assistant and hint rules to all teams.

## 7.4 Suspect interrogation

Players can ask fictional suspects questions. Each suspect has a defined
knowledge boundary, personality, motive, alibi, and established
statements.

Suspect responses must: - Stay consistent with the canonical case. -
Distinguish known facts from uncertainty. - Not invent decisive
evidence. - Not change the culprit or timeline. - Not reveal information
the suspect could not know. - Be recorded as a transcript when
required. - Be available under equal rules to all competitors.

For reliable behavior, build the response context from the case schema
and suspect knowledge model. Gemini generates the dialogue, but server
validation and controlled context define what is allowed.

## 7.5 Evidence inspection

Support image zoom, document reading, message timestamps, image
comparison, transcript playback-style controls, and clear loading/error
states. Optional generated media must not block core play.

## 7.6 Dynamic evidence unlocks

A case may unlock additional evidence after a valid action, such as
questioning a witness about a specific log. Unlock conditions must be
defined in the case schema and evaluated by the backend. A player action
must not allow Gemini to rewrite the culprit or canonical facts.

## 7.7 Investigation tasks

Hosts or game logic may assign areas of work: - Digital messages. -
Timeline reconstruction. - Witness interviews. - Visual evidence. -
Suspect motive analysis.

Track task status and assignee. Tasks are optional and must not prevent
unassigned players from accessing standard evidence unless the mode
explicitly defines separate evidence packets.

## 7.8 Cinematic design and sound

Use subtle case-opening animations, evidence transitions, restrained
ambient audio, and optional narration. Provide mute controls and respect
reduced-motion settings. Actual generated video is P2; CSS animations
and static assets are sufficient for MVP.

## 7.9 Progression and achievements

Future progression may include Trainee Detective, Junior Investigator,
Evidence Analyst, Senior Detective, and Master Investigator ranks.
Achievements can include First Case Solved, Contradiction Hunter,
No-Hint Investigator, Evidence Expert, and Perfect Deduction.
Achievements must be awarded by server-verified conditions, not client
claims.

------------------------------------------------------------------------

# 8. AI Mystery Generation and Validation

## 8.1 Pipeline

1.  Validate and normalize the premise.
2.  Apply safety checks.
3.  Generate a case outline and fictional setting.
4.  Establish exactly one canonical culprit for the MVP.
5.  Define motive, opportunity, method at a fictional high level, and
    the true event timeline.
6.  Create suspects and alibis.
7.  Generate evidence linked to established events.
8.  Add red herrings only if the final solution explains them.
9.  Generate decisive clues and the solution explanation.
10. Validate schema, references, timeline, and solvability indicators.
11. If needed, request targeted repairs within a configured retry limit.
12. Persist only validated cases as ready.
13. Return a public-safe case projection without the solution.

Never generate random evidence, suspects, and culprit independently
without consistency checks.

## 8.2 Required case fields

-   Unique case ID and schema version.
-   Title, category, difficulty, scenario, tone.
-   Briefing, location, incident time or relative-time frame.
-   3--6 suspects with profiles, motives, alibis, and statements.
-   Exactly one culprit ID for MVP.
-   Canonical timeline.
-   Evidence collection with IDs and typed content.
-   Decisive evidence IDs.
-   Solution summary and reasoning linked to evidence.
-   Red-herring explanations.
-   Optional unlock rules and media references.
-   Validation status and generation metadata kept server-side.

## 8.3 Difficulty guidance

-   **Easy:** 3 suspects, direct clue path, limited ambiguity.
-   **Medium:** 4--5 suspects, several connected clues and plausible red
    herrings.
-   **Hard:** 5--6 suspects, interlocking alibis and timeline reasoning.

Difficulty must reflect reasoning complexity, not just evidence count.

## 8.4 Validation checks

-   Unique suspect, evidence, and event IDs.
-   Culprit ID belongs to the case.
-   All references resolve.
-   Required fields exist and fit limits.
-   Timestamps use consistent ISO 8601 UTC timestamps or a documented
    relative-time model.
-   Decisive evidence exists and supports the solution.
-   Solution explanations refer to real evidence IDs.
-   Accidental contradictions are repaired or rejected.
-   Intentional contradictions are explainable.
-   The case is reasonably solvable from the player-visible evidence.
-   Public serialization excludes the answer key and private generation
    fields.
-   Asset references are valid or safely marked unavailable.

Use schema-constrained JSON output when supported by the selected Gemini
model/API. Still validate the output. Never assume a model response is
valid because it parses as JSON.

## 8.5 Gemini service rules

-   Use the official supported Google Gemini SDK/API.
-   Keep model ID configurable.
-   Centralize prompts in version-controlled prompt files.
-   Keep the provider behind a service interface.
-   Record prompt/schema versions for debugging without exposing
    secrets.
-   Handle timeouts, rate limits, malformed output, and provider
    failures.
-   Use bounded retries and safe error messages.
-   Do not send private team notes to an AI service unless the
    user-facing feature requires it and the privacy behavior is
    disclosed.
-   Do not treat model-generated evaluation as the authority for basic
    culprit correctness. The server compares submitted suspect ID with
    the locked canonical culprit. AI may produce an explanation based on
    stored solution data.

## 8.6 Media generation

Gemini text generation is not assumed to create every image/video/audio
asset. Use an optional media-provider adapter. For MVP, messages,
documents, transcripts, and static placeholders are sufficient. A media
failure must not make a validated case unplayable. All generated assets
are fictional and must be associated with a case and storage key.

------------------------------------------------------------------------

# 9. Canonical Data Model

The exact MongoDB document layout may use embedded subdocuments or
separate collections, but must preserve these logical entities and
access rules.

## 9.1 User

-   `_id`
-   `displayName`
-   `email` (unique when accounts are enabled)
-   `passwordHash` or external auth identity
-   `avatarAssetId` (optional)
-   `createdAt`, `updatedAt`
-   preferences and account status

Never store plaintext passwords.

## 9.2 Team

-   `_id`
-   `name`
-   `slug` or unique invite identifier
-   `ownerId`
-   `memberIds` or membership references
-   `roles`
-   `createdAt`, `updatedAt`

## 9.3 Group

-   `_id`
-   `name`
-   `ownerId`
-   `teamIds`
-   `memberIds`
-   `visibility`
-   `createdAt`, `updatedAt`

## 9.4 Case

-   `_id`
-   `caseId`
-   `creatorTeamId` or null
-   `category`, `difficulty`, `title`, `scenario`
-   `briefing`
-   `suspects`
-   `evidence` or evidence references
-   `timeline`
-   `solution` (server-only)
-   `unlockRules` (optional)
-   `status`: generating, validating, ready, failed, archived
-   `schemaVersion`
-   `promptVersion` or generator metadata
-   timestamps

## 9.5 Match

-   `_id`
-   `matchId`
-   `mode`: team_vs_team or mystery_exchange
-   `hostId`
-   `teamIds`
-   `caseId` or case assignments
-   `status`: lobby, ready, in_progress, submissions_locked, completed,
    cancelled
-   frozen `rules`: duration, scoring, hint limits, team limits
-   `startedAt`, `deadlineAt`, `completedAt`
-   timestamps

## 9.6 InvestigationSession

-   `_id`
-   `sessionId`
-   `mode`: solo, team_vs_team, group
-   `caseId`
-   `matchId` or `groupId` as appropriate
-   `playerId`, `teamId`, or `groupId` depending on session type
-   `status`
-   `notes` or note references
-   `boardState` or board reference
-   `unlockedEvidenceIds`
-   `hintCount`
-   `accusation`
-   `result` (only after completion)
-   timestamps

## 9.7 Evidence

-   `_id`
-   `evidenceId`
-   `caseId`
-   `type`
-   `title`, `description`
-   `content`
-   `assetIds`
-   `relatedSuspectIds`
-   `relatedEventIds`
-   `unlockRuleId` (optional)
-   public/private visibility metadata
-   timestamps

## 9.8 TeamFinding

-   `_id`
-   `caseId`
-   `groupId` or `matchId`
-   `teamId`
-   `authorId`
-   `content`
-   `linkedEvidenceIds`
-   `visibility`: private_team or shared_group
-   `createdAt`, `updatedAt`

## 9.9 ChatMessage

-   `_id`
-   `conversationId`
-   `scope`: team, group, or match
-   `authorId`
-   `content`
-   optional linked evidence IDs
-   `createdAt`
-   moderation/status metadata as needed

## 9.10 Submission and result

Store: - submitting player/team/group - selected suspect ID - submission
time - final/locked status - correctness - deterministic score
breakdown - relevant evidence selected or reasoning fields, if
supported - result reveal timestamp

The server must compute correctness and score. Never accept a
client-supplied score.

## 9.11 MediaAsset

-   `_id`
-   `assetId`
-   `caseId`
-   `type`: image, video, audio, document
-   `provider`
-   `storageKey`
-   `mimeType`
-   `status`: pending, ready, failed
-   metadata and timestamps

Use object storage for large binary media; do not store large video
blobs directly in ordinary MongoDB documents.

## 9.12 Important separation

A **Case** is the canonical mystery and solution. A **Match** defines
participants, rules, and competition. An **InvestigationSession**
records progress. A **Team/Group** defines membership and permissions.
Reusing a case in multiple matches must not mutate its solution.

------------------------------------------------------------------------

# 10. API Specification

Base path: `/api/v1`. All application endpoints use JSON unless serving
media.

Standard success: `{ "success": true, "data": { } }`

Standard error:
`{ "success": false, "error": { "code": "ERROR_CODE", "message": "Safe user-facing message" } }`

## 10.1 Auth and profile (when auth is enabled)

-   `POST /auth/register`
-   `POST /auth/login`
-   `POST /auth/logout`
-   `GET /auth/me`
-   `PATCH /users/me`

Use secure sessions or properly configured tokens. Do not implement
insecure token storage merely for convenience.

## 10.2 Cases

-   `POST /cases/generate` --- create a generation request; may return
    `202` with a job ID.
-   `GET /cases/:caseId` --- public-safe case view only.
-   `GET /cases/:caseId/evidence` --- paginated/filterable public
    evidence.
-   `GET /cases/:caseId/suspects` --- public suspect profiles.
-   `GET /cases/:caseId/timeline` --- public timeline only.
-   `GET /generation-jobs/:jobId` --- generation status if polling is
    used.

Never return the `solution`, `culpritId`, private prompts, or hidden
validation fields in public case endpoints.

## 10.3 Investigation

-   `POST /investigations` --- create a session.
-   `GET /investigations/:sessionId` --- retrieve authorized session
    state.
-   `PATCH /investigations/:sessionId/notes` --- update private notes.
-   `PATCH /investigations/:sessionId/board` --- persist authorized
    board state.
-   `POST /investigations/:sessionId/hints` --- request hint subject to
    rules.
-   `POST /investigations/:sessionId/interrogations` --- ask a suspect a
    question.
-   `POST /investigations/:sessionId/accusation` --- submit accusation.
-   `GET /investigations/:sessionId/result` --- return solution only
    after permitted reveal.

## 10.4 Teams and groups

-   `POST /teams`
-   `GET /teams/:teamId`
-   `PATCH /teams/:teamId`
-   `POST /teams/:teamId/invitations`
-   `POST /teams/join`
-   `POST /groups`
-   `GET /groups/:groupId`
-   `POST /groups/:groupId/join`
-   `POST /groups/:groupId/findings`
-   `GET /groups/:groupId/findings`

All endpoints must check stored membership and role permissions.

## 10.5 Matches

-   `POST /matches`
-   `GET /matches/:matchId`
-   `POST /matches/:matchId/join`
-   `POST /matches/:matchId/ready`
-   `POST /matches/:matchId/start`
-   `POST /matches/:matchId/submit`
-   `GET /matches/:matchId/results`
-   `POST /matches/:matchId/cancel` (only in permitted states)

The server owns state transitions and official timing.

## 10.6 Mystery Exchange

-   `POST /mystery-exchange/submissions`
-   `GET /mystery-exchange/submissions/:id/status`
-   `POST /mystery-exchange/rounds`
-   `GET /mystery-exchange/rounds/:roundId`
-   `POST /mystery-exchange/rounds/:roundId/assign` (authorized
    server/host workflow)

Only validated, locked cases can be assigned.

## 10.7 HTTP status codes

-   `200` success.
-   `201` created.
-   `202` asynchronous work accepted.
-   `400` invalid request.
-   `401` authentication required.
-   `403` forbidden.
-   `404` not found.
-   `409` invalid state or duplicate action.
-   `422` semantic validation failure.
-   `429` rate limited.
-   `500` unexpected server error.
-   `502` upstream provider failure.
-   `503` service unavailable.

Do not return stack traces, credentials, private prompts, or internal
secrets to clients.

------------------------------------------------------------------------

# 11. Realtime Socket.IO Contract

Socket.IO is used for multiplayer events, not as a replacement for REST
or database persistence. The server validates and persists important
state changes.

## 11.1 Authentication and rooms

-   Authenticate socket connections.
-   Join only rooms the authenticated user is authorized to access.
-   Use server-generated room names/IDs.
-   Check membership on every sensitive event.
-   Never trust a client-supplied `userId`, team role, score, timer, or
    correctness flag.
-   Apply payload size limits and rate limits.
-   Persist chat and important events to MongoDB.
-   Reconnect by re-fetching authoritative state from the server.

## 11.2 Client-to-server events

-   `lobby:join`
-   `lobby:leave`
-   `lobby:ready`
-   `match:start_request`
-   `chat:send`
-   `board:update`
-   `finding:publish`
-   `task:assign`
-   `presence:heartbeat` where needed

Event names may evolve, but document and version any changes.
High-impact operations should use REST or a clearly validated socket
command with equivalent authorization and idempotency protections.

## 11.3 Server-to-client events

-   `lobby:updated`
-   `player:presence`
-   `match:started`
-   `match:timer`
-   `evidence:unlocked`
-   `chat:message`
-   `board:updated`
-   `finding:published`
-   `task:updated`
-   `submission:locked`
-   `match:completed`
-   `error:notice`

Do not broadcast private notes or answer-key data to unauthorized rooms.

## 11.4 Reconnection

-   Persist match and investigation state.
-   On reconnect, re-authenticate and re-check membership.
-   Send a safe state snapshot.
-   Do not restart the timer or duplicate a submission.
-   Use idempotency or state checks for important actions.

------------------------------------------------------------------------

# 12. Scoring and Match Fairness

The score is server-generated and configurable per mode. Suggested
initial 100-point competitive scoring: - Correct culprit: 40 points. -
Correct decisive evidence selection: 30 points. - Correct explanation of
contradictions: 20 points. - Hint efficiency: 10 points.

This is a proposed baseline. It must be documented and frozen when a
match starts. Do not rely on a generative model alone to award
deterministic points. Use stored IDs, defined rubric rules, and
server-side validation. If free-text reasoning is scored by AI in a
future version, treat it as an explicitly configured, audited component
and do not allow it to override culprit correctness.

Same Case Race: 1. Higher total score. 2. Correct accusation over
incorrect accusation. 3. Earlier correct submission time if configured.
4. Documented tie-breaker if still tied.

Mystery Exchange: - Correct culprit and evidence-based reasoning are the
main success criteria. - Case creator feedback is separate from solver
score. - Creator cannot adjudicate the answer. - Case quality metrics
can include validation pass, evidence clarity, fair solvability, and
post-round ratings.

Group Investigation: - Primary outcome is whether the group solves the
case. - Optional participation metrics must not reward spam or expose
private notes. - No competitive ranking is required by default.

------------------------------------------------------------------------

# 13. Frontend Design System

## 13.1 Visual direction

A cinematic but readable detective workspace, not a generic AI
dashboard.

Suggested visual language: - Charcoal/slate surfaces. - Off-white
text. - Restrained amber for clue emphasis. - Red for
warnings/contradictions. - Green for verified findings. - Thin borders
and restrained shadows. - Clear hierarchy and readable evidence. -
Consistent spacing and component behavior.

Use accessible contrast. Color must not be the only way to communicate
status.

## 13.2 Animation

-   Smooth page and panel transitions.
-   Evidence opening/closing transitions.
-   Subtle hover and focus effects.
-   Loading skeletons and generation states.
-   Case-opening animation.
-   Reduced-motion support. Animations must never block core actions or
    hide essential information.

## 13.3 Reusable components

-   `Navbar`
-   `ModeCard`
-   `ScenarioForm`
-   `GenerationStatus`
-   `CaseHeader`
-   `CaseBriefing`
-   `SuspectCard`
-   `SuspectProfile`
-   `EvidenceCard`
-   `EvidenceViewer`
-   `MessageThread`
-   `DocumentViewer`
-   `ImageEvidenceViewer`
-   `CCTVTranscriptViewer`
-   `Timeline`
-   `EvidenceBoard`
-   `InvestigationNotes`
-   `DetectiveAssistant`
-   `InterrogationPanel`
-   `AccusationDialog`
-   `SolutionReveal`
-   `Lobby`
-   `TeamPanel`
-   `ChatPanel`
-   `MatchTimer`
-   `ScoreBreakdown`
-   `ErrorState`
-   `EmptyState`
-   `LoadingState`

Create components only when they have a clear responsibility. Avoid a
single oversized page component.

## 13.4 Accessibility

-   Keyboard navigation and visible focus.
-   Semantic buttons and form labels.
-   Accessible dialogs.
-   Screen-reader announcements for meaningful live updates.
-   Reduced motion.
-   Touch targets suitable for mobile.
-   Alternative list view for the evidence board.
-   Do not rely on drag-and-drop alone; offer click-based connection
    controls.

------------------------------------------------------------------------

# 14. Recommended Repository Structure

Adapt to existing files rather than blindly replacing them.

``` text
ai-mystery-room/
  client/
    src/
      assets/
      components/
        common/
        case/
        evidence/
        suspects/
        investigation/
        multiplayer/
      pages/
      layouts/
      hooks/
      services/
      context/
      utils/
      styles/
      App.jsx
      main.jsx
  server/
    src/
      config/
      controllers/
      routes/
      middleware/
      models/
      services/
      sockets/
      schemas/
      prompts/
      utils/
      app.js
      server.js
  docs/
    SPEC.md
    API.md
    ARCHITECTURE.md
    DATA_MODEL.md
    TESTING.md
  AGENTS.md
  README.md
  .gitignore
```

Suggested server services: - `geminiService.js` -
`caseGenerationService.js` - `caseValidationService.js` -
`caseSerializationService.js` - `investigationService.js` -
`accusationService.js` - `hintService.js` - `interrogationService.js` -
`teamService.js` - `groupService.js` - `matchService.js` -
`scoringService.js` - `mysteryExchangeService.js` - `mediaService.js`

Suggested model names: - `User` - `Team` - `Group` - `Case` -
`InvestigationSession` - `Match` - `TeamFinding` - `ChatMessage` -
`Submission` - `MediaAsset` - `Invitation`

------------------------------------------------------------------------

# 15. Environment Configuration

Backend `.env.example`:

``` dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room
GEMINI_API_KEY=replace_with_your_key
GEMINI_MODEL=replace_with_supported_model
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=replace_with_a_long_random_secret
```

Frontend `.env.example`:

``` dotenv
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Rules: - Never commit real `.env` files. - Never expose private keys
through `VITE_` variables. - Validate required backend variables at
startup. - Never log secret values. - Verify the selected Gemini SDK and
model identifier against current official documentation during
implementation. - Use HTTPS and production-appropriate session/cookie
settings in deployment. - `.gitignore` must exclude secret-bearing
environment files.

------------------------------------------------------------------------

# 16. Security, Privacy, and Abuse Prevention

## 16.1 General

-   Validate all user input on the backend.
-   Use request size limits, rate limiting, and safe error handling.
-   Do not render untrusted HTML.
-   Use secure authentication and authorization.
-   Check ownership and membership for every private resource.
-   Keep logs free of secrets and unnecessary private content.
-   Provide account/data deletion behavior when accounts are supported.
-   Store media in controlled object storage and authorize private asset
    access.

## 16.2 Prompt injection

-   Treat scenario text, messages, and user-supplied content as
    untrusted data.
-   Keep system prompts and tool privileges server-defined.
-   Validate all generated output against schemas and business rules.
-   Never let a user prompt override security rules or reveal server
    secrets.
-   Do not give the model direct authority to change match state,
    scores, memberships, or canonical answers.

## 16.3 Answer-key security

-   Never return `solution`, `culpritId`, hidden reasoning, or secret
    evaluation fields from public endpoints.
-   Never include answer-key data in socket payloads sent to player
    rooms.
-   Do not store the answer in client state, HTML, source maps, or local
    storage.
-   After submission, reveal only when mode rules permit it.
-   Validate the suspect belongs to the case and that the session is
    eligible for submission.
-   Lock the result once completed.

## 16.4 Multiplayer fairness

-   The server owns timers, state transitions, scores, and result
    release.
-   Freeze match rules and case assignments at start.
-   Use the same hints and evidence rules for competitors.
-   Prevent team members from joining unauthorized rooms.
-   Protect team-private notes and group-private content.
-   Limit repeated generation and interrogation calls.
-   Add basic moderation/reporting before opening public community
    submissions.

## 16.5 Fiction and safety

All cases, characters, evidence, chats, recordings, and images must be
presented as fictional or AI-generated. Do not fabricate evidence
accusing identifiable real people of crimes. Reject or safely redirect
requests for non-consensual private material or actionable criminal
instructions. Use original fictional chat content and clearly simulated
interfaces.

------------------------------------------------------------------------

# 17. Error Handling and Reliability

## AI errors

-   Bounded retries.
-   Clear error messages.
-   Preserve scenario input.
-   Never mark an invalid case ready.
-   Record safe diagnostic metadata.
-   Allow retry without duplicate case creation.

## Database errors

-   Do not claim success if persistence fails.
-   Do not return a usable case ID for a case that was not saved.
-   Use transactions where supported and necessary for multi-document
    critical operations.
-   Keep state transitions valid.

## Media errors

-   Keep textual evidence available.
-   Mark assets pending or failed.
-   Display a placeholder or transcript.
-   Do not fail the whole case because optional media generation failed.

## Multiplayer errors

-   Recover from dropped connections.
-   Restore state from the server after reconnect.
-   Reject duplicate or out-of-order transitions.
-   Prevent repeated final submissions.
-   Do not reset official timers on reconnect.
-   Show a clear connection indicator and retry path.

------------------------------------------------------------------------

# 18. Performance and Operational Requirements

These are targets to measure, not guarantees: - Static pages must not
wait for Gemini initialization. - Existing cases must be retrievable
without AI calls. - Use pagination or sensible limits for large evidence
lists. - Load media on demand. - Compress and resize images
appropriately. - Use asynchronous generation jobs when synchronous
requests risk timeouts. - Measure generation latency before promising a
fixed completion time. - Add request IDs and structured logs. - Provide
a health endpoint that does not expose secrets. - Add basic monitoring
for provider failures, generation validation failures, and multiplayer
socket errors. - Use indexes for common lookups: case ID, match
ID/status, team membership, session ID, user ID, and timestamps as
appropriate.

------------------------------------------------------------------------

# 19. Testing Strategy

Use unit, integration, frontend, and end-to-end tests. The exact testing
libraries may be selected to fit the existing repository; document the
selection.

## 19.1 Unit tests

-   Request and schema validation.
-   Case references and ID uniqueness.
-   Culprit belongs to suspect list.
-   Timeline consistency checks.
-   Public case serialization excludes solution.
-   Scoring rules.
-   Match state transitions.
-   Permission checks.
-   Duplicate submission handling.
-   Mystery Exchange assignment rules.

## 19.2 Integration tests

-   Gemini response parsing using mocked responses.
-   Case validation and persistence.
-   Public case retrieval.
-   Investigation creation and notes.
-   Accusation evaluation.
-   Group and team membership.
-   Match creation, joining, starting, and completion.
-   Socket authorization and room isolation.
-   Reconnection state recovery.

Automated tests must not require a live Gemini API call by default.

## 19.3 End-to-end scenarios

1.  Solo: generate case, inspect evidence, submit correct answer, see
    result.
2.  Solo: submit wrong answer, see clear explanation.
3.  AI failure: invalid output is rejected and retry works.
4.  Answer security: public API and sockets do not reveal culprit before
    reveal.
5.  Team vs Team: two teams join, ready, start, submit, and see fair
    results.
6.  Privacy: one team's private notes are inaccessible to another team.
7.  Group: teams publish selected findings and submit one shared answer.
8.  Mystery Exchange: a team's case is assigned to a different team and
    creator cannot alter it.
9.  Reconnect: disconnected player returns to the same
    server-authoritative state.
10. Mobile: core investigation actions work without clipped layout or
    drag-only controls.

## 19.4 AI quality checks

Use a fixed set of test scenarios to measure: - Schema validity. -
Suspect count compliance. - Evidence completeness. - Reference
validity. - Decisive clue presence. - Timeline consistency. -
Explainable solution. - Fair solvability. - Appropriate difficulty. -
Absence of accidental answer leakage.

A second AI evaluator may help identify weak cases, but it does not
guarantee solvability. Use deterministic structural checks and human
review during early development.

------------------------------------------------------------------------

# 20. Development Phases and Exit Criteria

## Phase 1: Repository foundation

-   Inspect existing repository.
-   Set up/verify client, server, MongoDB, environment configuration.
-   Add health endpoint and error middleware.
-   Add documentation and test commands.

**Exit:** Client and server run locally and database connection is
verified.

## Phase 2: Solo UI with mock data

-   Landing page, mode cards, scenario form, generation state.
-   Investigation room, evidence viewer, suspect profiles, timeline,
    board.
-   Accusation and result pages.

**Exit:** Full solo user journey works with test fixtures and all
visible controls have meaningful behavior.

## Phase 3: Gemini and case validation

-   Integrate Gemini service.
-   Implement canonical case schema and generation pipeline.
-   Validate and persist cases.
-   Implement public-safe serializer.

**Exit:** Real scenario creates a validated persistent case; public API
does not leak solution.

## Phase 4: Solo investigation engine

-   Evidence navigation, notes, hints, accusation, solution reveal.
-   Deterministic result evaluation and persistence.

**Exit:** Solo acceptance tests pass end to end.

## Phase 5: Accounts and team foundation

-   Authentication.
-   Team creation and invitations.
-   Membership/role checks.
-   Basic lobby and match data model.

**Exit:** Authorized users can create and join teams; unauthorized
access is rejected.

## Phase 6: Team vs Team

-   Socket.IO lobby and chat.
-   Server-authoritative match start/timer.
-   Shared team evidence board.
-   Submissions, scoring, result release, reconnect.

**Exit:** Two teams can complete a fair match and see server-computed
results.

## Phase 7: Group Investigation

-   Group creation.
-   Shared investigation state.
-   Private team notes and published findings.
-   Task assignments and collective accusation.

**Exit:** Teams collaborate without leaking private notes or solution.

## Phase 8: Mystery Exchange and interrogation

-   Case submission, validation, locking, and assignment.
-   Suspect interrogation and detective assistant.
-   Controlled evidence unlocking.

**Exit:** A team can create a premise, another team can solve the locked
case, and AI dialogue remains grounded in canonical data.

## Phase 9: Polish, security, deployment

-   Responsive and accessibility audit.
-   Error and performance testing.
-   Production configuration and deployment.
-   Update docs and remove accidental mock-only paths.

**Exit:** P0 and the intended release's acceptance criteria pass in the
deployed environment.

------------------------------------------------------------------------

# 21. Acceptance Criteria

## Solo MVP

-   **AC-01:** Valid scenario can be submitted.
-   **AC-02:** A case is generated with 3--6 suspects, evidence,
    timeline, and one canonical culprit.
-   **AC-03:** Invalid generated cases are rejected or repaired before
    publication.
-   **AC-04:** The culprit is one of the case suspects.
-   **AC-05:** Case persists in MongoDB.
-   **AC-06:** User can inspect briefing, suspects, evidence, and
    timeline.
-   **AC-07:** User can record notes and connect evidence.
-   **AC-08:** User can submit an accusation.
-   **AC-09:** Server computes correctness.
-   **AC-10:** Solution is revealed only after the permitted submission.
-   **AC-11:** AI/database/media failures show controlled errors.
-   **AC-12:** Missing optional media does not block play.
-   **AC-13:** Core experience works on desktop and mobile.
-   **AC-14:** Automated tests verify answer-key protection.

## Multiplayer

-   **AC-15:** Users can create/join teams with valid permissions.
-   **AC-16:** Lobby reflects current participants and ready state.
-   **AC-17:** Only authorized host can start a match.
-   **AC-18:** Match rules and case are frozen when play starts.
-   **AC-19:** All teams receive equivalent permitted evidence.
-   **AC-20:** Server owns timer, submission state, and scoring.
-   **AC-21:** One team's private notes are not accessible to another.
-   **AC-22:** Disconnected players can reconnect without resetting the
    match.
-   **AC-23:** Duplicate submissions cannot change completed results.
-   **AC-24:** Group findings can be shared deliberately.
-   **AC-25:** Mystery Exchange never assigns a case to its creator team
    in that round.
-   **AC-26:** Creator cannot change a case after assignment.
-   **AC-27:** Result reveal follows configured match rules.

## Product quality

-   **AC-28:** No private credentials are committed or exposed.
-   **AC-29:** API errors use a consistent format.
-   **AC-30:** README explains setup, environment, tests, and
    deployment.
-   **AC-31:** No P2 feature blocks the P0 release.
-   **AC-32:** Every implemented feature has relevant tests and
    documented status.

------------------------------------------------------------------------

# 22. Definition of Done

A feature is complete only when: - Its requirements are implemented. -
Data ownership and access control are correct. - Loading, empty, and
error states are handled. - Critical business logic is tested. -
Security and answer-key protection are preserved. - The feature
integrates with existing flows. - Documentation is updated where
necessary. - The developer reports what was tested and any known
limitations.

A polished UI with nonfunctional controls is not complete. A passing
build alone is not proof that the gameplay works.

------------------------------------------------------------------------

# 23. Change Control

For any proposed requirement change, Codex must report: 1. What changes.
2. Why it is needed. 3. Which pages, APIs, models, events, and tests are
affected. 4. Security and privacy implications. 5.
Migration/backward-compatibility implications. 6. The proposed update to
this specification.

Do not silently change core technologies, game rules, API semantics,
data ownership, or scoring. Approved changes must update this file and
supporting docs.

------------------------------------------------------------------------

# 24. Final Product Definition

AI Mystery Room is a multi-mode AI mystery platform: - **Solo:**
investigate independently. - **Team vs Team:** compete to solve a case
or exchange team-created mysteries. - **Group Investigation:**
collaborate across teams using shared findings and private workspaces. -
**Mystery Exchange:** create a fictional premise, let the AI build and
validate a locked case, and challenge another team to solve it.

Gemini creates structured fictional cases and dialogue. The backend
validates the mystery, protects the canonical solution, manages
multiplayer state, and calculates results. MongoDB persists cases and
progress. React delivers the interface. Socket.IO delivers authorized
realtime updates.

**The defining invariant:** A published case has a stable canonical
solution, and every player-facing clue, interaction, score, and reveal
must respect that solution and the permissions of the current game mode.
