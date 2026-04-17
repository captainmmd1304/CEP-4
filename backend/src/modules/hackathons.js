import express from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from '../lib/http.js';
import { authOptional, authRequired } from '../middleware/auth.js';
import { toHackathonDto, toUserDto } from '../lib/serializers.js';

const router = express.Router();

router.get('/', authOptional, asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const tag = String(req.query.tag || '');

  const hackathons = await prisma.hackathon.findMany({
    include: { attendees: true },
    orderBy: { id: 'asc' },
  });

  const filtered = hackathons.filter((h) => {
    const tags = Array.isArray(h.tags) ? h.tags : [];
    if (q) {
      const hay = `${h.name} ${tags.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (tag) {
      if (tag === 'Online') return h.online;
      return tags.includes(tag);
    }
    return true;
  });

  res.json({
    hackathons: filtered.map((h) => toHackathonDto(h, req.auth?.userId || null)),
    total: filtered.length,
  });
}));

router.get('/:id', authOptional, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const hackathon = await prisma.hackathon.findUnique({
    where: { id },
    include: {
      attendees: { include: { user: { include: { skills: { include: { skill: true } } } } } },
      teamPostings: {
        include: {
          hackathon: true,
          creator: { include: { skills: { include: { skill: true } } } },
          members: { include: { user: { include: { skills: { include: { skill: true } } } } } },
          rolesNeeded: true,
        },
      },
    },
  });

  if (!hackathon) throw new AppError(404, 'Hackathon not found');

  res.json({
    hackathon: toHackathonDto(hackathon, req.auth?.userId || null),
    attendees: hackathon.attendees.map((a) => toUserDto(a.user)),
    teams: hackathon.teamPostings.map((team) => ({
      id: team.id,
      hackathonId: team.hackathonId,
      hackathonName: team.hackathon.name,
      projectIdea: team.projectIdea,
      rolesNeeded: team.rolesNeeded.map((r) => r.role),
      currentSize: team.currentSize,
      maxSize: team.maxSize,
      creator: toUserDto(team.creator),
      members: team.members.map((m) => toUserDto(m.user)),
    })),
  });
}));

router.post('/:id/toggle-going', authRequired, asyncHandler(async (req, res) => {
  const hackathonId = Number(req.params.id);
  const userId = Number(req.auth.userId);

  const exists = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
  if (!exists) throw new AppError(404, 'Hackathon not found');

  const existing = await prisma.hackathonAttendee.findUnique({
    where: { hackathonId_userId: { hackathonId, userId } },
  });

  if (existing) {
    await prisma.hackathonAttendee.delete({
      where: { hackathonId_userId: { hackathonId, userId } },
    });
  } else {
    await prisma.hackathonAttendee.create({
      data: { hackathonId, userId },
    });
  }

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: hackathonId },
    include: { attendees: true },
  });

  res.json({ hackathon: toHackathonDto(hackathon, userId) });
}));

export default router;
