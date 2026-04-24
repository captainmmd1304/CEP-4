import { prisma } from '../lib/prisma.js';

export async function storeFeedback({ userId, recommendedId, action, context = null }) {
  return prisma.mlFeedback.create({
    data: {
      userId,
      recommendedId,
      action,
      context,
    },
  });
}

export function aggregateFeedbackBias(feedbackRows = []) {
  const byTarget = new Map();

  for (const row of feedbackRows) {
    const key = Number(row.recommendedId);
    const existing = byTarget.get(key) || { accept: 0, reject: 0 };
    if (row.action === 'accept') existing.accept += 1;
    if (row.action === 'reject') existing.reject += 1;
    byTarget.set(key, existing);
  }

  const biasByTarget = new Map();
  for (const [targetId, counts] of byTarget.entries()) {
    const total = counts.accept + counts.reject;
    if (!total) {
      biasByTarget.set(targetId, 0);
      continue;
    }

    const ratio = (counts.accept - counts.reject) / total;
    biasByTarget.set(targetId, ratio * 0.1);
  }

  return biasByTarget;
}
