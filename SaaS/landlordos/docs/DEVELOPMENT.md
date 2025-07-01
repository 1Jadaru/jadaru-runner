# LandlordOS Development Setup

## Quick Start Commands

```bash
# Install all dependencies
npm run install:all

# Run development servers
npm run dev

# Run individual services
npm run dev:client   # Frontend only
npm run dev:server   # Backend only
```

## Project Structure

```
landlordos/
├── client/          # React + TypeScript + Tailwind frontend
├── server/          # Node.js + Express + Prisma backend
├── docs/           # Project documentation
├── scripts/        # Utility scripts
└── package.json    # Workspace configuration
```

## Development Workflow

1. Make changes to code
2. Tests run automatically (if configured)
3. Linting and formatting on save
4. Hot reload for instant feedback

## Environment Setup

Copy `server/.env.example` to `server/.env` and update values.
