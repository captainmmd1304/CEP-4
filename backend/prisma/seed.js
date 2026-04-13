import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const skills = [
  { name: 'React', color: 'blue' },
  { name: 'Python', color: 'green' },
  { name: 'Machine Learning', color: 'purple' },
  { name: 'UI/UX', color: 'pink' },
  { name: 'Node.js', color: 'green' },
  { name: 'Blockchain', color: 'orange' },
  { name: 'Flutter', color: 'blue' },
  { name: 'TypeScript', color: 'blue' },
  { name: 'Rust', color: 'orange' },
  { name: 'Go', color: 'blue' },
  { name: 'AWS', color: 'yellow' },
  { name: 'Figma', color: 'pink' },
  { name: 'Docker', color: 'blue' },
  { name: 'GraphQL', color: 'purple' },
  { name: 'TensorFlow', color: 'orange' },
  { name: 'Solidity', color: 'purple' },
  { name: 'NLP', color: 'purple' },
  { name: 'Computer Vision', color: 'green' },
  { name: 'Web3', color: 'purple' },
  { name: 'Data Science', color: 'blue' },
  { name: 'AR/VR', color: 'pink' },
  { name: 'IoT', color: 'green' },
];

const users = [
  {
    id: 1,
    name: 'Aisha Patel',
    email: 'aisha@example.com',
    initials: 'AP',
    bio: 'Full-stack developer passionate about building scalable web apps. Love hackathons!',
    skills: ['React', 'Node.js', 'TypeScript'],
    experience: 'Advanced',
    timezone: 'UTC+5:30 (IST)',
    role: 'Builder',
    github: 'github.com/aishap',
    linkedin: 'linkedin.com/in/aishap',
    openToTeam: true,
    avatarColor: 0,
    hackathonsAttended: 12,
    teamsFormed: 8,
    projectsBuilt: 6,
  },
  {
    id: 2,
    name: 'Marcus Chen',
    email: 'marcus@example.com',
    initials: 'MC',
    bio: 'ML engineer and data enthusiast. Looking for creative teams to build AI-powered solutions.',
    skills: ['Python', 'Machine Learning', 'TensorFlow'],
    experience: 'Advanced',
    timezone: 'UTC-8 (PST)',
    role: 'Builder',
    github: 'github.com/marcusc',
    linkedin: 'linkedin.com/in/marcusc',
    openToTeam: true,
    avatarColor: 1,
    hackathonsAttended: 15,
    teamsFormed: 10,
    projectsBuilt: 9,
  },
  {
    id: 3,
    name: 'Sofia Rodriguez',
    email: 'sofia@example.com',
    initials: 'SR',
    bio: 'Product designer who turns ideas into beautiful, user-centric experiences.',
    skills: ['UI/UX', 'Figma', 'React'],
    experience: 'Intermediate',
    timezone: 'UTC-5 (EST)',
    role: 'Designer',
    github: 'github.com/sofiar',
    linkedin: 'linkedin.com/in/sofiar',
    openToTeam: true,
    avatarColor: 2,
    hackathonsAttended: 7,
    teamsFormed: 5,
    projectsBuilt: 4,
  },
  {
    id: 4,
    name: 'James Okonkwo',
    email: 'james@example.com',
    initials: 'JO',
    bio: 'Blockchain developer building the decentralized future. Web3 maximalist.',
    skills: ['Solidity', 'Web3', 'Rust'],
    experience: 'Advanced',
    timezone: 'UTC+0 (GMT)',
    role: 'Builder',
    github: 'github.com/jameso',
    linkedin: 'linkedin.com/in/jameso',
    openToTeam: false,
    avatarColor: 3,
    hackathonsAttended: 20,
    teamsFormed: 14,
    projectsBuilt: 11,
  },
  {
    id: 5,
    name: 'Yuki Tanaka',
    email: 'yuki@example.com',
    initials: 'YT',
    bio: 'Mobile dev specializing in cross-platform apps. Flutter evangelist.',
    skills: ['Flutter', 'IoT', 'AWS'],
    experience: 'Intermediate',
    timezone: 'UTC+9 (JST)',
    role: 'Builder',
    github: 'github.com/yukit',
    linkedin: 'linkedin.com/in/yukit',
    openToTeam: true,
    avatarColor: 4,
    hackathonsAttended: 5,
    teamsFormed: 3,
    projectsBuilt: 3,
  },
  {
    id: 6,
    name: 'Elena Popova',
    email: 'elena@example.com',
    initials: 'EP',
    bio: 'DevOps engineer who keeps things running. Passionate about cloud infrastructure and automation.',
    skills: ['AWS', 'Docker', 'Go'],
    experience: 'Advanced',
    timezone: 'UTC+1 (CET)',
    role: 'Builder',
    github: 'github.com/elenap',
    linkedin: 'linkedin.com/in/elenap',
    openToTeam: true,
    avatarColor: 5,
    hackathonsAttended: 9,
    teamsFormed: 6,
    projectsBuilt: 5,
  },
  {
    id: 7,
    name: 'David Kim',
    email: 'david@example.com',
    initials: 'DK',
    bio: 'Product manager turned hacker. I bridge the gap between tech and business.',
    skills: ['UI/UX', 'Data Science', 'Python'],
    experience: 'Intermediate',
    timezone: 'UTC-5 (EST)',
    role: 'PM',
    github: 'github.com/davidk',
    linkedin: 'linkedin.com/in/davidk',
    openToTeam: true,
    avatarColor: 6,
    hackathonsAttended: 6,
    teamsFormed: 4,
    projectsBuilt: 3,
  },
  {
    id: 8,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    initials: 'PS',
    bio: 'Computer vision researcher exploring the intersection of AI and healthcare.',
    skills: ['Computer Vision', 'Python', 'TensorFlow'],
    experience: 'Advanced',
    timezone: 'UTC+5:30 (IST)',
    role: 'Domain Expert',
    github: 'github.com/priyas',
    linkedin: 'linkedin.com/in/priyas',
    openToTeam: true,
    avatarColor: 7,
    hackathonsAttended: 8,
    teamsFormed: 5,
    projectsBuilt: 4,
  },
  {
    id: 9,
    name: 'Arjun Nair',
    email: 'arjun@example.com',
    initials: 'AN',
    bio: 'Full-stack developer with a love for clean architecture and GraphQL.',
    skills: ['GraphQL', 'TypeScript', 'Node.js'],
    experience: 'Advanced',
    timezone: 'UTC+5:30 (IST)',
    role: 'Builder',
    github: 'github.com/arjunn',
    linkedin: 'linkedin.com/in/arjunn',
    openToTeam: true,
    avatarColor: 6,
    hackathonsAttended: 14,
    teamsFormed: 9,
    projectsBuilt: 7,
  },
  {
    id: 10,
    name: 'Leo Fischer',
    email: 'leo@example.com',
    initials: 'LF',
    bio: 'Smart contract auditor and DeFi researcher. Making crypto safer.',
    skills: ['Solidity', 'Blockchain', 'Web3'],
    experience: 'Advanced',
    timezone: 'UTC+1 (CET)',
    role: 'Domain Expert',
    github: 'github.com/leof',
    linkedin: 'linkedin.com/in/leof',
    openToTeam: true,
    avatarColor: 2,
    hackathonsAttended: 13,
    teamsFormed: 9,
    projectsBuilt: 8,
  },
];

const hackathons = [
  {
    id: 1,
    name: 'HackAI 2026',
    date: 'Mar 15-17, 2026',
    location: 'San Francisco, CA',
    online: false,
    prize: '$50,000',
    tags: ['AI', 'Machine Learning', 'NLP'],
    description: 'The premier AI hackathon bringing together the brightest minds in artificial intelligence.',
    attendees: [1, 2, 8],
    bannerGradient: 'linear-gradient(135deg, #a855f7, #6d28d9)',
    website: 'https://hackai2026.dev',
    organizer: 'AI Foundation',
  },
  {
    id: 2,
    name: 'ETHGlobal Brussels',
    date: 'Apr 5-7, 2026',
    location: 'Brussels, Belgium',
    online: false,
    prize: '$100,000',
    tags: ['Web3', 'Blockchain', 'DeFi'],
    description: 'Build the decentralized future at ETHGlobal Brussels.',
    attendees: [4, 10, 6],
    bannerGradient: 'linear-gradient(135deg, #00d4ff, #0080ff)',
    website: 'https://ethglobal.com/brussels',
    organizer: 'ETHGlobal',
  },
  {
    id: 3,
    name: 'HealthHack',
    date: 'Apr 20-22, 2026',
    location: 'Online',
    online: true,
    prize: '$25,000',
    tags: ['Health', 'AI', 'IoT'],
    description: 'Hack for a healthier world. Build solutions that improve healthcare outcomes.',
    attendees: [8, 5, 3],
    bannerGradient: 'linear-gradient(135deg, #00ff88, #00b865)',
    website: 'https://healthhack.org',
    organizer: 'MedTech Alliance',
  },
  {
    id: 4,
    name: 'TreeHacks 2026',
    date: 'May 3-5, 2026',
    location: 'Stanford, CA',
    online: false,
    prize: '$75,000',
    tags: ['AI', 'Climate', 'Education'],
    description: 'Stanford flagship hackathon focused on positive impact.',
    attendees: [1, 2, 3, 7, 9],
    bannerGradient: 'linear-gradient(135deg, #fb923c, #f97316)',
    website: 'https://treehacks.com',
    organizer: 'Stanford ACM',
  },
  {
    id: 5,
    name: 'HackTheVerse',
    date: 'May 18-20, 2026',
    location: 'Online',
    online: true,
    prize: '$30,000',
    tags: ['AR/VR', 'Gaming', 'Web3'],
    description: 'Build immersive experiences, games, and virtual worlds.',
    attendees: [5, 3],
    bannerGradient: 'linear-gradient(135deg, #f472b6, #ec4899)',
    website: 'https://hacktheverse.io',
    organizer: 'MetaVerse Labs',
  },
];

const teamPostings = [
  {
    id: 1,
    hackathonId: 1,
    projectIdea: 'AI-powered mental health companion using NLP',
    rolesNeeded: ['Builder', 'Designer', 'Domain Expert'],
    maxSize: 4,
    creatorId: 2,
    members: [2, 8],
  },
  {
    id: 2,
    hackathonId: 2,
    projectIdea: 'Decentralized identity verification for refugees',
    rolesNeeded: ['Builder', 'PM'],
    maxSize: 5,
    creatorId: 4,
    members: [4, 10, 6],
  },
  {
    id: 3,
    hackathonId: 3,
    projectIdea: 'Remote patient monitoring with IoT sensors',
    rolesNeeded: ['Builder', 'Designer'],
    maxSize: 4,
    creatorId: 5,
    members: [5, 8],
  },
];

const showcaseProjects = [
  {
    id: 1,
    name: 'MindBridge',
    hackathon: 'HackAI 2025',
    description: 'AI-powered mental health companion with empathy-driven conversations.',
    team: [2, 8, 3],
    techStack: ['Python', 'TensorFlow', 'React', 'Node.js'],
    link: 'https://devpost.com/mindbridge',
    placement: '1st Place',
    bannerGradient: 'linear-gradient(135deg, #a855f7, #00d4ff)',
  },
  {
    id: 2,
    name: 'ChainID',
    hackathon: 'ETHGlobal Paris 2025',
    description: 'Decentralized identity verification for vulnerable populations.',
    team: [4, 10, 6],
    techStack: ['Solidity', 'React', 'Node.js', 'Web3'],
    link: 'https://devpost.com/chainid',
    placement: '2nd Place',
    bannerGradient: 'linear-gradient(135deg, #00d4ff, #0080ff)',
  },
  {
    id: 3,
    name: 'VitalWatch',
    hackathon: 'HealthHack 2025',
    description: 'Remote patient monitoring platform with real-time alerts.',
    team: [5, 8, 3],
    techStack: ['Python', 'IoT', 'React'],
    link: 'https://devpost.com/vitalwatch',
    placement: 'Best Health Innovation',
    bannerGradient: 'linear-gradient(135deg, #00ff88, #00b865)',
  },
];

const notifications = [
  { id: 1, type: 'connection', text: 'Marcus Chen wants to team up with you', timeLabel: '2 hours ago', unread: true, userId: 2 },
  { id: 2, type: 'message', text: 'New message from Sofia Rodriguez', timeLabel: '5 hours ago', unread: true, userId: 3 },
  { id: 3, type: 'team', text: 'You were invited to join MindBridge team', timeLabel: '1 day ago', unread: true, userId: null },
  { id: 4, type: 'hackathon', text: 'HackAI 2026 starts in 3 weeks', timeLabel: '1 day ago', unread: false, userId: null },
];

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.projectTech.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.showcaseProject.deleteMany();
  await prisma.teamRoleNeeded.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.teamPosting.deleteMany();
  await prisma.hackathonAttendee.deleteMany();
  await prisma.hackathon.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.endorsement.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  await prisma.skill.createMany({ data: skills });
  const skillRows = await prisma.skill.findMany();
  const skillByName = new Map(skillRows.map((s) => [s.name, s.id]));

  const passwordHash = await bcrypt.hash('password123', 10);

  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash,
        initials: user.initials,
        bio: user.bio,
        experience: user.experience,
        timezone: user.timezone,
        role: user.role,
        github: user.github,
        linkedin: user.linkedin,
        openToTeam: user.openToTeam,
        avatarColor: user.avatarColor,
        hackathonsAttended: user.hackathonsAttended,
        teamsFormed: user.teamsFormed,
        projectsBuilt: user.projectsBuilt,
      },
    });

    for (const skill of user.skills) {
      const skillId = skillByName.get(skill);
      if (!skillId) continue;
      await prisma.userSkill.create({
        data: {
          userId: user.id,
          skillId,
        },
      });
    }
  }

  for (const hackathon of hackathons) {
    await prisma.hackathon.create({
      data: {
        id: hackathon.id,
        name: hackathon.name,
        date: hackathon.date,
        location: hackathon.location,
        online: hackathon.online,
        prize: hackathon.prize,
        tags: hackathon.tags,
        description: hackathon.description,
        bannerGradient: hackathon.bannerGradient,
        website: hackathon.website,
        organizer: hackathon.organizer,
      },
    });

    for (const userId of hackathon.attendees) {
      await prisma.hackathonAttendee.create({
        data: {
          hackathonId: hackathon.id,
          userId,
        },
      });
    }
  }

  for (const team of teamPostings) {
    await prisma.teamPosting.create({
      data: {
        id: team.id,
        hackathonId: team.hackathonId,
        projectIdea: team.projectIdea,
        maxSize: team.maxSize,
        currentSize: team.members.length,
        creatorId: team.creatorId,
        rolesNeeded: {
          create: team.rolesNeeded.map((role) => ({ role })),
        },
        members: {
          create: team.members.map((userId) => ({ userId })),
        },
      },
    });
  }

  for (const project of showcaseProjects) {
    await prisma.showcaseProject.create({
      data: {
        id: project.id,
        name: project.name,
        hackathon: project.hackathon,
        description: project.description,
        link: project.link,
        placement: project.placement,
        bannerGradient: project.bannerGradient,
        members: {
          create: project.team.map((userId) => ({ userId })),
        },
        techStack: {
          create: project.techStack.map((tech) => ({ tech })),
        },
      },
    });
  }

  await prisma.conversation.create({
    data: {
      id: 1,
      type: 'request',
      fromUserId: 2,
      toUserId: 1,
      requestMessage: 'Hey! We are building an AI mental health app and need a designer. Interested?',
      requestStatus: 'pending',
    },
  });

  await prisma.conversation.create({
    data: {
      id: 2,
      type: 'request',
      fromUserId: 4,
      toUserId: 1,
      requestMessage: 'Looking for a frontend dev for our Web3 identity project at ETHGlobal.',
      requestStatus: 'pending',
    },
  });

  await prisma.conversation.create({
    data: {
      id: 3,
      type: 'chat',
      fromUserId: 3,
      toUserId: 1,
      requestStatus: 'accepted',
      messages: {
        create: [
          { senderId: 3, text: 'Hey Aisha! Excited to work together at TreeHacks!' },
          { senderId: 1, text: 'Me too! I have been brainstorming some ideas.' },
          { senderId: 3, text: 'What about a gamified sustainability tracker?' },
          { senderId: 1, text: 'Love it! I can handle the UI/UX.' },
        ],
      },
    },
  });

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification });
  }

  await prisma.endorsement.createMany({
    data: [
      { skill: 'React', comment: 'Amazing frontend work on EcoQuest!', fromUserId: 3, toUserId: 1 },
      { skill: 'TypeScript', comment: 'Clean, well-typed code throughout.', fromUserId: 9, toUserId: 1 },
      { skill: 'Node.js', comment: 'Built a solid API in record time.', fromUserId: 2, toUserId: 1 },
    ],
  });

  console.log('Database seeded. Test login: aisha@example.com / password123');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
