# 🌿 BreatheWise — Urban Air Quality Intelligence Assistant

> **Hack2Skill PromptWars Challenge 6** — Full-stack AI-powered Urban Air Quality Assistant  
> Rank: Top 400 of 54,010 participants | Score: 91.84/100

[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-100%2B%20passed-brightgreen)]()
[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-36%20passed-brightgreen)]()
[![Python](https://img.shields.io/badge/Python-3.11-blue)]()
[![React](https://img.shields.io/badge/React-18-blue)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)]()
[![License](https://img.shields.io/badge/License-MIT-gray)]()

---

## 🎯 Problem Statement

Urban air pollution is a critical public health crisis. This application helps residents:

1. **Understand** real-time and historical air quality data for their city
2. **Protect** their health with AI-powered, AQI-aware recommendations
3. **Navigate** their city using low-emission route alternatives
4. **Improve** indoor air quality with personalized guidance
5. **Track** personal sustainability actions and their estimated impact
6. **Connect** with community pollution observations
7. **Stay informed** with severity-graded pollution alerts

---

## ✨ Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Smart AQI Dashboard** | Live AQI gauge, 6-pollutant breakdown, 7-day trend chart, health guidance, AQI scale reference | ✅ Complete |
| **AI Pollution Assistant** | Context-aware conversational AI with location + AQI awareness; multi-provider (OpenAI/Gemini/Anthropic) + fallback | ✅ Complete |
| **Low-Emission Route Planner** | 4 transport modes ranked by CO₂, pollution exposure, calories; emissions comparison chart | ✅ Complete |
| **Indoor Air Quality Advisor** | Personalized tips by dwelling type + concern area; AI-enhanced recommendations | ✅ Complete |
| **Sustainability Recommendations** | Toggleable eco-actions across 4 categories; estimated CO₂ savings; achievement tracking | ✅ Complete |
| **Pollution Alerts** | Severity-graded (critical/high/moderate/low) alerts from real/demo AQI; seasonal advisories | ✅ Complete |
| **Community Insights** | Submit and view local pollution observations with AQI estimates, tags, timestamps | ✅ Complete |
| **Impact Tracker** | Log eco-actions; visualize weekly trends; trees-equivalent CO₂ display | ✅ Complete |

---

## 🏗 Architecture

```
challange6/
├── frontend/                    # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/       # AQIGauge, AQITrendChart, PollutantCard, AQIScaleReference
│   │   │   ├── layout/          # Sidebar, Header, Layout
│   │   │   └── ui/              # Badge, EmptyState, ErrorBoundary, LoadingSpinner, SkeletonCard, Toast
│   │   ├── pages/               # 8 feature pages (Dashboard, AIAssistant, RoutePlanner, …)
│   │   ├── context/             # ThemeContext, LocationContext, AlertContext
│   │   ├── hooks/               # useAirQuality, useLocalStorage, useDebounce
│   │   ├── services/            # Axios API client with interceptors
│   │   ├── utils/               # aqi.js, format.js, sanitize.js
│   │   └── tests/               # Vitest + Testing Library
│   └── public/                  # favicon, 404.html (SPA routing)
│
├── backend/                     # FastAPI + SQLAlchemy + aiosqlite
│   └── app/
│       ├── api/                 # 7 REST routers (air_quality, ai_routes, routes, alerts, community, sustainability, impact)
│       ├── core/                # config.py (pydantic-settings), security.py (sanitization)
│       ├── database/            # Async SQLite engine + session factory
│       ├── models/              # SQLAlchemy ORM models
│       ├── schemas/             # Pydantic v2 request/response schemas with validators
│       └── services/            # ai_service.py (3 providers + fallback), aqi_service.py (WAQI + demo)
│
├── .env.example                 # Environment variable template (no secrets)
├── .gitignore                   # Excludes .env, node_modules, dist, __pycache__, *.db
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+

### 1. Clone the repository

```bash
git clone https://github.com/Gowtham280103/Airqualitychallangesix.git
cd Airqualitychallangesix
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env          # copy and edit with your API keys (optional)
python -m uvicorn app.main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/api/docs`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

> **The app works fully without any API keys** — demo/fallback mode is always active.

---

## 🔑 Environment Variables

Copy `.env.example` to `backend/.env` and fill in the values you have.  
**Never commit `.env` to version control.**

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_PROVIDER` | No | `openai` / `gemini` / `anthropic` / `fallback` (default: `fallback`) |
| `OPENAI_API_KEY` | Optional | GPT-4o-mini AI responses |
| `GOOGLE_AI_API_KEY` | Optional | Gemini 1.5 Flash AI responses |
| `ANTHROPIC_API_KEY` | Optional | Claude 3 Haiku AI responses |
| `WAQI_API_KEY` | Optional | Real AQI data from [aqicn.org](https://aqicn.org/api/) |
| `OPENWEATHER_API_KEY` | Optional | Weather context data |
| `APP_ENV` | No | `development` / `production` (default: `development`) |
| `SECRET_KEY` | No | 32+ character random string for production |
| `DATABASE_URL` | No | SQLite path (default: `sqlite:///./breathewise.db`) |
| `ALLOWED_ORIGINS` | No | CORS origins (default: `http://localhost:5173`) |

---

## 🧰 Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.1 | Build tool and dev server |
| Tailwind CSS | 3.4 | Utility-first CSS |
| React Router | 6.22 | Client-side routing |
| Recharts | 2.12 | AQI trend and impact charts |
| Axios | 1.6 | HTTP client with interceptors |
| Lucide React | 0.344 | Consistent icon set |
| date-fns | 3.3 | Date formatting |
| Vitest + Testing Library | 1.3 | Unit and component tests |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.110 | Async REST API framework |
| Pydantic v2 | 2.6 | Schema validation and settings |
| SQLAlchemy | 2.0 | Async ORM |
| aiosqlite | 0.20 | Async SQLite driver |
| httpx | 0.27 | Async HTTP client for external APIs |
| OpenAI SDK | 1.14 | GPT integration |
| google-generativeai | 0.4 | Gemini integration |
| Anthropic SDK | 0.20 | Claude integration |
| Pytest + pytest-asyncio | 8.0 | Backend test suite |

---

## 🧪 Running Tests

### Frontend (100+ tests)
```bash
cd frontend
npm test                    # run once
npm run test:watch          # watch mode
npm run test:coverage       # with coverage report
```

### Backend (36 tests)
```bash
cd backend
python -m pytest tests/ -v
python -m pytest tests/ -v --cov=app    # with coverage
```

---

## 🔒 Security

| Practice | Implementation |
|----------|---------------|
| **Secrets management** | All API keys in environment variables; `.env` in `.gitignore` |
| **Input validation** | Pydantic v2 strict validators on every endpoint; field-length limits |
| **Input sanitization** | HTML stripping + control-character removal on all user text inputs |
| **SQL injection** | Prevented via SQLAlchemy ORM with parameterized queries only |
| **XSS prevention** | User content sanitized before storage; no `dangerouslySetInnerHTML` |
| **CORS** | Restricted to configured origins; credentials disabled |
| **Rate limiting** | Per-IP rate limiting on AI endpoints (20 req/min) |
| **Error handling** | Internal stack traces never exposed in API responses |
| **City name sanitization** | Backend and frontend independently strip non-alphabetic characters |

---

## ♿ Accessibility (WCAG 2.2 AA)

- Semantic HTML with correct heading hierarchy (h1 → h2 → h3)
- All interactive elements have `aria-label` or visible labels
- Keyboard-navigable sidebar, forms, and all buttons
- ARIA live regions on dynamic content (AQI updates, chat responses)
- Color is never the sole status indicator — labels always accompany color
- `prefers-reduced-motion` media query support
- Screen-reader text alternatives for all SVG charts
- Visible focus indicators on all focusable elements
- Role, aria-pressed, aria-expanded used correctly throughout

---

## 🌐 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health and configuration status |
| `/api/air-quality/current?city={city}` | GET | Current AQI + 6 pollutants + weather |
| `/api/air-quality/history?city={city}&days={n}` | GET | Historical AQI data (1–30 days) |
| `/api/air-quality/forecast?city={city}` | GET | Short-range AQI forecast (illustrative) |
| `/api/ai/chat` | POST | AI conversational assistant with AQI context |
| `/api/ai/recommendations` | POST | Personalised sustainability recommendations |
| `/api/ai/indoor-advice` | POST | Indoor air quality action plan |
| `/api/routes/plan` | POST | Low-emission route comparison (4 modes) |
| `/api/alerts?city={city}` | GET | Severity-graded pollution alerts |
| `/api/community/observations?city={city}` | GET | Community pollution reports |
| `/api/community/observations` | POST | Submit a pollution observation |
| `/api/community/trends?city={city}` | GET | Local pollution trend insights |
| `/api/sustainability/recommendations` | GET | AQI-aware eco-action recommendations |
| `/api/sustainability/log-action` | POST | Log a sustainable action |
| `/api/sustainability/impact` | GET | Aggregated impact metrics |
| `/api/impact/summary` | GET | Detailed impact summary by user session |
| `/api/impact/weekly-trends` | GET | 4-week weekly trend breakdown |

Full interactive docs: `http://localhost:8000/api/docs`

---

## 📊 Evaluation Criteria Coverage

| Criterion | Implementation |
|-----------|---------------|
| **Code Quality** | Modular components; business logic separated from UI; shared hooks and utilities; consistent naming; JSDoc on all utilities |
| **Security** | Env vars; Pydantic v2 validation; CORS; rate limiting; XSS/injection prevention; no secrets in code |
| **Efficiency** | 5-minute AQI cache; lazy page loading; memoized callbacks; optimized SQL queries; no redundant renders |
| **Testing** | 100+ frontend + 36 backend tests covering components, utils, APIs, security, edge cases, loading/error states |
| **Accessibility** | WCAG AA semantics; ARIA; keyboard nav; focus indicators; reduced motion; screen-reader chart alternatives |
| **Problem Alignment** | AQI dashboard with scale reference; AI assistant; route planner; indoor advisor; alerts; sustainability; community; impact tracker — all 8 features fully implemented |

---

## ⚠️ Known Limitations

- Route planner provides distance/emission **estimates** (no live mapping API integrated)
- AQI data uses **plausible demo values** without a WAQI API key — not real measurements
- AI responses use a **rule-based fallback** without an AI provider API key
- Community observations stored in a local SQLite file (not shared across instances)
- Forecast is illustrative, not a meteorological prediction model

---

## 🚢 Deployment

### Frontend (GitHub Pages)
The frontend is deployed automatically via GitHub Actions on push to `main`.  
Live URL: `https://gowtham280103.github.io/Airqualitychallangesix/`

### Backend (self-hosted)
GitHub Pages only serves static files. For a live backend:

```bash
# Production startup
APP_ENV=production uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Configure `ALLOWED_ORIGINS` to your frontend domain and `VITE_API_BASE_URL` in the frontend `.env`.

---

*Built with ❤️ for Hack2Skill PromptWars Challenge 6*
