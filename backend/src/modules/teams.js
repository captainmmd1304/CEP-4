import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from '../lib/http.js';
import { authRequired } from '../middleware/auth.js';
import { toUserDto } from '../lib/serializers.js';

const router = express.Router();

const createTeamSchema = z.object({
  hackathonId: z.number().int(),
  projectIdea: z.string().max(300).nullable().optional(),
  rolesNeeded: z.array(z.string()).min(1),
  maxSize: z.number().int().min(2).max(10),
});

const allowedRoles = new Set(['Builder', 'Designer', 'PM', 'Domain Expert']);

function toTeamDto(team) {
  return {
    id: team.id,
    hackathonId: team.hackathonId,
    hackathonName: team.hackathon.name,
    projectIdea: team.projectIdea,
    rolesNeeded: team.rolesNeeded.map((r) => r.role),
    currentSize: team.currentSize,
    maxSize: team.maxSize,
    creator: toUserDto(team.creator),
    members: team.members.map((m) => toUserDto(m.user)),
  };
}

router.get('/', asyncHandler(async (req, res) => {
  const hackathonName = String(req.query.hackathonName || '');

  const teams = await prisma.teamPosting.findMany({
    include: {
      hackathon: true,
      creator: { include: { skills: { include: { skill: true } } } },
      members: { include: { user: { include: { skills: { include: { skill: true } } } } } },
      rolesNeeded: true,
    },
    orderBy: { id: 'asc' },
  });

  const filtered = hackathonName
    ? teams.filter((t) => t.hackathon.name === hackathonName)
    : teams;

  res.json({ teams: filtered.map(toTeamDto), total: filtered.length });
}));

router.post('/', authRequired, asyncHandler(async (req, res) => {
  const body = createTeamSchema.parse(req.body);
  const creatorId = Number(req.auth.userId);

  if (body.rolesNeeded.some((role) => !allowedRoles.has(role))) {
    throw new AppError(400, 'Invalid role in rolesNeeded');
  }

  const hackathon = await prisma.hackathon.findUnique({ where: { id: body.hackathonId } });
  if (!hackathon) throw new AppError(404, 'Hackathon not found');

  const team = await prisma.teamPosting.create({
    data: {
      hackathonId: body.hackathonId,
      projectIdea: body.projectIdea ?? null,
      currentSize: 1,
      maxSize: body.maxSize,
      creatorId,
      rolesNeeded: {
        create: body.rolesNeeded.map((role) => ({ role })),
      },
      members: {
        create: [{ userId: creatorId }],
      },
    },
    include: {
      hackathon: true,
      creator: { include: { skills: { include: { skill: true } } } },
      members: { include: { user: { include: { skills: { include: { skill: true } } } } } },
      rolesNeeded: true,
    },
  });

  res.status(201).json({ team: toTeamDto(team) });
}));

router.post('/:id/join', authRequired, asyncHandler(async (req, res) => {
  const teamId = Number(req.params.id);
  const userId = Number(req.auth.userId);

  const team = await prisma.teamPosting.findUnique({
    where: { id: teamId },
    include: {
      members: true,
    },
  });
  if (!team) throw new AppError(404, 'Team not found');
  if (team.creatorId === userId) throw new AppError(400, 'Creator is already part of the team');
  if (team.members.some((m) => m.userId === userId)) {
    throw new AppError(409, 'Already a team member');
  }
  if (team.currentSize >= team.maxSize) {
    throw new AppError(400, 'Team is full');
  }

  await prisma.teamMember.create({ data: { teamId, userId } });
  await prisma.teamPosting.update({
    where: { id: teamId },
    data: { currentSize: { increment: 1 } },
  });

  const updated = await prisma.teamPosting.findUnique({
    where: { id: teamId },
    include: {
      hackathon: true,
      creator: { include: { skills: { include: { skill: true } } } },
      members: { include: { user: { include: { skills: { include: { skill: true } } } } } },
      rolesNeeded: true,
    },
  });

  res.json({ team: toTeamDto(updated) });
}));

export default router;
