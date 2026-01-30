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

## Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Settings > API to get your Project URL and anon public key
3. Copy `.env.example` to `.env.local` and fill in your values:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Go to the SQL Editor in Supabase and run the contents of `supabase/schema.sql`

## License

This project is private and proprietary.
