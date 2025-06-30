# Blackbox AI Firewall

Enterprise-grade AI firewall protecting LLM applications from malicious inputs and outputs with quantum-level security.

## Features

- **Quantum Security**: Advanced encryption and security protocols
- **Real-time Monitoring**: Live dashboard for security events
- **Malicious Input Detection**: AI-powered threat detection
- **Rate Limiting**: Configurable request throttling
- **Intent Verification**: Ensures AI responses match user intent
- **User Authentication**: Secure signup and login system

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blackbox-ai-firewall
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

### Running the Application

#### Development Mode

1. Start the backend server:
   ```bash
   npm run server
   # or for auto-restart on changes:
   npm run dev:server
   ```

2. Start the frontend (in a separate terminal):
   ```bash
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

#### Production Mode

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   NODE_ENV=production npm run server
   ```

## API Endpoints

### Authentication

- `POST /api/signup` - Register a new user
- `POST /api/login` - Authenticate user
- `GET /api/profile/:id` - Get user profile
- `GET /api/health` - Health check

### Request/Response Format

#### Signup Request
```json
{
  "username": "johndoe",
  "password": "securepassword123",
  "email": "john@example.com",
  "fullName": "John Doe",
  "securityQuestion": "What's your pet's name?",
  "securityAnswer": "Fluffy"
}
```

#### Login Request
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

#### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds of 12
- **Account Locking**: Automatic lockout after 5 failed login attempts
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive server-side validation
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **MongoDB Injection Protection**: Mongoose schema validation

## Database Schema

### User Model
```javascript
{
  username: String (unique, required, 3-30 chars)
  email: String (unique, required, valid email)
  password: String (required, hashed, min 6 chars)
  fullName: String (required, 2-100 chars)
  securityQuestion: String (required, 10-200 chars)
  securityAnswer: String (required, hashed, min 2 chars)
  isActive: Boolean (default: true)
  lastLogin: Date
  loginAttempts: Number (default: 0)
  lockUntil: Date
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `CORS_ORIGIN` | Frontend URL for CORS | http://localhost:5173 |
| `JWT_SECRET` | JWT signing secret (future use) | Optional |

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Database connection issues
- Duplicate entries
- Authentication failures
- Rate limiting
- Server errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.