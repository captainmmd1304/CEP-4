import express from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/http.js';
import { toUserDto } from '../lib/serializers.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const filter = String(req.query.filter || 'All');

  const projects = await prisma.showcaseProject.findMany({
    include: {
      members: { include: { user: { include: { skills: { include: { skill: true } } } } } },
      techStack: true,
    },
    orderBy: { id: 'asc' },
  });

  let filtered = projects;
  if (filter === 'winner') {
    filtered = projects.filter((p) => p.placement);
  } else if (filter !== 'All') {
    filtered = projects.filter((p) => p.hackathon === filter);
  }

  res.json({
    projects: filtered.map((p) => ({
      id: p.id,
      name: p.name,
      hackathon: p.hackathon,
      description: p.description,
      team: p.members.map((m) => toUserDto(m.user)),
      techStack: p.techStack.map((t) => t.tech),
      link: p.link,
      placement: p.placement,
      bannerGradient: p.bannerGradient,
    })),
    total: filtered.length,
  });
}));

export default router;
