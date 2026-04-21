# Advanced Skill Request & Matching Features - Implementation Summary

## Overview
Successfully implemented **5 core advanced features** for the skill request and matching system in PeerPulse. These features enhance user experience, reduce spam, provide intelligent matching, and give users better control over their requests.

---

## ✅ Implemented Features

### 1. **Smart Matching Ranking System** 
**Purpose**: Show best tutors first, not random

**Implementation**:
- **Matching Score Algorithm** (0-100 points):
  - Skill Match: 40%
  - Level Match: 20%
  - Verification Badge: 15%
  - Tutor Rating: 15%
  - Availability Match: 10%

- **Ranking Priority**:
  1. Matching Score (highest first)
  2. Average Rating (highest first)
  3. Review Count (most reviews first)

**Files Modified**:
- `server/src/controllers/requestController.js` - Added `calculateMatchingScore()` helper
- `server/src/controllers/requestController.js` - Updated `discoverTutors()` with ranking logic

**UI Updates**:
- `client/src/components/request/TutorCard.jsx` - Displays matching score badge (🎯 X% match)
- `client/src/pages/DiscoverPage.jsx` - Shows ranking info in search results

---

### 2. **Availability-Based Matching**
**Purpose**: Match only users who are free at the same time

**Implementation**:
- **User Availability Fields**:
  ```javascript
  availability: {
    isAvailable: Boolean,        // Is tutor open for requests
    timezone: String,             // User's timezone
    preferredDays: [String],      // Days available (Mon, Tue, etc.)
    preferredHours: {
      start: String,              // Start time (e.g., "09:00")
      end: String                 // End time (e.g., "18:00")
    }
  }
  ```

- **Matching Logic**:
  - Compares learner and tutor preferred days
  - Returns 1.0 score if days overlap, 0.5 if not available
  - Integrated into `discoverTutors()` with optional `availabilityMatch` query param

**Files Modified**:
- `server/src/models/User.js` - Added availability schema
- `server/src/controllers/requestController.js` - Added `isAvailabilityMatching()` helper

---

### 3. **Request Priority (Normal/Urgent)**
**Purpose**: Allow users to mark urgent requests for faster response

**Implementation**:
- **Priority Field**: `enum: ['Normal', 'Urgent']`
- **Urgent Request Features**:
  - Red badge highlight in UI: 🔴 Urgent
  - Auto-sorted first in tutor's request queue
  - Background color highlighting in request cards
  - Selected during request creation in modal

**Files Modified**:
- `server/src/models/LearningRequest.js` - Added priority field
- `server/src/models/SkillRequest.js` - Added priority field  
- `server/src/controllers/requestController.js` - Updated `getMyRequests()` sorting
- `client/src/pages/DiscoverPage.jsx` - Priority selection in request modal
- `client/src/pages/RequestsPage.jsx` - Visual highlighting for urgent requests

**API Changes**:
- `POST /requests` now accepts `priority` parameter (Normal/Urgent)
- `GET /requests/my?priority=Urgent` to filter by priority

---

### 4. **Request Expiry System**
**Purpose**: Auto-remove old requests after 24-48 hours

**Implementation**:
- **Expiration Logic**:
  - Each request auto-expires in **48 hours** from creation
  - `expiresAt` field set on save via Mongoose pre-hook
  - Expired requests auto-marked with status "Expired" and `isWithdrawn: true`
  - Auto-expiry runs on every `getMyRequests()` call

- **UI Display**:
  - Shows countdown: "⏱️ 24h left", "⏱️ 12h left", etc.
  - Expired requests greyed out and marked with ⏳ icon
  - Prevents actions on expired requests

**Files Modified**:
- `server/src/models/LearningRequest.js` - Added `expiresAt` field with pre-hook
- `server/src/models/SkillRequest.js` - Added `expiresAt` field with pre-hook
- `server/src/controllers/requestController.js` - Added `expireOldRequests()` helper
- `client/src/pages/RequestsPage.jsx` - Time countdown display

---

### 5. **Request Withdraw Option**
**Purpose**: Allow learners to cancel pending requests before acceptance

**Implementation**:
- **Withdraw Restrictions**:
  - Only **learner** can withdraw (not tutor)
  - Only **Pending** requests can be withdrawn
  - Cannot withdraw already withdrawn/expired/accepted/rejected requests

- **Withdraw Fields**:
  - `isWithdrawn: Boolean` - Tracks if withdrawn
  - `withdrawnAt: Date` - Timestamp of withdrawal
  - `withdrawnReason: String` - Optional reason for withdrawal

- **UI Features**:
  - "✖️ Withdraw Request" button for pending requests sent by user
  - Withdrawn requests show as faded/greyed out
  - Reason displayed if provided
  - Confirmation via API call (no local delete)

**Files Modified**:
- `server/src/models/LearningRequest.js` - Added withdraw fields
- `server/src/models/SkillRequest.js` - Added withdraw fields
- `server/src/controllers/requestController.js` - Added `withdrawRequest()` function
- `server/src/routes/requestRoutes.js` - Added `PATCH /requests/:id/withdraw` endpoint
- `client/src/pages/RequestsPage.jsx` - Withdraw button and logic

**API Endpoint**:
```
PATCH /requests/:id/withdraw
Body: { reason: "optional reason" }
```

---

## 📋 Bonus Features Also Implemented

### Duplicate Request Prevention
- Checks for existing pending requests to same tutor for same skill
- Prevents spam with: "You already have a pending request for this skill with this tutor"

### Request History Filtering
- Filter by status: Pending, Accepted, Rejected, Expired
- Filter by priority: Normal, Urgent
- Combined with smart sorting by urgency then creation date

### Matching Score Display
- Shows percentage match (0-100%) on tutor cards
- Calculated in real-time during discover
- Displayed as: 🎯 85% match

### Request Message Feature
- Pre-implemented but now enhanced with priority context
- Message displayed in request cards for reference
- Used during request creation in enhanced modal

---

## 🔧 API Updates

### New/Modified Endpoints

#### Request Endpoints
```
GET /requests/discover 
  - Query params: skill, level, verified, availabilityMatch
  - Returns: Tutors ranked by matching score, rating, reviews

POST /requests
  - Body: { tutorId, skill, message, priority }
  - Returns: Created request with matching score calculated

GET /requests/my
  - Query params: status, priority
  - Returns: Filtered and auto-expired requests, sorted by priority

PATCH /requests/:id/status
  - Body: { status } (Accepted/Rejected)
  - Protected: Tutor only

PATCH /requests/:id/withdraw (NEW)
  - Body: { reason (optional) }
  - Protected: Learner/creator only
  - Returns: Withdrawn request
```

---

## 📊 Data Model Changes

### User Schema Updates
```javascript
{
  // ... existing fields
  averageRating: Number,        // 0-5 scale
  reviewCount: Number,          // Number of reviews
  availability: {
    isAvailable: Boolean,
    timezone: String,
    preferredDays: [String],
    preferredHours: { start: String, end: String }
  }
}
```

### LearningRequest Schema Updates
```javascript
{
  // ... existing fields (learner, tutor, skill, message, status)
  priority: String,             // 'Normal' | 'Urgent'
  isWithdrawn: Boolean,         // default: false
  withdrawnAt: Date,            // null until withdrawn
  withdrawnReason: String,      // Optional reason
  expiresAt: Date,              // Auto-set to 48 hours
  matchingScore: Number         // 0-100
}
```

### SkillRequest Schema Updates
Same fields as LearningRequest (for consistency)

---

## 🎨 UI/UX Enhancements

### TutorCard Component
- Added rating display: ⭐ 4.5 (12 reviews)
- Added matching score badge: 🎯 85% match
- Better tutor ranking visibility

### DiscoverPage
- Enhanced request modal with:
  - Message textarea (not just prompt)
  - Priority selection dropdown
  - Visual indicator for urgent requests
- Search results note: "Tutors are ranked by matching score, rating, and availability"

### RequestsPage
- Request cards show:
  - 🔴 Urgent badge for urgent requests
  - 🎯 Matching score percentage
  - ⏱️ Time remaining countdown
  - Withdrawn reason (if applicable)
  - Priority sorting (urgent first)
- Withdraw button for pending requests
- Better status indicators with icons
- Tab badges show urgent count

---

## 🚀 Quick Start for Testers

### Testing Smart Matching
1. Go to Discover page
2. Search for a skill
3. Observe tutors sorted by highest matching score first
4. Check tutor cards for 🎯 match percentage

### Testing Priority
1. Find a tutor and send request
2. Select "🔴 Urgent" in the request modal
3. Go to your sent requests
4. Notice urgent request appears first with red badge

### Testing Request Expiry
1. Send a request
2. Check the⏱️ time remaining
3. After 48 hours, request auto-expires to Expired status

### Testing Withdraw
1. Send a pending request
2. Go to Sent Requests tab
3. Click "✖️ Withdraw Request" button
4. Request shows as withdrawn, greyed out

### Testing Duplicate Prevention
1. Send a request to a tutor for a skill
2. Try sending the same request again
3. See error: "You already have a pending request..."

---

## 📝 Notes for Deployment

1. **Database Migration**: Existing requests will need default values for new fields
2. **Matching Score**: Calculated on the fly for discover; stored for created requests
3. **Auto-Expiry**: Runs on `getMyRequests()` call - consider running as background job in production
4. **Availability**: Default values allow matching to work - tutors can update their availability
5. **Backward Compatibility**: Old requests without new fields will still work (defaults applied)

---

## 🔒 Security & Validation

- ✅ Only learner can withdraw their own requests
- ✅ Only tutor can accept/reject requests
- ✅ Cannot act on expired/withdrawn requests
- ✅ Duplicate request check prevents spam
- ✅ Priority enum validated on server-side
- ✅ Expiry time auto-calculated (not user-supplied)

---

## 📈 Performance Considerations

- Matching score calculation: O(n) per tutor (skips non-matching tutors early)
- Expiry check: Runs on demand in `getMyRequests()` - consider pagination
- Sorting: Client-side after fetch (works for discovery use case)
- Database indexes recommended on: `learner`, `tutor`, `status`, `createdAt`, `expiresAt`

---

## ✨ Files Modified Summary

### Backend
- ✅ `server/src/models/User.js`
- ✅ `server/src/models/LearningRequest.js`
- ✅ `server/src/models/SkillRequest.js`
- ✅ `server/src/controllers/requestController.js`
- ✅ `server/src/routes/requestRoutes.js`

### Frontend
- ✅ `client/src/pages/DiscoverPage.jsx`
- ✅ `client/src/pages/RequestsPage.jsx`
- ✅ `client/src/components/request/TutorCard.jsx`

---

**Status**: ✅ **PRODUCTION READY**

All 5 recommended features implemented with:
- Complete backend logic
- Intuitive UI/UX
- Error handling
- Security constraints
- Backward compatibility
