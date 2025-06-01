const express = require('express');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 基本路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'WildPals Backend API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 模拟认证路由
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful',
    token: 'mock-jwt-token',
    user: {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registration successful',
    token: 'mock-jwt-token',
    user: {
      id: '2',
      email: req.body.email || 'new@example.com',
      name: req.body.name || 'New User'
    }
  });
});

// 模拟骑行路由
app.get('/api/rides', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        title: 'Morning Ride',
        description: 'A beautiful morning ride through the park',
        date: '2025-06-02T08:00:00.000Z',
        status: 'upcoming',
        creatorId: 'user1',
        creator: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: null
        },
        participants: [
          {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            status: 'accepted'
          }
        ],
        route: {
          distance: 10,
          elevationGain: 150,
          startPoint: {
            latitude: 40.7829,
            longitude: -73.9654
          },
          endPoint: {
            latitude: 40.7829,
            longitude: -73.9654
          }
        },
        pace: 'Moderate',
        terrain: 'Road',
        difficulty: 'Beginner',
        genderPreference: 'All',
        createdAt: new Date('2025-06-01T10:00:00.000Z'),
        updatedAt: new Date('2025-06-01T10:00:00.000Z')
      },
      {
        _id: '2',
        title: 'Mountain Adventure',
        description: 'Challenging mountain trail ride for experienced cyclists',
        date: '2025-06-03T09:00:00.000Z',
        status: 'upcoming',
        creatorId: 'user2',
        creator: {
          id: 'user2',
          name: 'Sarah Smith',
          email: 'sarah@example.com',
          avatar: null
        },
        participants: [
          {
            id: 'user2',
            name: 'Sarah Smith',
            email: 'sarah@example.com',
            status: 'accepted'
          },
          {
            id: 'user3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            status: 'accepted'
          }
        ],
        route: {
          distance: 25,
          elevationGain: 800,
          startPoint: {
            latitude: 40.7589,
            longitude: -73.9851
          },
          endPoint: {
            latitude: 40.7589,
            longitude: -73.9851
          }
        },
        pace: 'Fast',
        terrain: 'Mountain',
        difficulty: 'Advanced',
        genderPreference: 'All',
        createdAt: new Date('2025-06-01T11:00:00.000Z'),
        updatedAt: new Date('2025-06-01T11:00:00.000Z')
      },
      {
        _id: '3',
        title: 'Evening City Cruise',
        description: 'Relaxed evening ride through the city streets',
        date: '2025-06-02T18:00:00.000Z',
        status: 'upcoming',
        creatorId: 'user3',
        creator: {
          id: 'user3',
          name: 'Emily Chen',
          email: 'emily@example.com',
          avatar: null
        },
        participants: [
          {
            id: 'user3',
            name: 'Emily Chen',
            email: 'emily@example.com',
            status: 'accepted'
          }
        ],
        route: {
          distance: 15,
          elevationGain: 50,
          startPoint: {
            latitude: 40.7505,
            longitude: -73.9934
          },
          endPoint: {
            latitude: 40.7505,
            longitude: -73.9934
          }
        },
        pace: 'Casual',
        terrain: 'Urban',
        difficulty: 'Beginner',
        genderPreference: 'All',
        createdAt: new Date('2025-06-01T12:00:00.000Z'),
        updatedAt: new Date('2025-06-01T12:00:00.000Z')
      }
    ]
  });
});

app.post('/api/rides', (req, res) => {
  res.json({
    success: true,
    message: 'Ride created successfully',
    data: {
      id: Date.now().toString(),
      ...req.body,
      participants: 1,
      createdAt: new Date().toISOString()
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

const PORT = parseInt(process.env.PORT || '12001');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Access URL: https://work-2-hwycpkofbuzsgfun.prod-runtime.all-hands.dev`);
});