# Jelly - Online Magazine

## Overview

Jelly is a fully functional, responsive web application for an online magazine focused on creative inspiration, design trends, and colorful content. The application features a modern React frontend with a Node.js/Express backend, implementing role-based authentication and content management capabilities. Users can read articles, browse by categories, view author profiles, and interact with content based on their assigned roles (Owner, Editor, Contributor, Reader).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with TypeScript using Vite as the build tool and development server
- **UI Framework**: Shadcn/ui components with Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom Jelly theme colors (pink, purple, blue, yellow, coral, mint)
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Server Framework**: Express.js with TypeScript for API endpoints and middleware
- **Session Management**: Express sessions with in-memory storage for user authentication
- **Authentication**: Role-based access control with bcrypt for password hashing
- **API Design**: RESTful endpoints with consistent error handling and request/response patterns
- **File Upload**: Uppy integration with Google Cloud Storage for image uploads

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database serverless)
- **Schema Design**: 
  - Users table with role-based permissions (owner, editor, contributor, reader)
  - Articles table with status management (draft, published)
  - Foreign key relationships between articles and authors

### Content Management System
- **Rich Text Editor**: Quill.js integration for article content creation
- **Image Upload**: Direct-to-cloud storage with ACL policy management
- **Role-Based Access**: 
  - Owner: Full admin access, user role management
  - Editor: Article CRUD operations, draft approval
  - Contributor: Draft creation only
  - Reader: View-only access

### Security & Authentication
- **Session-Based Auth**: Server-side session management with secure cookies
- **Password Security**: Bcrypt hashing with salt rounds
- **Role Validation**: Middleware-based role checking for protected routes
- **CSRF Protection**: Express session configuration with httpOnly cookies

## External Dependencies

### Cloud Storage
- **Google Cloud Storage**: File upload and storage with direct-to-cloud uploads
- **Replit Object Storage**: Integration for development environment file handling

### UI Components & Libraries
- **Radix UI**: Accessible component primitives for modals, dropdowns, and form controls
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form state management and validation
- **TanStack Query**: Server state synchronization and caching

### Development Tools
- **Vite**: Fast development server and build tool with HMR
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **PostCSS**: CSS processing for Tailwind integration

### Database & ORM
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle Kit**: Database migrations and schema management
- **Drizzle ORM**: Type-safe database queries and operations

### File Upload & Processing
- **Uppy**: File upload interface with dashboard modal
- **AWS S3 Integration**: Direct-to-S3 uploads with presigned URLs
- **Image Processing**: Client-side file validation and upload progress tracking