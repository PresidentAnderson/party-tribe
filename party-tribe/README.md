# Party Tribe™

The ultimate platform for party organizers and attendees.

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

## Project Structure

- `apps/web` - Main Next.js web application
- `apps/admin` - Admin dashboard
- `apps/mobile` - React Native mobile app
- `packages/ui` - Shared UI components
- `packages/db` - Database layer with Prisma
- `packages/api` - tRPC API
- `packages/config` - Shared configurations

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Prisma
- **API:** tRPC
- **Auth:** Auth.js
- **Monorepo:** Turborepo + pnpm workspaces