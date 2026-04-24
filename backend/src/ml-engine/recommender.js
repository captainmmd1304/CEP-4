import { buildFeatureSpace, pairwiseFeatures } from './feature_engineering.js';
import { aggregateFeedbackBias } from './feedback_learning.js';
import { loadMlDataset } from './model_loader.js';
import { clamp, toPercent, unique } from './utils.js';

const WEIGHTS = {
  skillOverlap: 0.34,
  sharedHackathons: 0.2,
  roleComplement: 0.18,
  experienceBlend: 0.14,
  collaboratedBefore: 0.08,
  candidateStrength: 0.06,
};

function inferRoleFit(requesterRole, candidateRole) {
  if (requesterRole === candidateRole) return candidateRole;
  if (requesterRole === 'Builder' && candidateRole === 'Designer') return 'Product Designer';
  if (requesterRole === 'Builder' && candidateRole === 'PM') return 'Product Coordinator';
  if (candidateRole === 'Domain Expert') return 'Domain Specialist';
  return candidateRole || 'Contributor';
}

function reasonsFromFeatures(base, candidate, features) {
  const reasons = [];
  if (features.skillOverlap >= 0.34) reasons.push('strong skills overlap');
  if (features.roleComplement >= 0.95) reasons.push('complementary team roles');
  if (features.sharedHackathons >= 0.2) reasons.push('shared hackathon interests');
  if (features.collaboratedBefore) reasons.push('prior collaboration signal');

  if (reasons.length === 0) {
    if (candidate.skillSet.size > 0 && base.skillSet.size === 0) {
      reasons.push('cold-start: fills missing skill profile');
    } else {
      reasons.push('balanced profile compatibility');
    }
  }

  return unique(reasons).slice(0, 3);
}

function scoreFromFeatures(features, bias = 0) {
  const raw = (
    features.skillOverlap * WEIGHTS.skillOverlap
    + features.sharedHackathons * WEIGHTS.sharedHackathons
    + features.roleComplement * WEIGHTS.roleComplement
    + features.experienceBlend * WEIGHTS.experienceBlend
    + features.collaboratedBefore * WEIGHTS.collaboratedBefore
    + features.candidateStrength * WEIGHTS.candidateStrength
    + bias
  );

  return clamp(raw, 0, 1);
}

export async function recommendTeammates(userId, options = {}) {
  const limit = Number(options.limit || 8);
  const { users, conversations } = await loadMlDataset();
  const { vectors, vectorMap, collaborationPairs } = buildFeatureSpace(users, conversations);

  const requester = vectorMap.get(Number(userId));
  if (!requester) return null;

  const feedbackBias = aggregateFeedbackBias(
    users.find((u) => u.id === Number(userId))?.feedbackGiven || [],
  );

  const ranked = vectors
    .filter((candidate) => candidate.id !== requester.id)
    .filter((candidate) => candidate.openToTeam)
    .map((candidate) => {
      const features = pairwiseFeatures(requester, candidate, collaborationPairs);
      const bias = feedbackBias.get(candidate.id) || 0;
      const compatibility = scoreFromFeatures(features, bias);

      return {
        user: candidate,
        score: toPercent(compatibility),
        reason: reasonsFromFeatures(requester, candidate, features),
        roleFit: inferRoleFit(requester.role, candidate.role),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      userId: item.user.id,
      name: item.user.name,
      role: item.user.role,
      experience: item.user.experience,
      skills: item.user.skills,
      score: item.score,
      reason: item.reason,
      roleFit: item.roleFit,
    }));

  return {
    userId: requester.id,
    matches: ranked,
  };
}

export function scoreCandidateForTeam(candidate, currentTeam, context = {}) {
  const { requiredSkillSet = new Set(), preferredRoles = [] } = context;

  const teamSkillSet = new Set();
  const teamRoles = new Set();
  for (const member of currentTeam) {
    for (const skill of member.skills || []) teamSkillSet.add(skill.toLowerCase());
    if (member.role) teamRoles.add(member.role);
  }

  let missingSkillGain = 0;
  for (const skill of candidate.skills || []) {
    const lower = skill.toLowerCase();
    if (!teamSkillSet.has(lower) && (requiredSkillSet.size === 0 || requiredSkillSet.has(lower))) {
      missingSkillGain += 1;
    }
  }

  const roleGain = !teamRoles.has(candidate.role) ? 1 : 0;
  const preferredRoleBoost = preferredRoles.includes(candidate.role) ? 0.3 : 0;
  const experienceSpreadBoost = candidate.experience === 'Intermediate' ? 0.15 : 0.05;

  return (
    missingSkillGain * 0.5
    + roleGain * 0.35
    + preferredRoleBoost
    + experienceSpreadBoost
  );
}
