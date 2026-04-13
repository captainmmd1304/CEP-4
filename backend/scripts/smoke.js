import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../src/lib/prisma.js';
import { createApp } from '../src/app.js';

async function main() {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const base = `http://127.0.0.1:${port}`;

    const healthRes = await fetch(`${base}/health`);
    const healthJson = await healthRes.json();

    const user = await prisma.user.findUnique({ where: { email: 'aisha@example.com' } });
    if (!user) throw new Error('Seed user not found');

    const passwordValid = await bcrypt.compare('password123', user.passwordHash);
    if (!passwordValid) throw new Error('Seed password mismatch');

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      subject: String(user.id),
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const [usersRes, hackathonsRes, inboxRes, showcaseRes, notificationsRes] = await Promise.all([
      fetch(`${base}/api/users?q=react`),
      fetch(`${base}/api/hackathons`),
      fetch(`${base}/api/messages/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${base}/api/showcase`),
      fetch(`${base}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const [usersJson, hackathonsJson, inboxJson, showcaseJson, notificationsJson] = await Promise.all([
      usersRes.json(),
      hackathonsRes.json(),
      inboxRes.json(),
      showcaseRes.json(),
      notificationsRes.json(),
    ]);

    const report = {
      health: healthJson,
      usersCount: usersJson.total,
      hackathonsCount: hackathonsJson.total,
      conversationsCount: inboxJson.total,
      showcaseCount: showcaseJson.total,
      unreadNotifications: notificationsJson.unreadCount,
    };

    console.log(JSON.stringify(report, null, 2));
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
