# Authentication Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

## Installation Steps

### 1. Install MongoDB
**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

**Or use MongoDB Atlas (Cloud):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Update connection string in `server.js`

### 2. Install Dependencies
```bash
npm install
```

### 3. Start MongoDB (if local)
```bash
# Windows
net start MongoDB

# Or run mongod directly
mongod
```

### 4. Start the Server
```bash
npm start
```

Server will run on http://localhost:3000

### 5. Access the Application
1. Open http://localhost:3000/register.html
2. Create an account
3. Login at http://localhost:3000/login.html
4. You'll be redirected to the main app

## Features Added

### Authentication
- ✅ User registration with password hashing
- ✅ Secure login with JWT tokens
- ✅ Protected routes
- ✅ Auto-redirect if not logged in

### Database Integration
- ✅ User data stored in MongoDB
- ✅ Session data automatically saved to database
- ✅ Load previous sessions from database
- ✅ User-specific session history

### Security
- ✅ Passwords hashed with bcrypt
- ✅ JWT token authentication
- ✅ Protected API endpoints
- ✅ CORS enabled

## File Structure
```
├── server.js           # Express server with MongoDB
├── package.json        # Dependencies
├── login.html          # Login page
├── register.html       # Registration page
├── auth.js            # Authentication helper
├── index.html         # Main app (protected)
├── app.js             # Original app logic
└── enhanced-features.js
```

## API Endpoints

### POST /api/register
Register new user
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/sessions (Protected)
Save session data
```json
{
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-01T01:00:00Z",
  "duration": 3600,
  "averageAttention": 75.5,
  "dataPoints": 1000,
  "sessionData": [...]
}
```

### GET /api/sessions (Protected)
Get user's sessions

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check connection string in server.js
- For Atlas, whitelist your IP address

### Port Already in Use
Change port in server.js:
```javascript
app.listen(3001, () => console.log('Server on port 3001'));
```

### CORS Issues
Server already has CORS enabled. If issues persist, check browser console.

## Next Steps
- Customize JWT secret in server.js (line 30)
- Add password reset functionality
- Implement email verification
- Add user profile management
