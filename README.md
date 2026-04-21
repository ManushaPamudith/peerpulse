# PeerPulse - MongoDB Connected MERN Version

This version is a real MERN build for Progress Presentation 1.

## Features connected to backend
- University email registration
- JWT login
- Profile update
- Add skills
- Academic and MCQ style verification
- Discover tutors
- Send / accept / reject requests
- Create sessions from accepted requests
- Future-date validation for sessions
- Review after completed sessions only
- Admin stats endpoint

## Run order
### 1. Server
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### 2. Client
```bash
cd client
npm install
npm run dev
```

### 3. Open
`http://localhost:5173`

## Admin note
The admin page requires a user with `role: "admin"` in MongoDB.
You can first register a normal user, then change the role manually in MongoDB Compass.

## Member-wise area split
- Member 1: Auth, Profile, Skills, Verification
- Member 2: Discover, Matching, Requests
- Member 3: Sessions, Conflict Validation
- Member 4: Reviews, Admin Stats, Reports extension
