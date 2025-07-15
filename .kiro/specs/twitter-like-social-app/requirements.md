# Requirements Document

## Introduction

This document outlines the requirements for transforming the existing simple ideas app into a Twitter-like social media platform. The application will support multiple users with GitHub authentication, image sharing capabilities, and social interaction features. The platform will be built using Next.js 15, deployed on Vercel, and use Neon PostgreSQL for data storage.

## Requirements

### Requirement 1: User Authentication and Registration

**User Story:** As a new user, I want to register and login using my GitHub account, so that I can access the platform securely without creating another password.

#### Acceptance Criteria

1. WHEN a user visits the application THEN the system SHALL display a "Login with GitHub" button if not authenticated
2. WHEN a user clicks "Login with GitHub" THEN the system SHALL redirect to GitHub OAuth authorization
3. WHEN GitHub authorization is successful THEN the system SHALL create a new user account if it doesn't exist
4. WHEN a user account is created THEN the system SHALL store GitHub username, avatar, and email in the database
5. WHEN a user is authenticated THEN the system SHALL display their profile information in the navigation
6. WHEN a user clicks logout THEN the system SHALL clear their session and redirect to login page

### Requirement 2: Post Creation with Text Content

**User Story:** As an authenticated user, I want to create posts with text content, so that I can share my thoughts and ideas with other users.

#### Acceptance Criteria

1. WHEN an authenticated user accesses the home page THEN the system SHALL display a post creation form
2. WHEN a user types in the post creation form THEN the system SHALL show a character counter with a maximum of 280 characters
3. WHEN a user submits a post with valid content THEN the system SHALL save the post to the database with timestamp and user association
4. WHEN a post is successfully created THEN the system SHALL display it immediately in the user's timeline
5. WHEN a user tries to submit an empty post THEN the system SHALL prevent submission and show an error message
6. WHEN a user exceeds the character limit THEN the system SHALL disable the submit button and highlight the counter in red

### Requirement 3: Image Upload and Management

**User Story:** As an authenticated user, I want to upload up to 5 images with my posts, so that I can share visual content alongside my text.

#### Acceptance Criteria

1. WHEN a user is creating a post THEN the system SHALL provide an image upload interface
2. WHEN a user selects images THEN the system SHALL allow a maximum of 5 images per post
3. WHEN a user tries to upload more than 5 images THEN the system SHALL prevent the upload and show an error message
4. WHEN a user uploads images THEN the system SHALL display image previews before posting
5. WHEN images are uploaded THEN the system SHALL compress and optimize them for web display
6. WHEN a user removes an image preview THEN the system SHALL remove it from the upload queue
7. WHEN a post with images is submitted THEN the system SHALL store images in Vercel Blob storage and save references in the database
8. WHEN images fail to upload THEN the system SHALL show an error message and prevent post submission

### Requirement 4: Personal Homepage with 3-Column Layout

**User Story:** As an authenticated user, I want to view my own posts on my homepage in a 3-column layout, so that I can see more of my content at once and have a unique visual experience.

#### Acceptance Criteria

1. WHEN an authenticated user accesses their homepage THEN the system SHALL display only their own posts
2. WHEN posts are displayed on the homepage THEN the system SHALL arrange them in a 3-column grid layout
3. WHEN posts contain images THEN the system SHALL display them appropriately within each column
4. WHEN posts are of different heights THEN the system SHALL use masonry-style layout to optimize space usage
5. WHEN a user scrolls down THEN the system SHALL load more of their own posts automatically
6. WHEN no personal posts exist THEN the system SHALL display a welcome message encouraging the user to create their first post
7. WHEN viewing on mobile devices THEN the system SHALL adapt to a single-column layout for better readability

### Requirement 5: Explore and Discovery Page

**User Story:** As an authenticated user, I want to explore posts from other users on a dedicated discovery page, so that I can see what others are sharing on the platform.

#### Acceptance Criteria

1. WHEN a user navigates to the "探索发现" (Explore) page THEN the system SHALL display posts from all other users except the current user
2. WHEN posts are displayed on the explore page THEN the system SHALL show them in reverse chronological order
3. WHEN posts are displayed THEN the system SHALL show author information, post content, images, and timestamp
4. WHEN posts contain images THEN the system SHALL display them in a responsive layout
5. WHEN a user scrolls to the bottom THEN the system SHALL load more posts automatically
6. WHEN images are clicked THEN the system SHALL display them in a larger view modal
7. WHEN no posts from other users exist THEN the system SHALL display an appropriate message

### Requirement 6: Post Management

**User Story:** As a post author, I want to delete my own posts, so that I can remove content I no longer want to share.

#### Acceptance Criteria

1. WHEN viewing own posts THEN the system SHALL display a delete option for each post
2. WHEN a user clicks delete THEN the system SHALL show a confirmation dialog
3. WHEN deletion is confirmed THEN the system SHALL remove the post and associated images from storage
4. WHEN a post is deleted THEN the system SHALL update the display immediately
5. WHEN viewing other users' posts THEN the system SHALL NOT display delete options
6. WHEN a post deletion fails THEN the system SHALL show an error message
