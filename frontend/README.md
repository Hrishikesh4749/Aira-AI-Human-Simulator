# Aira — Human AI Simulator (Frontend)

A premium, emotionally-expressive chat frontend for the Aira backend — built to feel like texting a real person, not a chatbot.

## Stack

React · Vite · React Router · Axios · Tailwind CSS v4 · Framer Motion · Lucide Icons · React Hot Toast · React Markdown

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Point it at your backend

Copy the example env file and set the backend URL:

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:8000
```

Start the FastAPI backend separately (`uvicorn main:app --reload --port 8000`) — CORS is already enabled for all origins in `main.py`.

## What's wired to the real backend

The backend (`main.py`) currently exposes exactly two endpoints, and this frontend only calls those two — nothing is invented:

| Method | Path        | Request               | Response               |
| ------ | ----------- | ---------------------- | ------------------------ |
| POST   | `/chat`     | `{ "text": string }`   | `{ "reply": string }`    |
| GET    | `/initiate` | —                       | `{ "reply": string }`    |

See `src/services/chatService.js`.

- **Chat page** sends every message to `POST /chat` and renders `reply` as Markdown (with syntax-highlighted, copyable code blocks).
- **Proactive initiations**: after ~90 seconds of inactivity on the Chat page, the frontend calls `GET /initiate` and drops Aira's message into the thread — a real use of the backend's proactive-initiation feature, not a simulation.

## What's stubbed, and why

The brief also calls for a mood indicator and a Developer Mode panel showing mood, relationship state, personality state, retrieved memories/episodes, and prompt stats. The backend computes all of this internally on every `/chat` call, but **only ever returns `{ reply }`** — there's no endpoint that exposes `ai_state`, `relationship_state`, `personality_state`, memories, or episodes to a client.

Rather than invent endpoints or fake the data, every one of those spots is marked directly in code, e.g.:

```js
// TODO Backend Endpoint: GET /debug/mood -> ai_state (...)
```

See `src/services/devService.js`. The Developer Mode page (`src/pages/DeveloperPage.jsx`) and the top bar's mood badge are fully built and will populate automatically the moment matching endpoints are added — no other frontend code needs to change.

## Project structure

```
src/
  components/
    layout/   Sidebar, TopBar, MobileNav, AppShell, PageTransition
    chat/     ChatBubble, ChatInput, TypingIndicator, MarkdownMessage, DayDivider
    ui/       Button, Card, Toggle, Badge, AiraOrb, EmptyState
  context/    ChatContext, SettingsContext
  hooks/      useAutoScroll, useLocalStorage, useConnectionStatus
  pages/      LandingPage, ChatPage, SettingsPage, AboutPage, DeveloperPage, NotFoundPage
  services/   api.js, chatService.js, devService.js
  utils/      cn.js, formatTime.js, mood.js
  styles/     index.css (design tokens + Tailwind)
```

## Design

- Background `#0E0E11`, cards `#17171C`, accents pink `#FF7EB6` and violet `#8B5CF6` — defined as CSS variables in `src/styles/index.css` under `@theme`.
- Signature element: `AiraOrb`, a breathing gradient orb standing in for Aira across the sidebar, top bar, chat avatar, and landing hero.
- Fonts: **Outfit** for display/headings, **Inter** for body text, **JetBrains Mono** for code.
- Motion via Framer Motion throughout: page transitions, message entrances, typing indicator, hover/tap feedback, sidebar active-tab morphing.
- Fully responsive: collapsible desktop sidebar, bottom tab bar on mobile.

## Developer Mode

Toggle **Settings → Developer mode** to reveal a hidden `/developer` route in the sidebar with a panel per internal system. Until the backend adds debug endpoints, each panel shows an honest "not implemented yet" state instead of fabricated data.
