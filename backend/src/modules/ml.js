import express from 'express';
import { z } from 'zod';
import { recommendTeammates } from '../ml-engine/recommender.js';
import { generateTeam } from '../ml-engine/team_builder.js';
import { storeFeedback } from '../ml-engine/feedback_learning.js';
import { AppError, asyncHandler } from '../lib/http.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

const generateTeamSchema = z.object({
  teamSize: z.number().int().refine((v) => v === 4 || v === 5, {
    message: 'teamSize must be 4 or 5',
  }),
  theme: z.string().max(120).optional().default(''),
});

const feedbackSchema = z.object({
  userId: z.number().int(),
  recommendedId: z.number().int(),
  action: z.enum(['accept', 'reject']),
  context: z.enum(['recommend', 'team-gen']).optional(),
});

router.post('/recommend/:userId', authRequired, asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId <= 0) throw new AppError(400, 'Invalid userId');

  if (Number(req.auth.userId) !== userId) {
    throw new AppError(403, 'You can only request recommendations for your own profile');
  }

  const recommendation = await recommendTeammates(userId);
  if (!recommendation) throw new AppError(404, 'User not found');

  res.json({
    userId,
    matches: recommendation.matches,
  });
}));

router.post('/generate-team', authRequired, asyncHandler(async (req, res) => {
  const body = generateTeamSchema.parse(req.body);
  const userId = Number(req.auth.userId);

  const generated = await generateTeam({
    userId,
    teamSize: body.teamSize,
    theme: body.theme,
  });
  if (!generated) throw new AppError(404, 'User not found');

  res.json({
    ownerUserId: generated.ownerUserId,
    teamSize: generated.teamSize,
    theme: generated.theme,
    team: generated.teammates,
    optimization: generated.optimization,
  });
}));

router.post('/feedback', authRequired, asyncHandler(async (req, res) => {
  const body = feedbackSchema.parse(req.body);
  const authUserId = Number(req.auth.userId);

  if (body.userId !== authUserId) {
    throw new AppError(403, 'Feedback can only be submitted for the current user');
  }

  if (body.userId === body.recommendedId) {
    throw new AppError(400, 'Cannot submit feedback for yourself');
  }

  const created = await storeFeedback({
    userId: body.userId,
    recommendedId: body.recommendedId,
    action: body.action,
    context: body.context || null,
  });

  res.status(201).json({
    feedback: {
      id: created.id,
      userId: created.userId,
      recommendedId: created.recommendedId,
      action: created.action,
      context: created.context,
      createdAt: created.createdAt,
    },
  });
}));

export default router;
