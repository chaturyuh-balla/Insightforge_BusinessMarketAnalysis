# InsightForge AI

InsightForge AI is a full-stack multi-agent business research and strategy platform. Users enter a company name or startup idea, then the app uses Tavily for live research, Groq-hosted LLMs for specialized agent-style analysis, Neon PostgreSQL for session/report storage, and React/Recharts for a professional dashboard experience.

## Features

- Session-based sign up, sign in, and sign out
- Profile block with user name and email
- Market research report generation
- SWOT, competitor, pricing, and go-to-market analysis
- Evidence, citations, and critic review
- Interactive dashboard with pie, bar, and radar charts
- PDF export
- Session history

## Setup

```bash
cd insightforge
npm install
copy .env.example .env
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:5000`.

## Database

Run the SQL in `db/schema.sql` in the Neon SQL editor before using authentication and report storage.

## Environment Variables

Add these values to `.env`:

```bash
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
TAVILY_API_KEY=your_tavily_api_key
DATABASE_URL=your_neon_postgres_connection_string
SESSION_SECRET=a_long_random_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

Groq and Tavily keys are required for report generation. The app does not generate fallback reports.
