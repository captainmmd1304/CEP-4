import express from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from '../lib/http.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, asyncHandler(async (req, res) => {
  const userId = Number(req.auth.userId);
  const notifications = await prisma.notification.findMany({
    where: {
      OR: [{ userId }, { userId: null }],
    },
    orderBy: { id: 'asc' },
  });

  res.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      text: n.text,
      time: n.timeLabel,
      unread: n.unread,
      userId: n.userId,
    })),
    unreadCount: notifications.filter((n) => n.unread).length,
  });
}));

router.post('/:id/read', authRequired, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = Number(req.auth.userId);
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Notification not found');
  if (existing.userId !== null && existing.userId !== userId) {
    throw new AppError(403, 'Not allowed to update this notification');
  }

  const notification = await prisma.notification.update({
    where: { id },
    data: { unread: false },
  });

  res.json({ notification });
}));

export default router;
