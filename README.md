# Real-time Chat Room Application

A collaborative chat room application built with Next.js 14, TypeScript, tRPC, and WebSocket support.

## Tech Stack

- **Frontend**:

  - Next.js 14+ with App Router
  - TypeScript (strict mode)
  - TailwindCSS
  - shadcn/ui components

- **Backend**:

  - tRPC for API endpoints
  - WebSocket support for real-time features
  - PostgreSQL database
  - Prisma ORM

- **State Management**:
  - Zustand for global state
  - React Query for server state

## Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd chat-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/chatapp"
   NEXT_PUBLIC_WS_URL="ws://localhost:3001"
   ```

4. **Set up the database**

   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d

   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:push

   # Seed the database
   npm run db:seed

   # OR to perform all three above, you could just run this
   npm run dev:setup
   ```

5. **Start the development server**

   ```bash
   npm run dev:full
   ```

   This will start:

   - Next.js app on http://localhost:3000
   - WebSocket server on ws://localhost:3001

## Features Implemented

- [x] User authentication
- [x] Real-time chat rooms
- [x] Message reactions
- [x] Room management
- [x] User presence
- [x] Multi-room support
- [x] Persistent data storage
- [x] Type-safe API
- [x] WebSocket integration

## Technical Decisions

1. **tRPC + WebSocket**

   - Type-safe API endpoints
   - Real-time subscriptions
   - Efficient data transfer

2. **Zustand for State Management**

   - Simple and lightweight
   - Persistent storage support
   - Easy integration with React

3. **PostgreSQL + Prisma**

   - Robust data storage
   - Type-safe database queries
   - Easy schema management

4. **shadcn/ui Components**
   - Modern UI components
   - Customizable design
   - Accessible by default

## Known Limitations

1. **Authentication**

   - Basic username-based auth
   - No password protection
   - Limited session management

2. **Scaling**

   - Basic WebSocket implementation
   - Limited error recovery

3. **Messages**
   - No message history limit
   - Basic reaction system
   - No rich text support

## Future Improvements

1. **Features**

   - Message search
   - Rich text formatting
   - Typing indicators
   - User profiles
   - Private messages

2. **Technical**

   - Message pagination
   - Better error handling
   - Connection recovery
   - Rate limiting
   - User presence optimization

3. **Security**
   - Proper authentication
   - Input validation
   - Rate limiting
   - Session management
