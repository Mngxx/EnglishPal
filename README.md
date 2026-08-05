# EnglishPal

> **Status: Active Development — Phase 4 (Planned Enhancements)**
> Phase 1 (local MVP), Phase 2 (AWS deployment), and Phase 3 (onboarding + full authentication) are complete and live.

A personal AI-powered English voice assistant for improving vocabulary, fluency, and speaking confidence through real conversations — with structured feedback after every session.

---

## Motivation

Built for a Filipino software engineer preparing to work abroad and communicate confidently with foreign colleagues and clients. The goal is to practice speaking freely in either casual or professional English, and receive honest, specific feedback on grammar, vocabulary, and clarity — not mid-conversation, but as a review after each session.

---

## How It Works

0. **Sign up or log in** — every route requires an account; sessions are private to your login
1. First-time on a new account: a short onboarding wizard — what the app does, how to get a free Groq API key, and a ready screen. Replayable anytime via the **❓ How it works** button.
2. Set your Groq API key via the **⚙️ API Key** button (free at [console.groq.com/keys](https://console.groq.com/keys))
3. Choose a conversation mode — **Casual** or **Formal**
4. Press **Start Listening** — speak freely, the app transcribes in real time
5. Press **Stop & Send** — the AI responds in text and voice
6. Press **End Session** — the AI generates a structured feedback report covering:
   - Grammar mistakes with corrections
   - Better vocabulary choices
   - Filler words used (uh, like, basically, you know...)
   - Clarity score (1–10)
   - Top 3 things to improve
7. Save the session to track progress on the **Progress Dashboard**

The AI remembers your last 3 sessions and uses that history to give more personalised coaching over time.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + Vite + TypeScript | Deployed on Vercel |
| Styling | Tailwind CSS v4 | Utility-first, Vite plugin |
| Authentication | AWS Cognito | User Pool + custom login/signup UI (`amazon-cognito-identity-js`), free tier: 50k MAUs |
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
│       ├── components/            # ApiKeyModal, GroqKeyForm, FeedbackReport,
│       │                          # ModeBadge, OnboardingWizard, ProtectedRoute
│       ├── hooks/                 # useApiKey, useAuth, useChat, useFeedback,
│       │                          # useHistory, useOnboarding,
│       │                          # useSpeechRecognition, useSpeechSynthesis
│       ├── pages/                 # Session, History, Dashboard, Login, Signup
│       ├── lib/                   # api.ts (authorizedFetch, validateGroqKey),
│       │                          # cognito.ts (userPool, getIdToken)
│       ├── utils/                 # parseFeedback (clarity score parser)
│       └── types/                 # shared TypeScript types
│
├── server/                        # Express backend (AWS Lambda)
│   └── src/
│       ├── routes/                # /chat, /feedback, /sessions, /validate-key
│       ├── db/                    # DynamoDB queries, keyed on authenticated userId
│       ├── middleware/            # auth.ts — Cognito JWT verification
│       ├── prompts/               # system prompts + AI memory builder
│       ├── types/                 # shared TypeScript types
│       └── __tests__/             # Jest unit tests for all routes + middleware
│
├── infra/                         # AWS CDK stack
│   └── lib/
│       └── infra-stack.ts         # Lambda + DynamoDB + Cognito + env vars, as code
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

Every route requires an `Authorization: Bearer <Cognito ID token>` header — there is no anonymous access. AI routes (`/chat`, `/feedback`) additionally require an `x-groq-api-key` header.

---

## Getting Started (Local Development)

**Prerequisites:** Node.js 18+, Google Chrome, AWS credentials configured locally (`aws configure`) so the backend can reach DynamoDB and verify Cognito tokens, a deployed Cognito User Pool (see `infra/`), a free [Groq API key](https://console.groq.com/keys)

```bash
# 1. Clone the repo
git clone <repo-url>
cd EnglishPal

# 2. Set up the backend
cd server
npm install
# add to server/.env: COGNITO_USER_POOL_ID=..., COGNITO_CLIENT_ID=...
npm run dev            # runs on http://localhost:3000

# 3. Set up the frontend (new terminal)
cd client
npm install
# create client/.env.local with:
#   VITE_API_URL=http://localhost:3000
#   VITE_COGNITO_USER_POOL_ID=...
#   VITE_COGNITO_CLIENT_ID=...
npm run dev            # runs on http://localhost:5173
```

There's no local Cognito emulator — both the client SDK and the server's JWT verification talk to the real deployed User Pool, so the IDs above have to come from an actual `cdk deploy` (its `UserPoolIdOutput`/`UserPoolClientIdOutput`, or `aws cognito-idp` / the Cognito console).

Open `http://localhost:5173` in **Google Chrome**. Sign up, confirm the emailed verification code, then log in. On a new account's first visit the onboarding wizard walks you through getting and entering your Groq key — it's stored in your browser's `localStorage` and sent only as a request header, never persisted server-side. You can also set or update it anytime via the **⚙️ API Key** button.

> Note: `server/.env` and `client/.env.local` are both git-ignored. Never commit your API key or Cognito IDs.

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

### Onboarding
New users see a 3-step wizard on first visit — a quick intro to the app, help getting a free Groq key (prefilled if one is already saved), and a ready screen. Replayable anytime via the **❓ How it works** button in the header.

### Authentication
Sign up and log in via AWS Cognito through a custom form (not Cognito's Hosted UI), so the experience stays visually consistent with the rest of the app. Every route requires a valid session — sessions, history, and the dashboard are all private to your account. Log out anytime via the header button.

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

### Phase 3 — AWS Cognito Authentication ✅
- [x] Onboarding flow for new users
- [x] User authentication (AWS Cognito, custom login/signup UI)
- [x] Per-user data isolation (sessions scoped to the authenticated user, not a shared partition)
- [x] Route guard — the whole app requires login, no anonymous usage
- [x] Logout

### Phase 4 — Planned
- [ ] Lambda runtime upgrade (Node.js 20.x → 22.x/24.x) ahead of AWS's deprecation timeline
- [ ] More accurate feedback reports against raw, uncapitalized/unstructured speech-to-text transcripts
- [ ] Forgot password flow

---

_Personal project — not intended for public use during active development._
