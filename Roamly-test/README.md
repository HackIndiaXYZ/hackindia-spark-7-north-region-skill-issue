<p align="center">
  <h1 align="center">🧭 ROAMLY — AI-Powered Travel Planner</h1>
  <p align="center"><strong>Plan Less. Roam More.</strong></p>
  <p align="center">
    An intelligent, full-stack travel itinerary generator that creates personalized, weather-aware, budget-conscious day-by-day plans for destinations across India — powered by Google's Gemini AI.
  </p>
</p>

---

## 🚀 Live Features

| Feature | Description |
|---|---|
| **AI Itinerary Generator** | Input origin, destination, dates, budget, vibe & transport mode → get a full multi-day plan in ~30 seconds |
| **Interactive Journey Map** | Leaflet-powered map plotting every event with route polylines across the itinerary |
| **Re-Plan on the Fly** | Don't like an event? Click "Re-plan" and the AI swaps it instantly with an alternative |
| **Surprise Me 🎲** | One-click AI-powered random hidden-gem destination discovery |
| **Near Me Right Now 📍** | Uses GPS geolocation to find nearby cafes, activities & hidden spots via AI |
| **Shareable Itinerary Links** | Generate a unique public URL for any plan — viewable without login |
| **Weather-Aware Planning** | Integrates OpenWeatherMap forecasts to schedule indoor/outdoor activities accordingly |
| **Explore India** | Browse 8 Indian states (32 destinations) with curated city cards linked to the planner |
| **Dynamic Live Counters** | Milestone stats fluctuate in real-time simulating a live data dashboard |

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI framework |
| **TypeScript** | Type-safe development |
| **Vite 8** | Lightning-fast dev server & bundler |
| **Tailwind CSS v4** | Utility-first styling (hybrid with custom CSS) |
| **React Router DOM v7** | Client-side routing & navigation |
| **Leaflet + React-Leaflet** | Interactive journey map rendering |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type-safe backend logic |
| **Google Gemini AI** (`@google/genai`) | Core LLM for itinerary, surprise, near-me, and re-plan generation |
| **Zod** | Runtime input validation & schema enforcement |
| **Axios** | HTTP client for external API calls |
| **UUID** | Unique plan ID generation for shareable links |
| **Nodemon** | Hot-reload during development |

### External APIs
| API | Usage |
|---|---|
| **Google Gemini API** | AI-powered itinerary generation, surprise destinations, near-me discovery, event re-planning |
| **Google Places API** | Geocoding destinations to lat/lng coordinates |
| **OpenWeatherMap API** | 5-day weather forecasts for destination-aware planning |

---

## 📁 Project Structure

```
Roamly-test/
├── src/                          # Frontend (React + Vite)
│   ├── pages/
│   │   ├── Landing.tsx           # Main landing page (hero, features, explore, milestones)
│   │   ├── Planner.tsx           # Trip planner form + itinerary display + map
│   │   ├── SharedItinerary.tsx   # Read-only shared plan viewer
│   │   ├── About.tsx             # About Us page
│   │   ├── Blog.tsx              # Blog articles page
│   │   ├── Careers.tsx           # Job listings page
│   │   ├── Press.tsx             # Press & media page
│   │   ├── HelpCenter.tsx        # FAQ & support page
│   │   ├── Safety.tsx            # Trust & safety page
│   │   └── Cancellation.tsx      # Cancellation policies page
│   ├── components/
│   │   ├── Navigation.tsx        # Global navbar with scroll-to-section logic
│   │   ├── Footer.tsx            # Global footer with routed links
│   │   ├── InteractiveJourneyMap.tsx  # Leaflet map with route & event markers
│   │   └── NearMeModal.tsx       # GPS-powered nearby discovery modal
│   ├── assets/                   # 50+ high-quality travel photos (cities, landscapes)
│   ├── App.tsx                   # Root component with all routes
│   └── index.css                 # Complete design system (~3000 lines)
│
├── backend/                      # Backend (Express + TypeScript)
│   ├── server.ts                 # Express server entry point
│   ├── routes/
│   │   └── itinerary.routes.ts   # All API route definitions
│   ├── controllers/
│   │   └── itinerary.controller.ts  # Request handlers & validation
│   ├── services/
│   │   ├── ai.service.ts         # Gemini AI integration (all AI functions)
│   │   ├── storage.service.ts    # In-memory plan storage (Map-based)
│   │   ├── places.service.ts     # Google Places geocoding
│   │   └── weather.service.ts    # OpenWeatherMap integration
│   ├── .env                      # API keys (GEMINI, PLACES, OPENWEATHER)
│   └── package.json              # Backend dependencies
│
└── package.json                  # Frontend dependencies
```

---

## 🔄 Data Flow & Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────────┐ │
│  │ Landing  │   │ Planner  │   │ SharedIt │   │ Info Pages  │ │
│  │  Page    │   │   Page   │   │ inerary  │   │ (7 pages)   │ │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └─────────────┘ │
│       │              │              │                           │
│  ┌────▼─────┐   ┌────▼─────┐   ┌────▼─────┐                   │
│  │Surprise  │   │Generate  │   │GET /plan │                   │
│  │Near Me   │   │Itinerary │   │/:planId  │                   │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘                   │
└───────┼──────────────┼──────────────┼──────────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express API)                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              itinerary.controller.ts                 │       │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────┐ │       │
│  │  │generate  │ │ replan   │ │surprise │ │near-me │ │       │
│  │  │Itinerary │ │ Event    │ │         │ │        │ │       │
│  │  └────┬─────┘ └────┬─────┘ └────┬────┘ └───┬────┘ │       │
│  └───────┼────────────┼────────────┼──────────┼──────┘       │
│          │            │            │          │               │
│  ┌───────▼────────────▼────────────▼──────────▼──────┐       │
│  │                 ai.service.ts                      │       │
│  │         Google Gemini AI + Structured Output       │       │
│  │           (with retry + backoff logic)             │       │
│  └────────────────────────────────────────────────────┘       │
│          │                    │                                │
│  ┌───────▼────────┐  ┌───────▼────────┐                      │
│  │ places.service │  │weather.service │                      │
│  │ (Google Places │  │(OpenWeatherMap)│                      │
│  │  Geocoding)    │  │  5-day forecast│                      │
│  └───────┬────────┘  └───────┬────────┘                      │
│          │                    │                                │
│  ┌───────▼────────────────────▼──────┐                       │
│  │          storage.service          │                       │
│  │     In-Memory Map<planId, Plan>   │                       │
│  └───────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Application Workflow

### 1. Trip Planning Flow
```
User fills form (origin, destination, dates, budget, vibe, transport)
        │
        ▼
POST /api/generate-itinerary
        │
        ├──► Google Places API → geocode destination → (lat, lng)
        │
        ├──► OpenWeatherMap API → 5-day forecast for those coordinates
        │
        ├──► Google Gemini AI → structured JSON itinerary generation
        │         (prompt includes weather context, budget, vibe constraints)
        │         (response enforced via Zod schema + Gemini responseSchema)
        │
        ├──► Storage Service → save plan with UUID → planId
        │
        └──► Return full plan JSON to frontend
                │
                ▼
        Frontend renders:
        ├── Interactive Leaflet Map (markers + route polylines)
        ├── Day-by-day timeline with event cards
        ├── Transport logistics sidebar
        └── Share button (generates /shared/:planId URL)
```

### 2. Re-Plan Event Flow
```
User clicks "Re-plan" on any event card
        │
        ▼
POST /api/replan-event { planId, eventIdToReplace, rejectionReason }
        │
        ├──► Lookup plan from storage
        ├──► Find target event in the day's events array
        ├──► Gemini AI generates a single alternative event
        │         (same time slot, budget, geography — but different)
        ├──► Replace event in-memory and persist
        └──► Return updated plan to frontend (instant UI update)
```

### 3. Surprise Me Flow
```
User clicks "Surprise Me 🎲" on landing page
        │
        ▼
GET /api/surprise
        │
        ├──► Gemini AI picks a random hidden-gem Indian destination
        │         based on current season, weather, festivals
        │
        └──► Returns { destination, description, placesToVisit, vibe }
                │
                ▼
        Modal displays result with "Plan This Trip →" button
        (auto-fills planner with destination + vibe)
```

### 4. Near Me Flow
```
User clicks "📍 Near Me Right Now"
        │
        ├──► Browser Geolocation API → (lat, lng)
        │
        ▼
POST /api/near-me { lat, lng }
        │
        ├──► Gemini AI identifies neighborhood from coordinates
        ├──► Returns 3 best cafes + 3 fun nearby activities
        │
        └──► Modal displays results with descriptions
```

### 5. Shareable Link Flow
```
User clicks "🔗 Share This Journey"
        │
        ├──► Copies URL: /shared/:planId to clipboard
        │
        ▼
Recipient opens link → GET /api/plan/:planId
        │
        ├──► Fetches plan from in-memory storage
        └──► SharedItinerary.tsx renders read-only view (no login required)
```

---

## 🎨 Design System

The UI follows a **dark industrial aesthetic** with consistent design tokens:

| Token | Value | Usage |
|---|---|---|
| `--black` | `#0A0A0A` | Primary background |
| `--concrete` | `#2C2C2C` | Card backgrounds |
| `--industrial-red` | `#E63946` | Primary accent, CTAs |
| `--industrial-orange` | `#FF6B35` | Secondary accent, highlights |
| `--white` | `#F5F5F5` | Primary text |
| `--light-gray` | `#B0B0B0` | Secondary text |
| `--border` | `#3A3A3A` | Card borders |

**Typography:** Bebas Neue (headings), Work Sans (body)  
**Signature Elements:** Clipped corners (clip-path), gradient accent bars, subtle grid-pattern overlays  
**Animations:** Hero photo slideshow, hover state transitions, milestone counter fluctuation, radar/globe loading animations

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v18+ and **npm**
- API Keys: Google Gemini, Google Places, OpenWeatherMap

### 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd Roamly-test

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment Variables

Create/edit `backend/.env`:

```env
PORT=8080
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_PLACES_API_KEY=your_places_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
```

### 3. Run Development Servers

```bash
# Terminal 1 — Frontend (Vite dev server)
npm run dev
# → http://localhost:5173

# Terminal 2 — Backend (Express + Nodemon)
cd backend && npx nodemon server.ts
# → http://localhost:8080
```

---

## 🛣️ API Reference

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `POST` | `/api/generate-itinerary` | Generate full AI itinerary | `{ origin, destination, transportMode, startDate, endDate, budget, vibe }` |
| `POST` | `/api/replan-event` | Replace a single event | `{ planId, eventIdToReplace, rejectionReason? }` |
| `GET` | `/api/surprise` | Random hidden-gem destination | — |
| `POST` | `/api/near-me` | Nearby cafes & activities | `{ lat, lng }` |
| `GET` | `/api/plan/:planId` | Fetch a saved plan | — |
| `GET` | `/health` | Server health check | — |

---

## 🛡️ Key Technical Decisions

1. **Structured AI Output** — Gemini's `responseSchema` parameter enforces strict JSON structure with Zod validation on the backend, eliminating parsing failures.

2. **Exponential Backoff Retry** — The AI service retries failed Gemini calls with `2^attempt × 2000ms` delays, gracefully handling rate limits and transient errors.

3. **In-Memory Storage** — Plans are stored in a `Map<string, Plan>` for simplicity. Suitable for demos; production would use a database.

4. **Hybrid CSS Strategy** — Custom CSS handles the design system (3000+ lines) while Tailwind provides utility-level flexibility where needed.

5. **Client-Side Routing** — React Router DOM with custom `scrollToSection` logic enables smooth cross-page anchor navigation.

6. **Weather-Aware AI Prompting** — Real weather data is injected directly into the Gemini prompt, so the AI schedules indoor activities on rainy days.

---

## 👥 Team

Built with ❤️ by the Roamly team.

---

<p align="center"><em>Plan Less. Roam More. 🧭</em></p>
