import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from '../lib/http.js';
import { authRequired } from '../middleware/auth.js';
import { toUserDto } from '../lib/serializers.js';

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

router.post('/register', asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw new AppError(409, 'Email already in use');

  const passwordHash = await bcrypt.hash(body.password, 10);
  const initials = body.name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
      initials,
      bio: '',
      experience: 'Beginner',
      timezone: 'UTC+0 (GMT)',
      role: 'Builder',
      github: '',
      linkedin: '',
      openToTeam: true,
      avatarColor: 0,
      hackathonsAttended: 0,
      teamsFormed: 0,
      projectsBuilt: 0,
    },
    include: { skills: { include: { skill: true } } },
  });

  const token = signToken(user);
  res.status(201).json({ token, user: toUserDto(user, { includeEmail: true }) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    include: { skills: { include: { skill: true } } },
  });
  if (!user) throw new AppError(401, 'Invalid email or password');

  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) throw new AppError(401, 'Invalid email or password');

  const token = signToken(user);
  res.json({ token, user: toUserDto(user, { includeEmail: true }) });
}));

router.get('/me', authRequired, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.auth.userId) },
    include: { skills: { include: { skill: true } } },
  });
  if (!user) throw new AppError(404, 'User not found');
  res.json({ user: toUserDto(user, { includeEmail: true }) });
}));

export default router;
