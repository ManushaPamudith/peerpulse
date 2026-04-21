# Further Extension Guide

## Recommended development order

### Phase 1
- Finish auth and user profile CRUD
- Complete skill add/update/delete with duplicate checking
- Add protected routes in frontend

### Phase 2
- Connect tutor search with real database filtering
- Build request send/accept/reject flow
- Add learner/tutor dashboards

### Phase 3
- Create real session scheduling
- Validate overlap and future date rules
- Add calendar-style UI if needed

### Phase 4
- Enable session completion status
- Allow review only after completed session
- Build admin analytics and reports

## Important business rules already considered
- one unique email per account
- no duplicate skills per user
- only user can edit own profile
- session must be in the future
- rating only after session completion

## Suggested future additions
- profile picture upload with Cloudinary
- quiz engine for technical skill verification
- grade evidence file upload
- email notifications
- socket-based request/session updates
- admin charts and exportable reports
