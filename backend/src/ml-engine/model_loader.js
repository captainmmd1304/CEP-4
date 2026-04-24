import { prisma } from '../lib/prisma.js';

export async function loadMlDataset() {
  const users = await prisma.user.findMany({
    include: {
      skills: { include: { skill: true } },
      hackathonLinks: true,
      teamMemberships: true,
      endorsementsGot: true,
      feedbackGiven: true,
    },
    orderBy: { id: 'asc' },
  });

  const conversations = await prisma.conversation.findMany({
    where: {
      requestStatus: 'accepted',
    },
    select: {
      fromUserId: true,
      toUserId: true,
    },
  });

  return {
    users,
    conversations,
  };
}
