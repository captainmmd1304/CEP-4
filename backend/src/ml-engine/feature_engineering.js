import { asSet, clamp, jaccardSimilarity, normalizeText, pairKey, safeDivide } from './utils.js';

const EXPERIENCE_TO_LEVEL = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

function getRoleComplementScore(baseRole, candidateRole) {
  const base = normalizeText(baseRole);
  const candidate = normalizeText(candidateRole);

  if (!base || !candidate) return 0.4;
  if (base === candidate) return 0.35;

  const strongPairs = new Set([
    'builder:designer',
    'builder:pm',
    'builder:domain expert',
    'designer:pm',
    'pm:domain expert',
  ]);

  const normalizedPair = base < candidate ? `${base}:${candidate}` : `${candidate}:${base}`;
  return strongPairs.has(normalizedPair) ? 1 : 0.55;
}

function toUserVector(user) {
  const skillNames = user.skills?.map((s) => s.skill?.name).filter(Boolean) || [];
  const hackathonIds = user.hackathonLinks?.map((h) => h.hackathonId) || [];
  const teamIds = user.teamMemberships?.map((m) => m.teamId) || [];

  return {
    id: user.id,
    name: user.name,
    role: user.role,
    experience: user.experience,
    openToTeam: user.openToTeam,
    skillSet: asSet(skillNames),
    skills: skillNames,
    hackathonSet: new Set(hackathonIds),
    teamSet: new Set(teamIds),
    experienceLevel: EXPERIENCE_TO_LEVEL[user.experience] || 1,
    strengthIndex: clamp(
      (
        safeDivide(user.hackathonsAttended, 20)
        + safeDivide(user.projectsBuilt, 12)
        + safeDivide(user.teamsFormed, 10)
      ) / 3,
      0,
      1,
    ),
  };
}

export function buildFeatureSpace(users, conversations = []) {
  const vectors = users.map(toUserVector);
  const vectorMap = new Map(vectors.map((v) => [v.id, v]));

  const collaborationPairs = new Set();
  for (const convo of conversations) {
    collaborationPairs.add(pairKey(convo.fromUserId, convo.toUserId));
  }

  return {
    vectors,
    vectorMap,
    collaborationPairs,
  };
}

export function pairwiseFeatures(base, candidate, collaborationPairs) {
  const skillOverlap = jaccardSimilarity(base.skillSet, candidate.skillSet);
  const sharedHackathons = jaccardSimilarity(base.hackathonSet, candidate.hackathonSet);
  const experienceGap = Math.abs(base.experienceLevel - candidate.experienceLevel);
  const experienceBlend = 1 - clamp(experienceGap / 2, 0, 1);
  const roleComplement = getRoleComplementScore(base.role, candidate.role);
  const collaboratedBefore = collaborationPairs.has(pairKey(base.id, candidate.id)) ? 1 : 0;

  return {
    skillOverlap,
    sharedHackathons,
    experienceBlend,
    roleComplement,
    collaboratedBefore,
    candidateStrength: candidate.strengthIndex,
  };
}
