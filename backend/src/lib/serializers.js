export function toUserDto(user, options = {}) {
  const { includeEmail = false } = options;

  return {
    id: user.id,
    name: user.name,
    ...(includeEmail ? { email: user.email } : {}),
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
    skills: user.skills?.map((s) => s.skill?.name || s.name).filter(Boolean) || [],
  };
}

export function toHackathonDto(h, currentUserId = null) {
  const attendeeIds = h.attendees?.map((a) => a.userId) || [];
  return {
    id: h.id,
    name: h.name,
    date: h.date,
    location: h.location,
    online: h.online,
    prize: h.prize,
    tags: Array.isArray(h.tags) ? h.tags : [],
    description: h.description,
    bannerGradient: h.bannerGradient,
    website: h.website,
    organizer: h.organizer,
    attendeeIds,
    attendeeCount: attendeeIds.length,
    isGoing: currentUserId ? attendeeIds.includes(Number(currentUserId)) : false,
  };
}
