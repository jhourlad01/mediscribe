# MediScribe Web

Next.js frontend for MediScribe medical transcription app.

## Setup

```bash
npm install
cp env.example .env.local
npm run dev
```

## Scripts

- `npm run dev` - Start development server (with Turbopack)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- Material-UI 7
- React 19

## Features

- Material-UI themed interface
- Audio file upload
- Transcript viewing and management
- Real-time transcription status
- Responsive design

## Structure

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with MUI theme
│   │   └── page.tsx         # Home page
│   ├── lib/
│   │   └── api.ts           # API client
│   └── theme/
│       ├── theme.ts         # MUI theme configuration
│       └── ThemeRegistry.tsx # Theme provider
└── public/              # Static assets
```

## Development

The app runs on `http://localhost:3000` and communicates with the API at `http://localhost:5000`.

## Build

```bash
npm run build
npm start
```
