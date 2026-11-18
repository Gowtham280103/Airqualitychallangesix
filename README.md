# 🌿 BreatheWise — Urban Air Quality Intelligence Assistant

> **Hack2Skill PromptWars Challenge 6** — Full-stack GenAI-powered air quality application

[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-86%20passed-brightgreen)]()
[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-25%20passed-brightgreen)]()
[![Python](https://img.shields.io/badge/Python-3.11-blue)]()
[![React](https://img.shields.io/badge/React-18-blue)]()

---

## 🏗 Architecture

```
challange6/
├── frontend/          # React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── components/   # Reusable UI + dashboard components
│       ├── pages/        # 8 feature pages
│       ├── context/      # Theme, Location, Alert providers
│       ├── hooks/        # useAirQuality, useLocalStorage, useDebounce
│       ├── services/     # Axios API service layer
│       ├── utils/        # AQI helpers, sanitization, formatting
│       └── tests/        # Vitest + Testing Library (86 tests)
│
├── backend/           # FastAPI + SQLAlchemy + aiosqlite
│   └── app/
│       ├── api/          # 7 REST API routers
│       ├── core/         # Config + security utilities
│       ├── database/     # Async SQLite setup
│       ├── models/       # SQLAlchemy models
│       ├── schemas/      # Pydantic v2 request/response schemas
│       ├── services/     # AI service (3 providers + fallback), AQI service
│       └── tests/        # Pytest + httpx (25 tests)
│
├── .env.example       # Environment variable template
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Smart AQI Dashboard** | Live AQI gauge, 6 pollutants, 7-day trend chart, health guidance |
| **AI Pollution Assistant** | Context-aware chat with location + AQI awareness; fallback mode |
| **Low-Emission Route Planner** | 4 transport modes ranked by CO₂, pollution exposure, calories |
| **Indoor Air Quality Advisor** | Personalized tips by dwelling type + concern area |
| **Sustainability Recommendations** | Toggleable eco-actions with estimated CO₂ savings |
| **Pollution Alerts** | Severity-graded alerts generated from real/demo AQI data |
| **Community Insights** | Submit and view local pollution observations |
| **Impact Tracker** | Log eco-actions; visualize weekly trends |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+

### 1. Clone / enter the project
```bash
cd challange6
```

### 2. Backend setup
```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env   # edit if you have API keys
python -m uvicorn app.main:app --reload --port 8000
```
Backend runs at: `http://localhost:8000`  
API docs: `http://localhost:8000/api/docs`

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173` (or next available port)

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` in the `backend/` folder.

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_PROVIDER` | No | `openai` / `gemini` / `anthropic` / `fallback` (default) |
| `OPENAI_API_KEY` | Optional | For GPT-4o-mini AI responses |
| `GOOGLE_AI_API_KEY` | Optional | For Gemini 1.5 Flash AI responses |
| `ANTHROPIC_API_KEY` | Optional | For Claude AI responses |
| `WAQI_API_KEY` | Optional | Real AQI data from [aqicn.org](https://aqicn.org/api/) |
| `ALLOWED_ORIGINS` | No | CORS origins (default: localhost:5173) |

**The app works fully without any API keys** — demo/fallback mode is always available.

---

## 🧪 Running Tests

### Frontend (86 tests)
```bash
cd frontend
npm test               # run once
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
```

### Backend (25 tests)
```bash
cd backend
python -m pytest tests/ -v
python -m pytest tests/ -v --cov=app  # with coverage
```

---

## 🔒 Security

- All secrets in environment variables — no keys in code
- Pydantic v2 strict input validation on every endpoint
- HTML stripping + length limits on all user inputs
- CORS restricted to configured origins only
- Per-IP rate limiting on AI endpoints (20 req/min)
- SQL injection prevented via SQLAlchemy ORM with parameterized queries
- Error responses never expose internal stack traces
- XSS prevention: all user content sanitized before storage and display

---

## ♿ Accessibility

- WCAG 2.2 AA compliant structure
- Semantic HTML with proper heading hierarchy (h1→h2→h3)
- All interactive elements have visible focus indicators
- ARIA labels on all icons, charts, and status elements
- Keyboard-navigable sidebar and all forms
- Color is never the sole indicator of status (labels always accompany color)
- `prefers-reduced-motion` media query support
- Screen-reader text alternatives for all charts

---

## 🌐 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/air-quality/current?city=Delhi` | GET | Current AQI + pollutants |
| `/api/air-quality/history?city=Delhi&days=7` | GET | Historical AQI data |
| `/api/ai/chat` | POST | AI conversation |
| `/api/ai/indoor-advice` | POST | Personalized indoor tips |
| `/api/routes/plan` | POST | Low-emission route comparison |
| `/api/alerts?city=Delhi` | GET | Pollution alerts |
| `/api/community/observations?city=Delhi` | GET | Community reports |
| `/api/community/observations` | POST | Submit observation |
| `/api/sustainability/recommendations` | GET | Eco recommendations |
| `/api/health` | GET | Server health check |

Full interactive docs: `http://localhost:8000/api/docs`

---

## 📊 Evaluation Criteria Coverage

| Criterion | Implementation |
|-----------|---------------|
| **Code Quality** | Modular components, separation of concerns, service abstraction, no duplicate code |
| **Security** | Env vars, Pydantic validation, CORS, rate limiting, XSS/injection prevention |
| **Efficiency** | Cache layer for AQI calls, lazy page loading, memoized callbacks, optimized queries |
| **Testing** | 86 frontend + 25 backend tests covering components, utils, APIs, security, validation |
| **Accessibility** | WCAG AA semantics, ARIA, keyboard nav, focus indicators, reduced motion |
| **Problem Alignment** | AQI dashboard, AI assistant, route planner, indoor advisor, alerts, sustainability, community, impact tracker |

---

## ⚠️ Known Limitations

- Route planner provides distance/emission **estimates** (no live mapping API integrated)
- AQI data uses **demo values** without a WAQI API key — values are plausible but not real measurements
- AI responses use a **rule-based fallback** without an AI provider API key
- Community observations are stored in a local SQLite database (not shared across instances)

---

## 🚢 Deployment Notes

For production deployment:
1. Set `APP_ENV=production` in `.env`
2. Set a strong `SECRET_KEY` (32+ random characters)
3. Set `ALLOWED_ORIGINS` to your frontend domain
4. Use a production WSGI server: `uvicorn app.main:app --workers 4`
5. Build frontend: `npm run build` → serve `dist/` via nginx or CDN
6. Replace SQLite with PostgreSQL by updating `DATABASE_URL`

---

*Built with ❤️ for Hack2Skill PromptWars Challenge 6*
