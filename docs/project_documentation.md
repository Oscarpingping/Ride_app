# WildPals - Outdoor Activity Social Platform Documentation

## 1. Project Overview
WildPals is a comprehensive social platform designed for outdoor activity enthusiasts. It enables users to create and join clubs, organize activities, and communicate through an integrated messaging system. The platform focuses on building communities around various outdoor activities while providing robust social features.

## 2. Technical Architecture

### 2.1 Backend Stack
- **Framework**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **File Storage**: Local file system for media
- **Real-time Communication**: WebSocket for chat

### 2.2 Frontend Stack
- **Framework**: React Native
- **State Management**: React Hooks
- **Type Safety**: TypeScript
- **API Integration**: Axios

## 3. Data Models

### 3.1 User Model
```typescript
interface IUser {
  name: string;
  name_sid: string;  // Unique identifier for user's name, used for @mentions and display
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  rating: number;
  ridesJoined: number;
  ridesCreated: number;
  createdRides: ObjectId[];
  joinedRides: ObjectId[];
  clubs: ObjectId[];
  createdClubs: ObjectId[];
  managedClubs: ObjectId[];
  canCreateClub: boolean;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  preferences: {
    terrain: ('Road' | 'Mountain' | 'Gravel' | 'MTB' | 'Urban' | 'Mixed')[];
    pace: ('Casual' | 'Moderate' | 'Fast')[];
    difficulty: ('Beginner' | 'Intermediate' | 'Advanced')[];
  };
}
```

### 3.2 Club Model
```typescript
interface IClub {
  clubId: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  type: 'biking' | 'climbing' | 'hiking' | 'skiing' | 'surfing' | 'running' | 'camping';
  founder: ObjectId;
  admins: ObjectId[];
  members: ObjectId[];
  location: {
    city: string;
    country: string;
  };
  stats: {
    memberCount: number;
    activityCount: number;
  };
  rules: string[];
  tags: string[];
  isPrivate: boolean;
  joinRequests: {
    pending: Array<{
      user: ObjectId;
      message?: string;
      createdAt: Date;
    }>;
    history: Array<{
      user: ObjectId;
      status: 'approved' | 'rejected';
      message?: string;
      response?: string;
      handledBy: ObjectId;
      createdAt: Date;
      handledAt: Date;
    }>;
  };
  chatRoom?: ObjectId;
  contactEmail: string;
}
```

### 3.3 Ride (Activity) Model
```typescript
interface IRide {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  meetingPoint: {
    latitude: number;
    longitude: number;
    address: string;
  };
  route: {
    type: 'road' | 'mountain' | 'gravel';
    distance: number;
    elevation: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  pace: number;
  maxParticipants: number;
  currentParticipants: number;
  isPrivate: boolean;
  organizer: ObjectId;
  participants: ObjectId[];
}
```

### 3.4 Chat System Models

#### 3.4.1 ChatRoom Model
```typescript
interface IChatRoom {
  club: ObjectId;
  messages: Array<{
    sender: string;                 // User's name_sid
    type: 'text' | 'emoji' | 'image' | 'video' | 'file' | 'url';
    content: string;
    metadata?: {
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      duration?: number;
      thumbnail?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    isEdited: boolean;
    isDeleted: boolean;
    editHistory?: Array<{
      content: string;
      editedAt: Date;
      editedBy: string;            // User's name_sid
    }>;
    reactions?: Array<{
      user: string;                // User's name_sid
      emoji: string;
      createdAt: Date;
    }>;
    mentions?: string[];           // Array of user name_sids
    readBy: Array<{
      user: string;               // User's name_sid
      readAt: Date;
    }>;
  }>;
  lastMessage: {
    sender: string;               // User's name_sid
    content: string;
    type: string;
    timestamp: Date;
  };
  pinnedMessages?: string[];
}
```

#### 3.4.2 Message Model
```typescript
interface IMessage {
  senderId: ObjectId;
  senderNameSid: string;          // User's name_sid for quick reference
  receiverId: ObjectId;
  content: string;
  timestamp: Date;
  type: 'CHAT' | 'JOIN_REQUEST' | 'JOIN_APPROVED';
  rideId?: ObjectId;
}
```

## 4. Core Features

### 4.1 User Management
- User registration and authentication
- Profile management with preferences
- Activity history tracking
- Club membership management
- Emergency contact information
- User ratings and permissions

### 4.2 Club System
- Club creation with permission system
- Member management with approval workflow
- Club-specific chat rooms
- Activity organization
- Location-based club discovery
- Club statistics and metrics

### 4.3 Activity Management
- Activity creation and scheduling
- Route planning and tracking
- Participant management
- Difficulty and pace settings
- Location-based meeting points
- Public and private activities

### 4.4 Messaging System
- Real-time chat functionality
- Multiple message types support
- Message editing and deletion
- Message reactions and mentions
- Read receipts
- Pinned messages
- File sharing capabilities

## 5. Future Development Priorities

### 5.1 Enhanced Features
1. **Real-time Communication**
   - WebSocket implementation
   - Push notifications
   - Voice and video calls

2. **Location Services**
   - Real-time location sharing
   - Route tracking
   - Geofencing for activities

3. **Media Handling**
   - Cloud storage integration
   - Media compression
   - Advanced file sharing

4. **Social Features**
   - Activity recommendations
   - User matching
   - Social media integration

### 5.2 Technical Improvements
1. **Performance**
   - Caching implementation
   - Query optimization
   - Pagination for large datasets

2. **Security**
   - Rate limiting
   - Input validation
   - File upload security
   - Data encryption

3. **Testing**
   - Unit testing
   - Integration testing
   - End-to-end testing
   - Performance testing

4. **Documentation**
   - API documentation
   - User guides
   - Developer documentation
   - Deployment guides

### 5.3 User Experience
1. **Interface**
   - UI/UX improvements
   - Accessibility features
   - Dark mode support
   - Offline functionality

2. **Analytics**
   - User behavior tracking
   - Activity analytics
   - Performance metrics
   - Usage statistics

## 6. API Endpoints

### 6.1 User Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/reset-password` - Reset password

### 6.2 Club Endpoints
- `POST /api/clubs` - Create club
- `GET /api/clubs` - Get clubs list
- `GET /api/clubs/:clubId` - Get club details
- `PUT /api/clubs/:clubId` - Update club
- `DELETE /api/clubs/:clubId` - Delete club
- `POST /api/clubs/:clubId/join-requests` - Request to join club
- `POST /api/clubs/:clubId/join-requests/:requestId` - Handle join request
- `GET /api/clubs/:clubId/members` - Get club members
- `POST /api/clubs/:clubId/admins` - Add admin
- `POST /api/clubs/:clubId/admins/remove` - Remove admin
- `GET /api/clubs/:clubId/admins` - Get club admins

### 6.3 Activity Endpoints
- `POST /api/rides` - Create activity
- `GET /api/rides` - Get activities list
- `GET /api/rides/:rideId` - Get activity details
- `PUT /api/rides/:rideId` - Update activity
- `DELETE /api/rides/:rideId` - Delete activity
- `POST /api/rides/:rideId/join` - Join activity
- `POST /api/rides/:rideId/leave` - Leave activity

### 6.4 Chat Endpoints
- `GET /api/chat/rooms` - Get chat rooms
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms/:roomId/messages` - Get messages
- `POST /api/chat/rooms/:roomId/messages` - Send message
- `PUT /api/chat/rooms/:roomId/messages/:messageId` - Edit message
- `DELETE /api/chat/rooms/:roomId/messages/:messageId` - Delete message
- `POST /api/chat/rooms/:roomId/messages/:messageId/reactions` - Add reaction
- `POST /api/chat/rooms/:roomId/messages/:messageId/pin` - Pin message

## 7. Security Considerations

### 7.1 Authentication
- JWT-based authentication
- Token refresh mechanism
- Password hashing with bcrypt
- Session management

### 7.2 Authorization
- Role-based access control
- Permission-based actions
- Club admin privileges
- Activity organizer privileges

### 7.3 Data Protection
- Input validation
- XSS prevention
- CSRF protection
- Rate limiting
- File upload restrictions

## 8. Deployment

### 8.1 Requirements
- Node.js environment
- MongoDB database
- File storage system
- WebSocket server
- SSL certificate

### 8.2 Environment Variables
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/wildpals
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
FILE_UPLOAD_PATH=/uploads
MAX_FILE_SIZE=300000
```

### 8.3 Deployment Steps
1. Set up server environment
2. Install dependencies
3. Configure environment variables
4. Set up MongoDB
5. Configure file storage
6. Deploy application
7. Set up SSL
8. Configure monitoring

## 9. Maintenance

### 9.1 Regular Tasks
- Database backups
- Log rotation
- File cleanup
- Performance monitoring
- Security updates

### 9.2 Monitoring
- Server health
- API performance
- Error tracking
- User activity
- Resource usage

### 9.3 Backup Strategy
- Daily database backups
- Weekly file backups
- Monthly full system backups
- Backup verification
- Recovery testing 