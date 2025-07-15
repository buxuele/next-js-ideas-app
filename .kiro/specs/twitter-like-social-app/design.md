# Design Document

## Overview

This design document outlines the technical architecture for transforming the existing ideas app into a Twitter-like social media platform. The application will feature GitHub-only authentication, image sharing capabilities, a unique 3-column personal homepage layout, and a separate exploration page for discovering other users' content.

The system will be built using Next.js 15 with the App Router, deployed on Vercel, and use Neon PostgreSQL for data persistence and Vercel Blob for image storage.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    A[Client Browser] --> B[Next.js App Router]
    B --> C[Authentication Layer]
    B --> D[API Routes]
    D --> E[Database Layer]
    D --> F[File Storage]

    C --> G[NextAuth.js v5]
    G --> H[GitHub OAuth]

    E --> I[Neon PostgreSQL]
    F --> J[Vercel Blob Storage]

    B --> K[UI Components]
    K --> L[3-Column Homepage]
    K --> M[Explore Page]
    K --> N[Post Creation]
```

### Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js v5 with GitHub Provider
- **Database**: Neon PostgreSQL with connection pooling
- **File Storage**: Vercel Blob Storage
- **Deployment**: Vercel Platform
- **Image Processing**: Sharp (for optimization)

## Components and Interfaces

### Authentication System

#### NextAuth.js Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { neon } from "@neondatabase/serverless";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Auto-create user in database on first login
      return true;
    },
    async session({ session, token }) {
      // Add user ID to session
      return session;
    },
  },
});
```

#### User Authentication Flow

1. User clicks "Login with GitHub"
2. Redirect to GitHub OAuth
3. On successful auth, create/update user record
4. Set secure session cookie
5. Redirect to personal homepage

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  email VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Posts Table

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 280),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Images Table

```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  blob_url TEXT NOT NULL,
  filename VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  upload_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Database Indexes

```sql
CREATE INDEX idx_posts_user_id_created_at ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_images_post_id ON images(post_id, upload_order);
```

### API Design

#### Authentication Endpoints

- `GET /api/auth/[...nextauth]` - NextAuth.js handlers
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Sign out user

#### Posts API

```typescript
// GET /api/posts - Get posts for explore page
// GET /api/posts/me - Get current user's posts
// POST /api/posts - Create new post
// DELETE /api/posts/[id] - Delete user's own post
```

#### Images API

```typescript
// POST /api/images/upload - Upload images to Vercel Blob
// DELETE /api/images/[id] - Delete image from storage
```

### Frontend Components Architecture

#### Page Structure

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx          # Authenticated layout
│   ├── page.tsx            # Personal homepage (3-column)
│   └── explore/
│       └── page.tsx        # Explore other users' posts
├── api/
│   ├── auth/[...nextauth]/
│   ├── posts/
│   └── images/
└── components/
    ├── auth/
    ├── posts/
    ├── images/
    └── layout/
```

#### Key Components

**PostCreationForm Component**

```typescript
interface PostCreationFormProps {
  onPostCreated: () => void;
}

// Features:
// - Text input with 280 character limit
// - Image upload (max 5 images)
// - Image preview and removal
// - Form validation
// - Loading states
```

**ThreeColumnLayout Component**

```typescript
interface ThreeColumnLayoutProps {
  posts: Post[];
  onLoadMore: () => void;
}

// Features:
// - Masonry-style 3-column grid
// - Responsive design (mobile: 1 column)
// - Infinite scroll
// - Image lazy loading
```

**PostCard Component**

```typescript
interface PostCardProps {
  post: Post;
  showDeleteButton?: boolean;
  onDelete?: (postId: string) => void;
}

// Features:
// - Display post content and images
// - Author information
// - Timestamp
// - Delete button (own posts only)
// - Image modal viewer
```

## Data Models

### TypeScript Interfaces

```typescript
interface User {
  id: string;
  githubId: string;
  username: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  images: Image[];
}

interface Image {
  id: string;
  postId: string;
  blobUrl: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  uploadOrder: number;
  createdAt: Date;
}
```

### Data Validation

```typescript
// Post validation
const PostSchema = z.object({
  content: z.string().min(1).max(280),
  images: z.array(z.string()).max(5).optional(),
});

// Image validation
const ImageSchema = z.object({
  file: z.instanceof(File),
  size: z.number().max(10 * 1024 * 1024), // 10MB
  type: z.enum(["image/jpeg", "image/png", "image/webp"]),
});
```

## Error Handling

### Error Types and Responses

```typescript
interface APIError {
  error: string;
  message: string;
  statusCode: number;
}

// Common error responses:
// 400 - Bad Request (validation errors)
// 401 - Unauthorized (not logged in)
// 403 - Forbidden (not allowed to access resource)
// 404 - Not Found (resource doesn't exist)
// 413 - Payload Too Large (file size exceeded)
// 429 - Too Many Requests (rate limiting)
// 500 - Internal Server Error
```

### Error Handling Strategy

1. **Client-side validation** - Immediate feedback for form inputs
2. **Server-side validation** - Comprehensive validation in API routes
3. **Database constraints** - Data integrity at database level
4. **Graceful degradation** - Fallback UI states for errors
5. **User-friendly messages** - Clear error communication

### Error Boundaries

```typescript
// Global error boundary for unhandled errors
// Per-component error boundaries for isolated failures
// Toast notifications for user actions
// Loading states with error recovery options
```

## Testing Strategy

### Testing Pyramid

#### Unit Tests

- Component rendering and behavior
- Utility functions
- Data validation schemas
- API route handlers

#### Integration Tests

- Authentication flow
- Database operations
- File upload process
- API endpoint interactions

#### End-to-End Tests

- User registration and login
- Post creation with images
- 3-column layout functionality
- Explore page navigation

### Testing Tools

- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **MSW** - API mocking for tests

### Test Coverage Goals

- Unit tests: 80%+ coverage
- Integration tests: Critical user flows
- E2E tests: Main user journeys

## Performance Considerations

### Image Optimization

- **Compression**: Automatic compression on upload using Sharp
- **Responsive images**: Multiple sizes for different viewports
- **Lazy loading**: Images load as they enter viewport
- **CDN delivery**: Vercel Blob provides global CDN

### Database Optimization

- **Connection pooling**: Efficient database connections
- **Indexed queries**: Optimized for common query patterns
- **Pagination**: Limit query results for better performance
- **Caching**: Redis caching for frequently accessed data (future enhancement)

### Frontend Performance

- **Code splitting**: Automatic with Next.js App Router
- **Static generation**: Pre-render pages where possible
- **Image optimization**: Next.js Image component
- **Bundle optimization**: Tree shaking and minification

### 3-Column Layout Performance

- **Virtual scrolling**: For large numbers of posts
- **Masonry optimization**: Efficient column balancing
- **Intersection Observer**: For infinite scroll
- **Debounced resize**: Smooth responsive behavior

## Security Considerations

### Authentication Security

- **OAuth 2.0**: Secure GitHub authentication
- **Secure cookies**: HttpOnly, Secure, SameSite attributes
- **CSRF protection**: Built into NextAuth.js
- **Session management**: Automatic token refresh

### Data Security

- **Input sanitization**: Prevent XSS attacks
- **SQL injection prevention**: Parameterized queries
- **File upload security**: Type and size validation
- **Rate limiting**: Prevent abuse and spam

### Privacy Protection

- **Data minimization**: Only store necessary user data
- **Secure storage**: Encrypted sensitive data
- **Access control**: Users can only modify their own content
- **Audit logging**: Track important security events

## Deployment and Infrastructure

### Vercel Configuration

```javascript
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "GITHUB_ID": "@github-id",
    "GITHUB_SECRET": "@github-secret",
    "DATABASE_URL": "@database-url",
    "BLOB_READ_WRITE_TOKEN": "@blob-token"
  }
}
```

### Environment Variables

```bash
# Authentication
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# File Storage
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### Database Setup (Neon)

1. Create Neon project
2. Run database migrations
3. Set up connection pooling
4. Configure environment variables

### Monitoring and Analytics

- **Vercel Analytics**: Page views and performance
- **Error tracking**: Sentry integration (optional)
- **Database monitoring**: Neon dashboard
- **Performance monitoring**: Web Vitals tracking
