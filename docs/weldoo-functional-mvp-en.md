# Weldoo - MVP Functional Specification

## 1. Objective

Weldoo is a vertical professional network for welders, industrial companies, training providers, and welding-sector specialists.

The objective of Phase 1 is to convert the current prototype into a functional MVP that can be used by real users, with the core functionality required to validate the product value proposition:

- Create and manage welding-specific professional profiles.
- Publish technical and professional content in a feed.
- Discover and connect with other profiles in the sector.
- Publish and browse job opportunities.
- Publish and browse training, courses, and events.
- Enable basic communication between users.
- Provide an admin panel for content management and moderation.

Phase 1 is not intended to compete with a complete LinkedIn-like platform yet. Its goal is to validate whether there is real traction for a vertical professional welding community.

## 2. Development Approach

The MVP will be developed by a single developer using Codex as an accelerator for:

- Component generation.
- CRUD implementation.
- Database modelling.
- Prototype refactoring.
- Basic tests.
- Bug fixing.
- Technical documentation.

The recommended estimate for a strong Phase 1 MVP is approximately:

- 350-550 hours of effective development work.
- 10-16 weeks with high dedication.
- 14-22 weeks if developed part-time but consistently.

As the planning number, use:

**500 hours / 14 weeks**

This number leaves enough room to build a real product, not just connect screens to a database.

## 3. Target Users

### 3.1 Welder / Technical Professional

The main user of the platform.

Needs:

- Create a professional profile.
- Show experience, welding processes, materials, positions, certifications, and availability.
- Find job opportunities.
- Follow technical content.
- Connect with companies, other welders, and training providers.
- Discover courses, webinars, and events.

### 3.2 Company / Employer

Industrial company, workshop, construction company, engineering firm, manufacturer, or specialised recruiter.

Needs:

- Create a company profile.
- Publish job openings.
- Search for professionals.
- Contact candidates.
- Publish brand content or technical updates.

### 3.3 Training Provider / Academy

Organisation offering courses, certifications, webinars, or workshops.

Needs:

- Create an organisation profile.
- Publish courses and events.
- Receive interest requests or registrations.
- Gain visibility inside a vertical professional community.

### 3.4 Administrator

Responsible for operating the platform.

Needs:

- Manage users.
- Moderate posts.
- Review reports.
- Manage featured jobs, courses, and events.
- Maintain content quality.

## 4. Phase 1 - Strong MVP

### 4.1 Authentication and Onboarding

Functionality:

- Email and password registration.
- Login and logout.
- Password recovery.
- User type selection:
  - Professional / welder.
  - Company.
  - Training provider.
- Initial onboarding with minimum required data depending on user type.

Initial fields for professionals:

- Name.
- Location.
- Professional headline.
- Welding processes.
- Experience.
- Availability.

Initial fields for companies:

- Company name.
- Sector.
- Location.
- Description.
- Website/contact.

Initial fields for training providers:

- Name.
- Location.
- Types of training offered.
- Website/contact.

### 4.2 Profiles

Profiles should be one of the central pieces of the MVP.

Common functionality:

- View public profile.
- Edit own profile.
- Photo/avatar.
- Optional cover image.
- Location.
- Description.
- External links.

Professional profile:

- Professional headline.
- Work experience.
- Welding processes:
  - MIG/MAG.
  - TIG.
  - MMA/SMAW.
  - FCAW.
  - SAW.
  - Other.
- Materials:
  - Carbon steel.
  - Stainless steel.
  - Aluminium.
  - Duplex.
  - Special alloys.
- Positions:
  - PA, PB, PC, PD, PE, PF, PG.
  - 1G, 2G, 3G, 4G, 5G, 6G.
- Self-declared certifications.
- Availability:
  - Available.
  - Not available.
  - Open to opportunities.
- Work preference:
  - Local.
  - National.
  - International.
  - Offshore.
  - Workshop.
  - Site work.

Company profile:

- Description.
- Sector.
- Company size.
- Location.
- Active job openings.
- Posts.
- Contact.

Training provider profile:

- Description.
- Published courses.
- Published events.
- Location.
- Contact.

### 4.3 Professional Feed

The feed should enable basic social activity, focused on sector-specific content.

Functionality:

- Create post.
- Edit/delete own post.
- View general feed.
- View posts from a profile.
- Like.
- Comments.
- Save post.
- Optional image upload.
- Report post.

Expected content types:

- Technical cases.
- Weld photos.
- Procedure parameters.
- Technical questions.
- Safety.
- Certifications.
- Projects.
- Sector news.

Not recommended for Phase 1:

- Complex ranking algorithm.
- Advanced recommendations.
- Social video.
- Advanced hashtags.

### 4.4 Professional Network / Directory

Functionality:

- Profile listing.
- Search by name, role, or company.
- Filters:
  - Profile type.
  - Location.
  - Welding process.
  - Availability.
  - Experience.
- View public profile.
- Follow or connect with another user.
- Basic relationship state:
  - Not connected.
  - Request sent.
  - Connected.

To simplify the MVP, choose between:

- Follow model.
- Bilateral connection model.

Phase 1 recommendation:

Use bilateral connections if the focus is employment and professional contact. Use following if the initial focus is content and community.

### 4.5 Jobs

Functionality for users:

- View job listings.
- Search jobs.
- Filter by:
  - Location.
  - Welding process.
  - Contract type.
  - Travel availability.
  - Experience.
  - Company.
- View job detail.
- Save job.
- Apply to a job.

Functionality for companies:

- Create job.
- Edit job.
- Close job.
- View candidates or applications.

Recommended application model for Phase 1:

- Option A: external application button.
- Option B: simple application form inside Weldoo.

Recommendation:

Implement a simple internal form first:

- Candidate message.
- Optional CV or external link.
- Basic profile data.
- Application status.

Application statuses:

- Submitted.
- Viewed.
- Contacted.
- Rejected.

### 4.6 Academy, Courses, and Events

Functionality:

- Course/event listing.
- Filters:
  - Online.
  - Webinar.
  - In-person.
  - Level.
  - Location.
- Detail page.
- Save course/event.
- Register interest.
- Request information.

Types:

- Online course.
- Webinar.
- In-person course.
- Workshop.
- Sector event.

For Phase 1, webinars should not include an integrated live video room. They should work as:

- Informational page.
- Interest registration.
- Optional external link to Zoom, Meet, Teams, or Jitsi.
- Optional recording as an external link.

### 4.7 Basic Messaging

Phase 1 should include simple communication, but not advanced chat.

Options:

1. Contact request:
   - A user sends a contact request with a message.
   - The recipient receives the request in their panel.

2. Simple messaging:
   - 1:1 conversations.
   - Plain text.
   - No files.
   - No typing indicators.
   - No real-time read receipts.

Recommendation:

To reduce complexity, start with contact requests and evolve into simple messaging only if the product needs it.

### 4.8 Basic In-App Notifications

Although advanced notification infrastructure is moved to Phase 2, Phase 1 should include visible activity inside the app.

Functionality:

- View recent activity.
- Simple internal notifications for:
  - New connection.
  - Comment on post.
  - Like on post.
  - Contact request.
  - New job application.

Not included in Phase 1:

- Push notifications.
- Complex email notifications.
- WebSockets.
- Real-time infrastructure.
- Advanced channel preferences.

### 4.9 Administration and Moderation

Basic admin panel.

Functionality:

- View users.
- Search users.
- Activate/deactivate users.
- View posts.
- Delete posts.
- View reported comments.
- Manage reports.
- View job postings.
- Approve or remove job postings.
- View courses/events.
- Approve or remove courses/events.

Roles:

- Normal user.
- Company.
- Training provider.
- Administrator.

### 4.10 Responsive and Visual Quality

The MVP must work correctly on:

- Desktop.
- Tablet.
- Mobile.

Priorities:

- Clear mobile navigation.
- Readable feed.
- Usable forms.
- Well-structured profiles.
- Easy-to-browse jobs and courses.

The current prototype can be used as a visual base, but it must be converted into maintainable components.

Weldoo will be built as a responsive web app. Native iOS and Android apps are not part of the planned scope.

## 5. Phase 2 - Functionality Excluded from Phase 1

The following functionality is explicitly excluded from Phase 1 and moved to Phase 2.

### 5.1 Payments

Possible future uses:

- Paid courses.
- Premium subscriptions.
- Featured job postings.
- Company plans.
- Hiring or training commissions.

Not included in Phase 1:

- Stripe.
- Invoicing.
- Payment plans.
- Checkout.
- Tax management.

### 5.2 Integrated Live Video

Possible future uses:

- Webinars inside Weldoo.
- Live rooms.
- Live classes.
- Interactive Q&A.
- Internal recordings.

Not included in Phase 1:

- Embedded Jitsi/Zoom/Meet as Weldoo-owned rooms.
- Camera/microphone inside the platform.
- Real-time participant management.
- Session recording.

In Phase 1, webinars can use external links.

### 5.3 Complex Recommendations

Possible future uses:

- Contact recommendations.
- Job recommendations.
- Course recommendations.
- Personalised feed ranking.
- Advanced matching between welders and companies.

Not included in Phase 1:

- Advanced algorithms.
- Machine learning.
- Complex scoring.
- Deep personalisation.

In Phase 1, simple filters and sorting are enough.

### 5.4 Certification Verification

Possible future uses:

- Certificate upload.
- Manual admin validation.
- Validation by external entities.
- Verified profile badge.
- Certificate expiration and renewal.

Not included in Phase 1:

- Official validation.
- Integration with certifying bodies.
- Verified badges.

In Phase 1, certifications are self-declared.

### 5.5 Advanced Chat

Possible future uses:

- Real-time chat.
- Typing indicator.
- Read receipts.
- Attachments.
- Audio/video.
- Groups.
- User blocking.

Not included in Phase 1:

- WebSockets.
- Advanced chat.
- Multimedia.
- Groups.

In Phase 1, use contact requests or simple messaging.

### 5.6 Advanced Notification Infrastructure

Possible future uses:

- Push notifications.
- Advanced transactional emails.
- Channel preferences.
- Weekly digest.
- Real-time notifications.

Not included in Phase 1:

- Mobile/browser push.
- Complex preference system.
- Advanced notification queue.

In Phase 1, simple internal notifications are enough.

## 6. Initial Data Model

Main entities:

- User.
- Profile.
- Company.
- TrainingProvider.
- Post.
- Comment.
- Like.
- SavedItem.
- Connection.
- Job.
- JobApplication.
- CourseEvent.
- CourseRegistrationInterest.
- ContactRequest.
- Notification.
- Report.

Key relationships:

- A User has one Profile.
- A User may belong to a Company or TrainingProvider.
- A User creates Posts.
- A Post has Comments and Likes.
- A User can save Posts, Jobs, and Courses.
- A Company creates Jobs.
- A User applies to Jobs.
- A TrainingProvider creates Courses/Events.
- A User registers interest in Courses/Events.
- Users can connect with each other.

## 7. Functional Priority

### Must Have

- Auth.
- Onboarding.
- Editable profile.
- Feed with posts/comments/likes.
- Profile directory.
- Jobs.
- Courses/events.
- Contact request or simple messaging.
- Basic admin.
- Responsive.

### Should Have

- Save posts/jobs/courses.
- Report content.
- Advanced filters in jobs and profiles.
- Application statuses.
- Simple internal notifications.

### Could Have

- Image upload in posts.
- CV upload.
- Featured profiles.
- Featured courses.
- Featured companies.

### Won't Have in Phase 1

- Payments.
- Integrated live video.
- Complex recommendations.
- Certification verification.
- Advanced chat.
- Advanced notification infrastructure.

## 8. Estimate by Phase

### 8.1 Phase 1 Estimate

Phase 1 covers the strong MVP: authentication, onboarding, welding-specific profiles, feed, professional network, jobs, academy/events, contact requests or simple messaging, admin/moderation, and responsive polish.

| Phase 1 Module | Estimate |
|---|---:|
| Product cleanup / specification | 12-24h |
| Technical setup, architecture, and deployment | 30-50h |
| Prototype conversion into responsive app | 50-90h |
| Auth and onboarding | 25-45h |
| Profiles | 45-75h |
| Feed | 55-90h |
| Network / directory | 35-60h |
| Jobs | 40-70h |
| Academy/events | 35-60h |
| Contact request / simple messaging | 30-60h |
| Admin/moderation | 40-70h |
| QA, mobile polish, and launch fixes | 40-70h |

Phase 1 target estimate:

**350-550 hours**

Phase 1 recommended planning number:

**500 hours**

### 8.2 Phase 2 Estimate

Phase 2 covers functionality intentionally excluded from the first MVP: payments, integrated live video, complex recommendations, certification verification, advanced chat, and advanced notification infrastructure.

| Phase 2 Module | Estimate |
|---|---:|
| Payments: plans, checkout, invoicing, paid courses or featured jobs | 40-80h |
| Integrated live video: embedded room, permissions, session state, attendance | 70-140h |
| Complex recommendations: jobs, courses, contacts, feed ranking | 60-130h |
| Certification verification: uploads, admin review, verified badges, expiry fields | 60-120h |
| Advanced chat: real-time messages, read states, attachments, blocking | 70-140h |
| Advanced notifications: email flows, preferences, digests, real-time updates | 50-110h |
| Phase 2 QA, migration, polish, and production hardening | 50-90h |

Phase 2 target estimate:

**400-810 hours**

Phase 2 recommended planning number:

**600 hours**

### 8.3 Combined Estimate

Total estimated effort for Phase 1 and Phase 2:

**750-1,360 hours**

Recommended planning number for both phases:

**1,100 hours**

## 9. Suggested Execution Plan

### Sprint 0 - Preparation

- Choose stack.
- Define data model.
- Create repository and structure.
- Configure auth, database, and deployment.
- Convert the prototype into initial routes/components.

### Sprint 1 - Auth, Onboarding, and Profiles

- Registration/login.
- User type selection.
- Editable profile.
- Public profile.
- Welding-specific profile data.

### Sprint 2 - Feed

- Create posts.
- View feed.
- Likes.
- Comments.
- Saved posts.
- Basic reports.

### Sprint 3 - Professional Network

- Directory.
- Search.
- Filters.
- Connection or follow.
- View profile from directory.

### Sprint 4 - Jobs

- Job listing.
- Job detail.
- Create/edit job as company.
- Simple application.
- Save job.

### Sprint 5 - Academy and Events

- Listing.
- Detail.
- Filters.
- Interest registration.
- Save course/event.

### Sprint 6 - Contact, Admin, and QA

- Contact requests or simple messaging.
- Basic admin.
- Moderation.
- Responsive.
- QA.
- Private beta preparation.

## 10. Phase 1 Success Criteria

Phase 1 is considered ready when:

- A user can register and create a professional profile.
- A company can create a profile and publish a job.
- A user can find and apply to a job.
- A user can publish content and receive interaction.
- A user can discover profiles and connect/contact.
- A training provider can publish courses/events.
- A user can register interest in courses/events.
- An administrator can perform basic content moderation.
- The app works correctly on desktop and mobile.
- The product can be shown to real users without relying on the static prototype.
