import { recommendTeammates, scoreCandidateForTeam } from './recommender.js';
import { asSet } from './utils.js';

function extractThemeTokens(theme = '') {
  return asSet(String(theme).split(/[^a-zA-Z0-9+.#-]+/));
}

function teamSummary(team) {
  const skillCoverage = new Set();
  const roleBalance = {};
  const experiences = new Set();

  for (const member of team) {
    for (const skill of member.skills || []) skillCoverage.add(skill);
    roleBalance[member.role] = (roleBalance[member.role] || 0) + 1;
    experiences.add(member.experience);
  }

  return {
    size: team.length,
    skillCoverage: [...skillCoverage],
    roleBalance,
    mixedExperience: experiences.size > 1,
  };
}

export async function generateTeam({ userId, teamSize, theme = '' }) {
  const recommendation = await recommendTeammates(userId, { limit: 40 });
  if (!recommendation) return null;

  const desiredSize = teamSize;
  const themeTokens = extractThemeTokens(theme);

  const seed = recommendation.matches[0] ? [recommendation.matches[0]] : [];
  const selected = [];

  for (const initial of seed) {
    selected.push(initial);
  }

  const remainingPool = recommendation.matches.filter((m) => !selected.some((s) => s.userId === m.userId));
  const requiredSkillSet = themeTokens;
  const preferredRoles = ['Builder', 'Designer', 'PM', 'Domain Expert'];

  while (selected.length < Math.max(0, desiredSize - 1) && remainingPool.length > 0) {
    let bestIndex = -1;
    let bestGain = -1;

    for (let i = 0; i < remainingPool.length; i += 1) {
      const candidate = remainingPool[i];
      const gain = scoreCandidateForTeam(candidate, selected, {
        requiredSkillSet,
        preferredRoles,
      });

      if (gain > bestGain) {
        bestGain = gain;
        bestIndex = i;
      }
    }

    if (bestIndex < 0) break;
    selected.push(remainingPool.splice(bestIndex, 1)[0]);
  }

  return {
    ownerUserId: Number(userId),
    teamSize: desiredSize,
    theme,
    teammates: selected,
    optimization: teamSummary(selected),
  };
}
