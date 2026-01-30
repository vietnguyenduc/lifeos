# Life OS

A comprehensive personal operating system for managing life holistically through data-driven insights.

## Features

- **Finance Management**: Track income, expenses, and cash flow
- **Career Planning**: 10-year career roadmap and skill tracking
- **Relationship Mapping**: Manage personal and professional relationships
- **Decision Logging**: Track decisions and their outcomes
- **Time & Energy Tracking**: Monitor daily activities and energy levels
- **Life Health Dashboard**: Overall life optimization metrics

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Query + Context API
- **Charts**: Recharts
- **Internationalization**: react-i18next

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Build for Production

```bash
npm run build
npm run preview
```

### Health Checks

```bash
npm run health-check
npm run type-check
npm run verify-deps
```

## Project Structure

```
life-os/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API and utility services
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript definitions
│   ├── locales/       # Internationalization files
│   └── utils/         # Utility functions
├── scripts/           # Build and verification scripts
├── docs/              # Documentation
└── public/            # Static assets
```

## Development

- Run `npm run dev` for development
- Run `npm run type-check` for TypeScript checking
- Run `npm run lint` for code linting
- Check `PRE-PUSH-CHECKLIST.md` before committing

## Contributing

1. Follow the `PRE-PUSH-CHECKLIST.md`
2. Run health checks before pushing
3. Use conventional commit messages

## License

This project is private and proprietary.
