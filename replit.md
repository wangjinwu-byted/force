# SketchBoard - Real-Time Collaborative Canvas

## Overview

SketchBoard is a real-time collaborative sketch canvas application inspired by tools like Figma, Miro, and Excalidraw. It enables multiple users to draw, annotate, and collaborate simultaneously on shared boards with features including multi-layer drawing, sticky notes, and real-time presence indicators.

The application provides an infinite canvas workspace where teams can sketch ideas, create diagrams, and collaborate visually in real-time. Each board supports multiple layers for organizing content, customizable drawing tools, and persistent storage of all collaborative work.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing with two main routes:
- Board lobby (`/`) - Grid view of all available boards
- Canvas editor (`/board/:id`) - Full-screen collaborative drawing interface

**State Management**: 
- TanStack Query (React Query) for server state management and caching
- React hooks for local component state
- WebSocket connections for real-time collaborative state

**UI Components**: Radix UI primitives with shadcn/ui component library, styled with Tailwind CSS. Design system follows Material Design principles with a "New York" style variant, emphasizing canvas-first layout with minimal chrome.

**Canvas Rendering**: HTML5 Canvas API with normalized coordinate system (0-1 range) for resolution-independent drawing. Strokes are stored as normalized points and rendered relative to canvas dimensions.

**Design Tokens**: Custom CSS variables for theming with support for light/dark modes. Spacing follows Tailwind units (2, 3, 4, 6, 8) and custom elevation system using transparent black overlays.

### Backend Architecture

**Runtime**: Node.js with Express.js framework using ES modules.

**API Design**: RESTful HTTP endpoints for CRUD operations on boards, layers, strokes, and sticky notes. All endpoints prefixed with `/api`.

**Real-Time Communication**: WebSocket server (ws library) running alongside HTTP server for bidirectional real-time updates. Implements room-based broadcasting where users join board-specific channels.

**Storage Layer**: Abstracted through `IStorage` interface with in-memory implementation (`MemStorage`) as default. Design allows easy migration to database-backed storage (Drizzle ORM configuration present for PostgreSQL via Neon).

**Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple) for user authentication state.

### Data Models

**Database Schema** (Drizzle ORM with PostgreSQL):

- `users` - User authentication and profiles
- `boards` - Canvas workspaces with dimensions and thumbnails
- `layers` - Drawing layers within boards (z-order, visibility, opacity)
- `strokes` - Individual pen/eraser strokes with normalized point arrays
- `sticky_notes` - Positioned annotation notes with color variants

All tables use UUID primary keys with proper foreign key relationships and cascade deletes.

### Real-Time Collaboration

**WebSocket Protocol**: Custom message format with `type`, `boardId`, `data`, and `userId` fields. Message types include:
- `join_board` - User enters a board workspace
- `user_joined` / `user_left` - Presence notifications
- `users_list` - Active user roster updates
- `stroke_added` - Drawing stroke broadcasts
- `note_updated` - Sticky note changes
- `layer_updated` - Layer property modifications

**Connection Management**: Server maintains `Map<WebSocket, UserConnection>` for tracking which board each connection is viewing. Board-specific user sets enable efficient targeted broadcasting.

**Conflict Resolution**: Last-write-wins for concurrent edits. No operational transformation currently implemented.

### Development Workflow

**Hot Module Replacement**: Vite middleware integrated with Express for instant frontend updates during development.

**Build Process**: 
- Frontend: Vite bundles React app to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js` as ESM
- Production: Serves static frontend from Express with API routes

**Development Tools**: 
- Replit plugins for runtime error overlay and dev banner
- TypeScript type checking without emit
- Path aliases for clean imports (`@/`, `@shared/`, `@assets/`)

## External Dependencies

### Third-Party Services

**OpenAI DALL-E 3**: Generates abstract art thumbnails for new boards. Fallback to null if API unavailable. Uses predefined prompt templates for consistent aesthetic (abstract minimalist brush strokes, geometric shapes, vibrant gradients).

### Database

**Neon PostgreSQL**: Serverless PostgreSQL configured via `@neondatabase/serverless` driver. Connection via `DATABASE_URL` environment variable. Drizzle Kit handles migrations in `./migrations` directory.

### UI Component Libraries

- **Radix UI**: Headless accessible component primitives (dialogs, popovers, tooltips, etc.)
- **shadcn/ui**: Pre-styled Radix components with Tailwind CSS
- **Lucide React**: Icon library for UI elements
- **Embla Carousel**: Touch-friendly carousel components

### Development Dependencies

- **Vite**: Frontend build tool and dev server
- **esbuild**: Backend bundler for production builds
- **TypeScript**: Type safety across full stack
- **Tailwind CSS**: Utility-first styling with PostCSS

### Form & Validation

- **React Hook Form**: Form state management
- **Zod**: Schema validation, integrated with Drizzle for type-safe database operations
- **@hookform/resolvers**: Zod resolver for React Hook Form

### Styling & Animation

- **class-variance-authority**: Variant-based component styling
- **tailwind-merge**: Conflict-free Tailwind class merging
- **clsx**: Conditional class name composition

### Fonts

- **Google Fonts**: Inter (primary), Architects Daughter, DM Sans, Fira Code/Geist Mono for code/coordinates
- Preloaded via `<link>` tags in HTML for performance