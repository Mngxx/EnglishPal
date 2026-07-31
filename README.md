# EnglishPal

> **Status: Active Development — Phase 2 (AWS)**

A personal AI-powered English voice assistant for improving vocabulary, fluency, and speaking confidence through real conversations — with structured feedback after every session.

---

## Motivation

Built for a Filipino software engineer preparing to work abroad and communicate confidently with foreign colleagues and clients. The goal is to practice speaking freely in either casual or professional English, and receive honest, specific feedback on grammar, vocabulary, and clarity — not mid-conversation, but as a review after each session.

---

## How It Works

1. Set your Groq API key via the **⚙️ API Key** button (free at [console.groq.com](https://console.groq.com))
2. Choose a conversation mode — **Casual** or **Formal**
3. Press **Start Listening** — speak freely, the app transcribes in real time
4. Press **Stop & Send** — the AI responds in text and voice
5. Press **End Session** — the AI generates a structured feedback report covering:
   - Grammar mistakes with corrections
   - Better vocabulary choices
   - Filler words used (uh, like, basically, you know...)
   - Clarity score (1–10)
   - Top 3 things to improve
6. Save the session to track progress on the **Progress Dashboard**

The AI remembers your last 3 sessions and uses that history to give more personalised coaching over time.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + Vite + TypeScript | Deployed on Vercel |
| Styling | Tailwind CSS v4 | Utility-first, Vite plugin |
| Charts | Recharts | Clarity score trend on dashboard |
| Speech Input | Web Speech API (browser) | Chrome / Edge only |
| Speech Output | Web Speech Synthesis API | Browser-native TTS |
| AI Model | Groq — Llama 3.1 8B Instant | User-supplied API key, free tier |
| Backend | Node.js + Express | Deployed as AWS Lambda via serverless-http |
| Infrastructure | AWS CDK (TypeScript) | Lambda + DynamoDB, defined as code |
| Database | AWS DynamoDB | Session storage, free tier |
| CI/CD | GitHub Actions | Type-check → unit tests → deploy on push to main |
| Testing | Jest + ts-jest + supertest | Unit tests for all backend routes |

---

## Project Structure

```
EnglishPal/
├── client/                        # React frontend (Vercel)
│   └── src/
│       ├── components/            # ApiKeyModal, FeedbackReport, ModeBadge
│       ├── hooks/                 # useApiKey, useChat, useFeedback,
│       │                          # useHistory, useSpeechRecognition,
│       │                          # useSpeechSynthesis
│       ├── pages/                 # Session, History, Dashboard
│       ├── utils/                 # parseFeedback (clarity score parser)
│       └── types/                 # shared TypeScript types
│
├── server/                        # Express backend (AWS Lambda)
│   └── src/
│       ├── routes/                # /chat, /feedback, /sessions, /validate-key
│       ├── db/                    # DynamoDB queries
│       ├── prompts/               # system prompts + AI memory builder
│       ├── types/                 # shared TypeScript types
│       └── __tests__/             # Jest unit tests for all routes
│
├── infra/                         # AWS CDK stack
│   └── lib/
│       └── infra-stack.ts         # Lambda + DynamoDB + env vars defined as code
│
└── .github/
    └── workflows/
        └── deploy-backend.yml     # CI/CD: type-check → test → deploy
```

---

## API Routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/chat` | Send a message, get an AI reply |
| `POST` | `/feedback` | Generate end-of-session feedback report |
| `POST` | `/validate-key` | Validate a Groq API key before saving |
| `GET` | `/sessions` | List all saved sessions |
| `POST` | `/sessions` | Save a new session |
| `GET` | `/sessions/:id` | Get a single session |
| `PATCH` | `/sessions/:id` | Update transcript and feedback |
| `DELETE` | `/sessions/:id` | Delete a session |
| `GET` | `/health` | Health check |

All AI routes (`/chat`, `/feedback`) require an `x-groq-api-key` request header.

---

## Getting Started (Local Development)

**Prerequisites:** Node.js 18+, Google Chrome, a free [Groq API key](https://console.groq.com)

```bash
# 1. Clone the repo
git clone <repo-url>
cd EnglishPal

# 2. Set up the backend
cd server
cp .env.example .env   # add GROQ_API_KEY (used only for local dev)
npm install
npm run dev            # runs on http://localhost:3000

# 3. Set up the frontend (new terminal)
cd client
npm install
# create client/.env.local with: VITE_API_URL=http://localhost:3000
npm run dev            # runs on http://localhost:5173
```

Open `http://localhost:5173` in **Google Chrome**, then use the **⚙️ API Key** button to set your Groq key.

> Note: `.env` and `.env.local` are git-ignored. Never commit your API key.

### Running Tests

```bash
cd server
npm test              # run all tests
npm test -- --watch   # re-run on file save
npm test -- --verbose # show individual test names
```

---

## Features

### Conversation Modes
- **Casual** — relaxed, everyday topics. Like talking to a friend about life, hobbies, or tech.
- **Formal** — professional scenarios: meetings, code reviews, job interviews, client calls.

The AI does not correct grammar mid-conversation — it responds naturally to keep the flow. All corrections come in the feedback report at the end.

### AI Memory
The AI reads your last 3 saved sessions before each conversation. It uses that history to personalise its responses — referencing recurring patterns, acknowledging improvement, and adjusting its coaching focus.

### Progress Dashboard
Tracks clarity scores over time with a line chart. Shows total sessions, latest score, average clarity, and a casual vs formal breakdown.

### Per-User API Key
Each user supplies their own Groq API key. Keys are stored in `localStorage` — never sent to the server except as a request header forwarded directly to Groq. A live validation check confirms the key works before it is saved.

---

## Roadmap

### Phase 1 — Local MVP ✅
- [x] Project scaffolding (React + Express + TypeScript)
- [x] Voice input / output (Web Speech API)
- [x] Groq conversation integration
- [x] Casual / Formal mode selector
- [x] End-of-session feedback report

### Phase 2 — AWS ✅
- [x] AWS DynamoDB for session storage
- [x] AWS Lambda deployment via serverless-http
- [x] AWS CDK infrastructure as code
- [x] CI/CD pipeline (GitHub Actions)
- [x] Unit tests (Jest + supertest)
- [x] AI memory from past sessions
- [x] Progress dashboard
- [x] Per-user Groq API key with live validation
- [x] CORS support for Vercel preview deployments

### Phase 3 — Planned
- [ ] User authentication (per-user data isolation)
- [ ] Onboarding flow for new users

---

_Personal project — not intended for public use during active development._
