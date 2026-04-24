const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Code Sathi / HackTeam API',
    version: '1.0.0',
    description: 'Production-ready comprehensive REST API documentation. Includes JWT authentication, Modular routes, and clean JSON responses.',
    contact: {
      name: 'API Support',
      url: 'http://localhost:4010',
    },
  },
  servers: [
    {
      url: 'http://localhost:4010',
      description: 'Local Development Engine',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'User login and registration' },
    { name: 'Users', description: 'User profiles and builder matching' },
    { name: 'Hackathons', description: 'Hackathon events and RSVPs' },
    { name: 'Teams', description: 'Team formations and joining requests' },
    { name: 'Messages', description: 'Inbox and direct messaging' },
    { name: 'Notifications', description: 'Real-time alerts' },
    { name: 'Showcase', description: 'Project showcases' },
    { name: 'ML', description: 'ML teammate and team recommendations' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format **<token>** (Bearer is added automatically).',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Validation failed' },
          details: { type: 'object' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          initials: { type: 'string', example: 'JD' },
          bio: { type: 'string', example: 'Fullstack developer' },
          experience: { type: 'string', example: 'Intermediate' },
          role: { type: 'string', example: 'Builder' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Alice Smith' },
          email: { type: 'string', example: 'alice@example.com' },
          password: { type: 'string', example: 'securepassword123' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'alice@example.com' },
          password: { type: 'string', example: 'securepassword123' },
        },
      },
      Hackathon: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Super Hack 2026' },
          date: { type: 'string', example: 'Oct 15 - 17, 2026' },
          location: { type: 'string', example: 'San Francisco, CA' },
          online: { type: 'boolean', example: true },
        },
      },
      Team: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 5 },
          hackathonId: { type: 'integer', example: 1 },
          projectIdea: { type: 'string', example: 'AI Healthcare tracker' },
          currentSize: { type: 'integer', example: 2 },
          maxSize: { type: 'integer', example: 4 },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 42 },
          senderId: { type: 'integer', example: 2 },
          text: { type: 'string', example: 'Hi! Can I join your team?' },
          sentAt: { type: 'string', format: 'date-time' },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 99 },
          type: { type: 'string', example: 'team_invite' },
          text: { type: 'string', example: 'You have been invited' },
          unread: { type: 'boolean', example: true },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          '201': { description: 'User successfully created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '409': { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate existing user',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': { description: 'Success JWT returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': { description: 'Invalid email or password' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current logged-in user profile',
        responses: {
          '200': { description: 'User Profile Details', content: { 'application/json': { schema: { properties: { user: { $ref: '#/components/schemas/User' } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List and filter users for team matching',
        responses: {
          '200': { description: 'List of users matching criteria', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'User Profile', content: { 'application/json': { schema: { properties: { user: { $ref: '#/components/schemas/User' } } } } } },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/users/me': {
      patch: {
        tags: ['Users'],
        summary: 'Update current user profile',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { bio: { type: 'string' }, experience: { type: 'string' } } } } },
        },
        responses: {
          '200': { description: 'Profile updated successfully' },
        },
      },
    },
    '/api/hackathons': {
      get: {
        tags: ['Hackathons'],
        summary: 'Get all active hackathons',
        security: [],
        responses: {
          '200': { description: 'List of hackathons', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Hackathon' } } } } },
        },
      },
    },
    '/api/hackathons/{id}': {
      get: {
        tags: ['Hackathons'],
        summary: 'Get a specific hackathon',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Hackathon Details', content: { 'application/json': { schema: { properties: { hackathon: { $ref: '#/components/schemas/Hackathon' } } } } } },
        },
      },
    },
    '/api/hackathons/{id}/toggle-going': {
      post: {
        tags: ['Hackathons'],
        summary: 'RSVP to a hackathon',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'RSVP successful' },
        },
      },
    },
    '/api/teams': {
      get: {
        tags: ['Teams'],
        summary: 'Search currently open team postings',
        responses: {
          '200': { description: 'List of groups finding members', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Team' } } } } },
        },
      },
      post: {
        tags: ['Teams'],
        summary: 'Create a new team post',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { hackathonId: { type: 'integer' }, projectIdea: { type: 'string' }, maxSize: { type: 'integer' } } } } },
        },
        responses: {
          '201': { description: 'Team Created', content: { 'application/json': { schema: { properties: { team: { $ref: '#/components/schemas/Team' } } } } } },
        },
      },
    },
    '/api/teams/{id}/join': {
      post: {
        tags: ['Teams'],
        summary: 'Request to join a team',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Request sent successfully' },
        },
      },
    },
    '/api/messages/inbox': {
      get: {
        tags: ['Messages'],
        summary: 'Get all user conversations / inbox',
        responses: {
          '200': { description: 'List of conversations' },
        },
      },
    },
    '/api/messages/{id}': {
      get: {
        tags: ['Messages'],
        summary: 'Get messages for a conversation',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'List of messages', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Message' } } } } },
        },
      },
    },
    '/api/messages/{id}/send': {
      post: {
        tags: ['Messages'],
        summary: 'Send message in conversation',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { text: { type: 'string' } } } } },
        },
        responses: {
          '201': { description: 'Message sent', content: { 'application/json': { schema: { properties: { message: { $ref: '#/components/schemas/Message' } } } } } },
        },
      },
    },
    '/api/messages/{id}/accept': {
      post: { tags: ['Messages'], summary: 'Accept join request', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Accepted' } } },
    },
    '/api/messages/{id}/decline': {
      post: { tags: ['Messages'], summary: 'Decline join request', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Declined' } } },
    },
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get active alerts for user',
        responses: {
          '200': { description: 'List of notifications', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } },
        },
      },
    },
    '/api/notifications/{id}/read': {
      post: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Marked as read' },
        },
      },
    },
    '/api/showcase': {
      get: {
        tags: ['Showcase'],
        summary: 'List successful showcase projects',
        security: [],
        responses: {
          '200': { description: 'Projects retrieved successfully' },
        },
      },
    },
    '/api/ml/recommend/{userId}': {
      post: {
        tags: ['ML'],
        summary: 'Get top teammate recommendations for user',
        parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Recommendation list generated' },
          '403': { description: 'Forbidden for other users' },
        },
      },
    },
    '/api/ml/generate-team': {
      post: {
        tags: ['ML'],
        summary: 'Auto-generate optimized team of size 4 or 5',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['teamSize'],
                properties: {
                  teamSize: { type: 'integer', enum: [4, 5] },
                  theme: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Optimized team generated' },
          '400': { description: 'Invalid team size' },
        },
      },
    },
    '/api/ml/feedback': {
      post: {
        tags: ['ML'],
        summary: 'Submit accept/reject feedback for a recommendation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'recommendedId', 'action'],
                properties: {
                  userId: { type: 'integer' },
                  recommendedId: { type: 'integer' },
                  action: { type: 'string', enum: ['accept', 'reject'] },
                  context: { type: 'string', enum: ['recommend', 'team-gen'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Feedback recorded' },
        },
      },
    },
  },
};

export { swaggerSpec };
