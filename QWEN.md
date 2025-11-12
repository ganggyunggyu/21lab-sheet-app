# Qwen-Specific Guidelines

This document contains guidelines specifically tailored for working with Qwen (Alibaba Cloud's large language model) in the context of this Google Sheets Manager project.

## Project Overview

**Google Sheets Manager** is a Next.js-based application that provides a real-time dashboard for managing Google Sheets data with integrated MongoDB synchronization. The project follows Feature-Sliced Design (FSD) architecture principles and is built with TypeScript, React, and modern web technologies.

### Key Features
- Real-time Google Sheets data retrieval and inline editing
- Support for multiple tabs and smart filtering
- Synchronization between Google Sheets and MongoDB database
- Dark mode support with localStorage-based theme persistence
- Optimistic updates for improved UI responsiveness
- Cross-sheet synchronization for company exposure status

### Technology Stack
- **Core**: Next.js 16.0.1, React 19.2.0, TypeScript 5
- **State Management**: TanStack Query 5.90.6, Jotai 2.15.1
- **API & Data**: Axios 1.13.2, Google APIs 164.1.0, MongoDB + Mongoose 8.19.3, Zod 4.1.12
- **UI & Styling**: Tailwind CSS 4, Lucide React, React Hot Toast
- **Architecture**: Feature-Sliced Design (FSD)

## Project Structure (FSD)

```
sheet-app/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── keywords/      # Keyword CRUD API
│   │   └── sheets/[id]/   # Google Sheets API
│   ├── sheets/[sheetId]/  # Dynamic pages
│   ├── page.tsx           # Main page
│   └── providers.tsx      # Global providers
├── entities/              # Business domain entities
│   ├── keyword/
│   │   ├── model/        # Mongoose Schema
│   │   ├── api/          # DB CRUD functions
│   │   └── lib/          # TanStack Query hooks
│   ├── sheet/
│   │   ├── model/        # Jotai atoms
│   │   ├── api/          # API functions
│   │   └── lib/          # Hooks
│   └── theme/
│       ├── model/
│       └── lib/
├── features/              # User feature units
│   ├── sheet-table/
│   │   ├── ui/           # SheetTable component
│   │   └── lib/          # TanStack Query hooks
│   └── theme-toggle/
│       └── ui/
├── shared/                # Common modules
│   ├── api/              # Axios client
│   └── db/               # MongoDB connection
└── lib/                   # Server-only utilities
    └── google-sheets.ts  # Google Sheets API logic
```

## Building and Running

### Prerequisites
1. **Google Cloud Service Account**: You need a service account with Google Sheets API access
2. **MongoDB**: Either local installation or MongoDB Atlas cloud service
3. **pnpm**: Package manager used in this project

### Environment Variables
Create a `.env.local` file in the project root with the following:
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
MONGODB_URI=mongodb://localhost:27017/sheet-app
```

### Installation and Execution
```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Production build
pnpm build

# Production server
pnpm start

# Lint check
pnpm lint
```

## Development Conventions

### Architecture Principles
- **FSD (Feature-Sliced Design)**: Follow the layered architecture with proper dependencies
- **Upper layers only import lower layers**: `features` → `entities` → `shared`
- **TanStack Query**: Required for server state management
- **Jotai**: Used for client state management
- **Destructuring required**: Always use destructuring assignments where possible
- **Type definitions**: Explicitly define props types with interfaces

### Import Patterns
```typescript
// ✅ Recommended: Top-level imports
import { SheetTable, ThemeToggle } from '@/features';
import { useCompanyList, useTheme } from '@/entities';
import { api } from '@/shared';

// ✅ Acceptable: Depth-specific imports (more explicit)
import { SheetTable } from '@/features/sheet-table/ui';
import { useCompanyList } from '@/entities/sheet/lib';
```

### File Structure Standards
Each entity follows this structure:
```
entity-name/
├── model/
│   ├── atoms.ts      # Jotai atoms
│   └── index.ts
├── api/
│   ├── api.ts        # API functions
│   └── index.ts
├── lib/
│   ├── hooks.ts      # Custom hooks
│   └── index.ts
└── index.ts          # Public API
```

Each feature follows this structure:
```
feature-name/
├── ui/
│   ├── Component.tsx
│   └── index.ts
├── lib/
│   ├── hooks.ts      # TanStack Query hooks
│   └── index.ts
└── index.ts
```

## Core Functionality

The application allows users to:
1. View and edit Google Sheets data in real-time
2. Toggle between different sheet tabs (Package, Dogmaru Exclude)
3. Sync data to/from MongoDB database
4. Apply and remove root company names to keywords
5. Manage exposure status across sheets
6. Navigate between different company sheets

## Specialized Agents

This project includes specialized agents for development assistance:
- **General Agent**: For code research, searching, and multi-step tasks
- **Code Reviewer**: For reviewing implemented code
- **Documentation Helper**: For understanding project structure and conventions

## Security and Best Practices

- Environment variables must be properly secured
- Google service account keys should be stored safely
- Always validate data when syncing between Google Sheets and MongoDB
- Use TypeScript for type safety throughout the application
- Implement proper error handling for API calls

## Additional Notes

- The project uses Geist font family for UI
- The application supports Korean language interface
- Dark mode preference is stored in localStorage
- The application includes toast notifications for user feedback