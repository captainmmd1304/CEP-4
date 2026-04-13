import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from '../lib/http.js';
import { authRequired } from '../middleware/auth.js';
import { toUserDto } from '../lib/serializers.js';

const router = express.Router();

const sendMessageSchema = z.object({
  text: z.string().min(1).max(1000),
});

function toConversationListItem(convo, currentUserId) {
  const from = convo.from;
  const isIncoming = convo.toUserId === currentUserId;
  const lastMessage = convo.messages[0] || null;

  return {
    id: convo.id,
    type: convo.type,
    status: convo.requestStatus,
    from: toUserDto(from),
    incoming: isIncoming,
    requestMessage: convo.requestMessage,
    lastMessage: lastMessage
      ? {
          id: lastMessage.id,
          text: lastMessage.text,
          senderId: lastMessage.senderId,
          sentAt: lastMessage.sentAt,
        }
      : null,
    updatedAt: convo.updatedAt,
  };
}

router.get('/inbox', authRequired, asyncHandler(async (req, res) => {
  const userId = Number(req.auth.userId);

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    include: {
      from: { include: { skills: { include: { skill: true } } } },
      to: { include: { skills: { include: { skill: true } } } },
      messages: {
        orderBy: { sentAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const list = conversations.map((convo) => {
    const other = convo.fromUserId === userId ? convo.to : convo.from;
    return {
      ...toConversationListItem({ ...convo, from: other }, userId),
    };
  });

  res.json({ conversations: list, total: list.length });
}));

router.get('/:id', authRequired, asyncHandler(async (req, res) => {
  const userId = Number(req.auth.userId);
  const id = Number(req.params.id);

  const convo = await prisma.conversation.findUnique({
    where: { id },
    include: {
      from: { include: { skills: { include: { skill: true } } } },
      to: { include: { skills: { include: { skill: true } } } },
      messages: {
        include: { sender: { include: { skills: { include: { skill: true } } } } },
        orderBy: { sentAt: 'asc' },
      },
    },
  });
  if (!convo) throw new AppError(404, 'Conversation not found');
  if (convo.fromUserId !== userId && convo.toUserId !== userId) {
    throw new AppError(403, 'Not allowed to read this conversation');
  }

  res.json({
    conversation: {
      id: convo.id,
      type: convo.type,
      status: convo.requestStatus,
      requestMessage: convo.requestMessage,
      from: toUserDto(convo.from),
      to: toUserDto(convo.to),
      messages: convo.messages.map((m) => ({
        id: m.id,
        text: m.text,
        sender: toUserDto(m.sender),
        senderId: m.senderId,
        sentAt: m.sentAt,
      })),
    },
  });
}));

router.post('/:id/send', authRequired, asyncHandler(async (req, res) => {
  const userId = Number(req.auth.userId);
  const id = Number(req.params.id);
  const body = sendMessageSchema.parse(req.body);

  const convo = await prisma.conversation.findUnique({ where: { id } });
  if (!convo) throw new AppError(404, 'Conversation not found');
  if (convo.fromUserId !== userId && convo.toUserId !== userId) {
    throw new AppError(403, 'Not allowed to send messages in this conversation');
  }
  if (convo.type === 'request' && convo.requestStatus !== 'accepted') {
    throw new AppError(400, 'Accept request before sending messages');
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: userId,
      text: body.text,
    },
  });

  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  res.status(201).json({ message });
}));

router.post('/:id/accept', authRequired, asyncHandler(async (req, res) => {
  const userId = Number(req.auth.userId);
  const id = Number(req.params.id);

  const convo = await prisma.conversation.findUnique({ where: { id } });
  if (!convo) throw new AppError(404, 'Conversation not found');
  if (convo.toUserId !== userId) throw new AppError(403, 'Only receiver can accept request');
  if (convo.type !== 'request') throw new AppError(400, 'Conversation is not a request');

  await prisma.conversation.update({
    where: { id },
    data: { type: 'chat', requestStatus: 'accepted', updatedAt: new Date() },
  });

  const bootstrap = [
    convo.requestMessage ? { conversationId: id, senderId: convo.fromUserId, text: convo.requestMessage } : null,
    { conversationId: id, senderId: userId, text: "Accepted! Let's chat about the project." },
  ].filter(Boolean);

  if (bootstrap.length > 0) {
    await prisma.message.createMany({ data: bootstrap });
  }

  res.json({ ok: true });
}));

router.post('/:id/decline', authRequired, asyncHandler(async (req, res) => {
  const userId = Number(req.auth.userId);
  const id = Number(req.params.id);

  const convo = await prisma.conversation.findUnique({ where: { id } });
  if (!convo) throw new AppError(404, 'Conversation not found');
  if (convo.toUserId !== userId) throw new AppError(403, 'Only receiver can decline request');
  if (convo.type !== 'request') throw new AppError(400, 'Conversation is not a request');

  await prisma.conversation.update({
    where: { id },
    data: { requestStatus: 'declined', updatedAt: new Date() },
  });

  res.json({ ok: true });
}));

export default router;
