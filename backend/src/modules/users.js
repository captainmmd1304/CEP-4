import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from '../lib/http.js';
import { authRequired } from '../middleware/auth.js';
import { toUserDto } from '../lib/serializers.js';

const router = express.Router();

const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  experience: z.string().optional(),
  timezone: z.string().optional(),
  role: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  openToTeam: z.boolean().optional(),
  avatarColor: z.number().int().min(0).max(7).optional(),
  skills: z.array(z.string()).optional(),
});

router.get('/', asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const role = String(req.query.role || '');
  const experience = String(req.query.experience || '');
  const timezone = String(req.query.timezone || '');
  const openToTeam = req.query.openToTeam === 'true' ? true : req.query.openToTeam === 'false' ? false : null;
  const skills = String(req.query.skills || '').split(',').map((s) => s.trim()).filter(Boolean);

  const users = await prisma.user.findMany({
    include: { skills: { include: { skill: true } } },
    orderBy: { id: 'asc' },
  });

  const filtered = users.filter((u) => {
    if (q) {
      const hay = `${u.name} ${u.role} ${u.skills.map((s) => s.skill.name).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (role && u.role !== role) return false;
    if (experience && u.experience !== experience) return false;
    if (timezone && u.timezone !== timezone) return false;
    if (openToTeam !== null && u.openToTeam !== openToTeam) return false;
    if (skills.length > 0 && !skills.some((skill) => u.skills.some((s) => s.skill.name === skill))) return false;
    return true;
  });

  res.json({ users: filtered.map(toUserDto), total: filtered.length });
}));

router.patch('/me', authRequired, asyncHandler(async (req, res) => {
  const body = updateMeSchema.parse(req.body);
  const userId = Number(req.auth.userId);

  const updateData = {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.bio !== undefined ? { bio: body.bio } : {}),
    ...(body.experience !== undefined ? { experience: body.experience } : {}),
    ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
    ...(body.role !== undefined ? { role: body.role } : {}),
    ...(body.github !== undefined ? { github: body.github } : {}),
    ...(body.linkedin !== undefined ? { linkedin: body.linkedin } : {}),
    ...(body.openToTeam !== undefined ? { openToTeam: body.openToTeam } : {}),
    ...(body.avatarColor !== undefined ? { avatarColor: body.avatarColor } : {}),
  };

  await prisma.user.update({ where: { id: userId }, data: updateData });

  if (body.skills) {
    const skillRows = await prisma.skill.findMany({ where: { name: { in: body.skills } } });
    await prisma.userSkill.deleteMany({ where: { userId } });
    if (skillRows.length > 0) {
      await prisma.userSkill.createMany({
        data: skillRows.map((s) => ({ userId, skillId: s.id })),
      });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { skills: { include: { skill: true } } },
  });
  if (!user) throw new AppError(404, 'User not found');
  res.json({ user: toUserDto(user) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
      endorsementsGot: {
        include: {
          from: {
            include: { skills: { include: { skill: true } } },
          },
        },
      },
    },
  });

  if (!user) throw new AppError(404, 'User not found');

  const hackathons = await prisma.hackathon.findMany({
    where: { attendees: { some: { userId: id } } },
    orderBy: { id: 'asc' },
  });
  const teams = await prisma.teamPosting.findMany({
    where: { members: { some: { userId: id } } },
    include: { hackathon: true },
  });
  const projects = await prisma.showcaseProject.findMany({
    where: { members: { some: { userId: id } } },
    include: { techStack: true },
  });

  res.json({
    user: toUserDto(user),
    endorsements: user.endorsementsGot.map((e) => ({
      id: e.id,
      skill: e.skill,
      comment: e.comment,
      from: toUserDto(e.from),
    })),
    hackathons,
    teams: teams.map((t) => ({
      id: t.id,
      hackathonId: t.hackathonId,
      hackathonName: t.hackathon.name,
      projectIdea: t.projectIdea,
      currentSize: t.currentSize,
      maxSize: t.maxSize,
    })),
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      hackathon: p.hackathon,
      description: p.description,
      link: p.link,
      placement: p.placement,
      bannerGradient: p.bannerGradient,
      techStack: p.techStack.map((t) => t.tech),
    })),
  });
}));

export default router;
