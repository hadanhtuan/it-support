# IT Support Management System

A comprehensive IT support management platform built with Next.js 14, Firebase, and TypeScript. The system enables users to create support tickets and get assistance from IT support staff.

## Overview

This application serves as a ticketing system for IT support domain with three user roles:
- **User**: Create and manage support tickets
- **IT Support**: Enroll in tickets and provide technical assistance
- **Admin**: System administration and user management

Users and IT support staff communicate via Zalo (Vietnamese messaging app) for real-time support.

## Tech Stack

- **Framework**: Next.js 14.2.26 (App Router)
- **Language**: TypeScript
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Internationalization**: next-intl (Vietnamese)

## Key Features

### User Management
- Email/password authentication with Firebase
- Email verification on registration
- Password reset functionality
- Role-based access control (USER, IT_SUPPORT, ADMIN)
- Zalo ID integration for communication
- Profile management with avatar upload

### Ticket System
- Create support tickets with categories:
  - Hardware issues
  - Software problems
  - Network connectivity
  - Account access
  - Other technical issues
- Priority levels: Low, Medium, High, Urgent
- Status tracking: Open, In Progress, Resolved, Closed
- IT support enrollment and assignment
- Solution tracking and documentation
- Ticket history and activity logs

### Notifications (Non-Realtime)
- Mention notifications in messages
- Bell icon with unread count badge
- Notification list with mark as read
- Polling-based updates (every 60 seconds)

### IT Support Features
- Dashboard for assigned tickets
- Ticket enrollment system
- Support statistics and ratings
- Highest-rated IT support showcase
- Years of experience tracking

### Admin Features
- User management (bulk status updates)
- IT support staff management
- System configuration
- Create admin accounts

## Project Structure

```
src/
├── app/                      # Next.js app router
│   ├── (main)/              # Main layout routes
│   │   ├── auth/            # Authentication pages
│   │   ├── tickets/         # Ticket management
│   │   ├── user/            # User dashboard
│   │   └── it-support/      # IT support dashboard
│   ├── (admin)/             # Admin layout
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── admin/               # Admin components
│   ├── auth/                # Auth components
│   └── home/                # Landing page components
├── lib/                     # Utilities and configs
│   ├── core/models/         # TypeScript models
│   ├── firebase/            # Firebase configuration
│   ├── context/             # React contexts
│   ├── i18n/                # Internationalization
│   └── utils/               # Helper functions
├── services/                # Business logic layer
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── ticket.service.ts
│   ├── it-support.service.ts
│   ├── notification.service.ts
│   └── review.service.ts
└── hooks/                   # Custom React hooks
```

## Firebase Collections

- `users` - User profiles and authentication data
- `tickets` - Support tickets
- `reviews` - IT support ratings and reviews
- `configurations` - System configuration
- `notifications` - User notifications

## Authentication Flow

1. User registers with email/password
2. Firebase sends verification email automatically
3. User verifies email to activate account
4. Session persists across browser restarts (30-90 days)
5. Auth tokens auto-refresh every hour
6. Route guards protect authenticated pages

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Firebase credentials

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

## Features Implementation Notes

### Non-Realtime Architecture
- All data fetching uses one-time queries (`getDocs`)
- React Query handles caching and refetching
- Notifications poll every 60 seconds
- No `onSnapshot()` listeners (except `onAuthStateChanged` for auth)
- Cost-optimized for Firestore reads

### Mention System
- Parse @mentions in messages
- Highlight mentions in blue
- Create notifications for mentioned users
- Autocomplete suggestions when typing @

### Vietnamese Language Support
All UI text and content are in Vietnamese, including:
- Navigation and menus
- Form labels and validation
- Error messages
- System notifications
- Email templates (Firebase handles)

## Development

- **Framework**: Next.js 14 with App Router and Server Components
- **Styling**: Tailwind CSS with custom theme
- **Type Safety**: Strict TypeScript configuration
- **Code Quality**: ESLint with Next.js rules
- **Git**: Currently on master branch

## License

This is a private project for IT support management.