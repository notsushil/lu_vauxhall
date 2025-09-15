# LevelUP Report Generator

A React application for generating and sending shift reports via email using Vercel serverless functions.

## Development Setup

### Option 1: Vercel Dev (Recommended)
This approach runs both the frontend and API routes locally using Vercel's development server:

```bash
npm run dev:vercel
# or
vercel dev
```

This will start the development server at `http://localhost:3000` with full API support.

### Option 2: Vite Dev with Proxy
This approach uses Vite's dev server with a proxy to forward API calls:

1. Start Vercel dev in one terminal (for API routes):
```bash
vercel dev --listen 3000
```

2. Start Vite dev in another terminal (for frontend):
```bash
npm run dev:vite
```

The Vite dev server will run at `http://localhost:5173` and proxy `/api/*` requests to `http://localhost:3000`.

## Environment Variables

Create a `.env.local` file with:
```
RESEND_API_KEY=your_resend_api_key
MAIL_FROM=your_email@domain.com
REPORT_TO=recipient@domain.com
VITE_OWM_KEY=your_openweathermap_api_key
```

## API Routes

- `POST /api/send-report` - Sends report via email using Resend

## Tech Stack

- React + Vite
- Vercel Serverless Functions
- Resend (email service)
- OpenWeatherMap API
