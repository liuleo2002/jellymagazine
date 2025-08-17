# Jelly - Online Magazine

A dynamic online magazine web application built with React, Node.js, and PostgreSQL.

## Features

- 🎨 Modern React frontend with responsive design
- 🔐 Role-based authentication (Owner, Editor, Contributor, Reader)
- 📝 Rich text editor for article creation
- 🖼️ Image upload with Google Cloud Storage integration
- 📊 Admin dashboard with user management
- 🎯 Content management system
- 📱 Mobile-first responsive design

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui components
- TanStack Query for state management
- Wouter for routing

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Drizzle ORM
- Express sessions for authentication
- Google Cloud Storage for file uploads

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Cloud Storage credentials (optional, for image uploads)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/liuleo2002/jellymagazine.git
cd jellymagazine
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Add your database URL and other configuration
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
MASTER_CODE=your_master_code_for_owner_signup
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts with role-based permissions
- `articles` - Magazine articles with rich content
- `website_content` - Configurable website content

## User Roles

- **Owner**: Full admin access, user management, content management
- **Editor**: Article creation and editing, draft approval
- **Contributor**: Draft article creation only
- **Reader**: View-only access to published content

## Development

### Database Operations
```bash
# Push schema changes to database
npm run db:push

# Generate database types
npm run db:generate
```

### Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── components.json  # Shadcn configuration
└── package.json     # Dependencies and scripts
```

## Deployment

The application is designed to work with:
- Replit for development and hosting
- Neon Database for PostgreSQL hosting
- Google Cloud Storage for file uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.