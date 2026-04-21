# PeerPulse – Member-wise File Structure

This file shows which folders each member can continue working on.

## Member 1 – User & Skill Profile Management
### Frontend
- `client/src/pages/RegisterPage.jsx`
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/ProfilePage.jsx`
- `client/src/components/profile/SkillCard.jsx`
- `client/src/components/profile/SkillForm.jsx`
- `client/src/components/profile/VerificationPanel.jsx`
- `client/src/services/authService.js`
- `client/src/services/userService.js`

### Backend
- `server/src/controllers/authController.js`
- `server/src/controllers/userController.js`
- `server/src/routes/authRoutes.js`
- `server/src/routes/userRoutes.js`
- `server/src/models/User.js`
- `server/src/middleware/authMiddleware.js`

### Responsibilities
- secure login/register
- university email validation
- profile editing
- profile image field handling
- skill add/update/delete
- proficiency level logic
- academic verification and MCQ verification

---

## Member 2 – Skill Request & Matching
### Frontend
- `client/src/pages/DiscoverPage.jsx`
- `client/src/pages/RequestsPage.jsx`
- `client/src/components/request/TutorCard.jsx`
- `client/src/components/request/RequestCard.jsx`
- `client/src/services/requestService.js`

### Backend
- `server/src/controllers/requestController.js`
- `server/src/routes/requestRoutes.js`
- `server/src/models/SkillRequest.js`

### Responsibilities
- search skills/modules
- smart tutor matching filters
- send requests with messages
- accept/reject request flow
- verified tutor prioritization

---

## Member 3 – Session Booking & Management
### Frontend
- `client/src/pages/SessionsPage.jsx`
- `client/src/components/session/SessionCard.jsx`
- `client/src/components/session/SessionForm.jsx`
- `client/src/services/sessionService.js`

### Backend
- `server/src/controllers/sessionController.js`
- `server/src/routes/sessionRoutes.js`
- `server/src/models/Session.js`

### Responsibilities
- create session after request acceptance
- future date validation
- overlap/conflict validation
- cancel/reschedule/confirm session logic

---

## Member 4 – Ratings, Feedback & Reports
### Frontend
- `client/src/pages/FeedbackPage.jsx`
- `client/src/pages/AdminPage.jsx`
- `client/src/components/feedback/ReviewCard.jsx`
- `client/src/components/admin/StatCard.jsx`
- `client/src/services/reviewService.js`
- `client/src/services/adminService.js`

### Backend
- `server/src/controllers/reviewController.js`
- `server/src/controllers/adminController.js`
- `server/src/routes/reviewRoutes.js`
- `server/src/routes/adminRoutes.js`
- `server/src/models/Review.js`

### Responsibilities
- 1–5 rating system
- written reviews
- report generation endpoints
- user activity monitoring
- admin account control
