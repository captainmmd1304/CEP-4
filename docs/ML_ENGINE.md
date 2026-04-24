# ML Engine Guide

This document describes how the TeamForge recommendation engine is implemented inside the existing Code Sathi backend.

## Overview

The ML engine is integrated into backend runtime and exposed through protected API routes. It does not run as a separate service.

Core files:

- `backend/src/ml-engine/recommender.js`
- `backend/src/ml-engine/feature_engineering.js`
- `backend/src/ml-engine/team_builder.js`
- `backend/src/ml-engine/feedback_learning.js`
- `backend/src/ml-engine/model_loader.js`
- `backend/src/ml-engine/train.js`
- `backend/src/ml-engine/utils.js`
- route integration: `backend/src/modules/ml.js`

## API Endpoints

All routes require JWT (`Authorization: Bearer <token>`).

### 1) Recommend teammates

- Method: `POST`
- Path: `/api/ml/recommend/:userId`
- Auth rule: `userId` in path must equal logged-in user id

Example request:

```http
POST /api/ml/recommend/1 HTTP/1.1
Authorization: Bearer <token>
```

Example response:

```json
{
  "userId": 1,
  "matches": [
    {
      "userId": 8,
      "name": "Priya Sharma",
      "role": "Domain Expert",
      "experience": "Advanced",
      "skills": ["Computer Vision", "Python", "TensorFlow"],
      "score": 84,
      "reason": ["complementary team roles", "shared hackathon interests"],
      "roleFit": "Domain Specialist"
    }
  ]
}
```

### 2) Auto-generate team

- Method: `POST`
- Path: `/api/ml/generate-team`
- Body: `teamSize` must be `4` or `5`, optional `theme`

Example request:

```json
{
  "teamSize": 4,
  "theme": "AI Healthcare"
}
```

Example response:

```json
{
  "ownerUserId": 1,
  "teamSize": 4,
  "theme": "AI Healthcare",
  "team": [
    {
      "userId": 8,
      "name": "Priya Sharma",
      "role": "Domain Expert",
      "experience": "Advanced",
      "skills": ["Computer Vision", "Python", "TensorFlow"],
      "score": 84,
      "reason": ["complementary team roles"],
      "roleFit": "Domain Specialist"
    }
  ],
  "optimization": {
    "size": 3,
    "skillCoverage": ["Python", "TensorFlow"],
    "roleBalance": { "Domain Expert": 1 },
    "mixedExperience": true
  }
}
```

Note: returned `team` is the selected teammate list. UI combines owner + teammates for full team display.

### 3) Feedback learning

- Method: `POST`
- Path: `/api/ml/feedback`
- Body fields:
  - `userId` (must match auth user)
  - `recommendedId`
  - `action`: `accept` or `reject`
  - `context` (optional): `recommend` or `team-gen`

Example request:

```json
{
  "userId": 1,
  "recommendedId": 8,
  "action": "accept",
  "context": "recommend"
}
```

Example response:

```json
{
  "feedback": {
    "id": 17,
    "userId": 1,
    "recommendedId": 8,
    "action": "accept",
    "context": "recommend",
    "createdAt": "2026-04-24T12:00:00.000Z"
  }
}
```

## Scoring Logic

Current recommender uses a hybrid weighted score:

- `skillOverlap`: `0.34`
- `sharedHackathons`: `0.20`
- `roleComplement`: `0.18`
- `experienceBlend`: `0.14`
- `collaboratedBefore`: `0.08`
- `candidateStrength`: `0.06`

Raw score formula:

```text
rawScore =
  skillOverlap * 0.34
  + sharedHackathons * 0.20
  + roleComplement * 0.18
  + experienceBlend * 0.14
  + collaboratedBefore * 0.08
  + candidateStrength * 0.06
  + feedbackBias
```

Final compatibility score:

```text
compatibility = clamp(rawScore, 0, 1)
responseScore = round(compatibility * 100)
```

Implementation reference: `backend/src/ml-engine/recommender.js`.

## Feature Engineering Details

From `backend/src/ml-engine/feature_engineering.js`:

- `skillOverlap`: Jaccard similarity over user skill sets
- `sharedHackathons`: Jaccard similarity over attended hackathon IDs
- `experienceBlend`: `1 - clamp(abs(levelA-levelB)/2, 0, 1)` where levels are:
  - `Beginner = 1`
  - `Intermediate = 2`
  - `Advanced = 3`
- `roleComplement`:
  - same role -> lower complement score
  - strong complement pairs include:
    - Builder + Designer
    - Builder + PM
    - Builder + Domain Expert
    - Designer + PM
    - PM + Domain Expert
- `collaboratedBefore`: `1` if users have accepted conversation history, else `0`
- `candidateStrength`: normalized blend of
  - `hackathonsAttended`
  - `projectsBuilt`
  - `teamsFormed`

## Cold Start Behavior

When a user has little or no behavioral data:

- recommendations still work using profile-based features (skills, role, experience, hackathon overlap, strength)
- feedback bias defaults to `0`
- collaboration signal defaults to `0` when there is no accepted history

This ensures non-empty ranking for new users with basic profile information.

## Feedback Learning Behavior

Feedback rows are stored in `MlFeedback`.

- accept/reject counts are aggregated per recommended target
- bias is computed as:

```text
ratio = (acceptCount - rejectCount) / (acceptCount + rejectCount)
feedbackBias = ratio * 0.1
```

- positive bias slightly raises score for that target
- negative bias slightly lowers score for that target

Implementation reference: `backend/src/ml-engine/feedback_learning.js`.

## Team Generation Strategy

`/api/ml/generate-team` uses recommendation results as candidate pool and greedily maximizes team utility:

- favors missing skill coverage
- improves role diversity
- keeps preferred role spread (`Builder`, `Designer`, `PM`, `Domain Expert`)
- includes a small experience spread boost
- optional `theme` is tokenized and used as required skill hints

Implementation reference: `backend/src/ml-engine/team_builder.js` and `backend/src/ml-engine/recommender.js`.

## Database Entities Used

Main models involved:

- `User`
- `UserSkill` / `Skill`
- `HackathonAttendee`
- `TeamMember`
- `Conversation` (accepted request status)
- `MlFeedback`

`MlFeedback` relation is wired in `backend/prisma/schema.prisma` and used for online preference adaptation.

## Operational Notes

- no separate ML worker/service to boot
- engine starts with backend process
- endpoint latency depends on live DB size because ranking is generated from current dataset in-memory per request
- for scale, add caching and/or periodic materialized candidate vectors

## Quick Test Flow

1. Log in and call `POST /api/ml/recommend/:userId`.
2. Verify `matches` with `score`, `reason`, and `roleFit`.
3. Submit `POST /api/ml/feedback` with `accept` or `reject`.
4. Re-run recommend endpoint and confirm ordering can shift slightly.
5. Call `POST /api/ml/generate-team` with `teamSize: 4` or `5`.
