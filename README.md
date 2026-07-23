# EnglishPal

> **Status: Active Development — Phase 1 (Local)**
> Not yet a deployable application. This document reflects the current plan and progress.

A personal AI-powered English voice assistant for improving vocabulary, fluency, and speaking confidence through real conversations — with structured feedback after every session.

---

## Motivation

Built for a Filipino software engineer preparing to work abroad and communicate confidently with foreign colleagues and clients. The goal is to practice speaking freely in either casual or professional English, and receive honest, specific feedback on grammar, vocabulary, and clarity — not mid-conversation, but as a review after each session.

---

## How It Works

1. Choose a conversation mode — **Casual** or **Formal**
2. Press to talk — speak freely, the app transcribes in real time
3. The AI responds in text and voice
4. End the session — the AI generates a structured feedback report covering:
    - Grammar mistakes with corrections
    - Better vocabulary choices
    - Filler words used (uh, like, basically, you know...)
    - Clarity score (1–10)
    - Top 3 things to improve

Past sessions and notes are saved locally so you can track progress over time.

---

## Tech Stack

| Layer           | Technology                   | Notes                                       |
| --------------- | ---------------------------- | ------------------------------------------- |
| Frontend        | React 19 + Vite + TypeScript | Component-based UI                          |
| Styling         | Tailwind CSS v4              | Utility-first, Vite plugin                  |
| Speech Input    | Web Speech API (browser)     | Chrome/Edge only, no API key needed         |
| Speech Output   | Web Speech Synthesis API     | Browser-native TTS                          |
| AI Model        | Groq — Llama 3.1 8B Instant  | Free tier: 14,400 req/day, 6,000 tokens/min |
| Backend         | Node.js + Express            | API layer, keeps Groq key off the client    |
| Local Storage   | SQLite via better-sqlite3    | Phase 1 — file-based, no server needed      |
| Cloud (Phase 2) | AWS DynamoDB + S3 + Amplify  | Free tier, planned migration                |

---

## Project Structure

```
EnglishPal/
├── client/                   # React frontend
│   └── src/
│       ├── hooks/            # useSpeechRecognition, useSpeechSynthesis
│       ├── components/       # ModeSelector, VoiceInput, Transcript, SessionNotes
│       └── pages/            # Home, Session, History
│
├── server/                   # Express backend
│   └── src/
│       ├── routes/           # /chat (Groq), /sessions (SQLite)
│       ├── db/               # SQLite setup and queries
│       └── prompts/          # system prompts per mode
│
├── englishpal_plan.md        # Full project plan and decisions
└── README.md
```

---

## Getting Started (Development)

**Prerequisites:** Node.js 18+, Google Chrome, a [Groq API key](https://console.groq.com)

```bash
# 1. Clone the repo
git clone <repo-url>
cd EnglishPal

# 2. Set up the backend
cd server
cp .env.example .env        # then add your GROQ_API_KEY
npm install
npm run dev                 # runs on http://localhost:3000

# 3. Set up the frontend (new terminal)
cd client
npm install
npm run dev                 # runs on http://localhost:5173
```

Open `http://localhost:5173` in **Google Chrome**.

> Note: `.env` is git-ignored. Never commit your API key.

---

## Roadmap

### Phase 1 — Local MVP

- [x] Project scaffolding (React + Express + TypeScript)
- [x] Voice input/output hooks (Web Speech API)
- [x] Groq conversation integration
- [ ] Mode selector (Casual / Formal)
- [ ] End-of-session feedback report
- [ ] Session history with SQLite

### Phase 2 — AWS

- [ ] AWS DynamoDB for session storage
- [ ] AWS Amplify deployment
- [ ] AI memory from past sessions for personalized coaching
- [ ] Progress dashboard

---

## Conversation Modes

**Casual** — relaxed, everyday topics. Like talking to a friend about life, hobbies, or tech.

**Formal** — professional scenarios. Meetings, code reviews, job interviews, client calls, status updates.

The AI does not correct grammar mid-conversation — it responds naturally to keep the flow. Corrections come in the feedback report at the end.

---

_Personal project — not intended for public use during active development._
