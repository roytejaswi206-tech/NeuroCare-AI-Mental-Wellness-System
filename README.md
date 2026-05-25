<<<<<<< HEAD
# NeuroCare

**AI-Based Mental Wellness Support System**
A BTech CSE (AI & ML) 4th Semester Micro Project.

> _This project is developed for educational purposes only and does not replace professional medical advice._

---

## What it does

NeuroCare is a simple wellness web app where students can:

- Create an account (email + password, or Google Sign-In)
- Log how they feel (mood + stress + an optional journal note)
- Get a gentle wellness suggestion based on a simple sentiment analysis
- View their last 7 days as a stress trend and mood distribution chart
- Browse short articles on Anxiety, Stress, Panic Attacks, Sleep, and Burnout
- See an emergency-help page with helplines and grounding steps

It is **not** a diagnosis tool, **not** a replacement for therapy, and the AI is
intentionally a simple rule-based classifier (TextBlob + VADER), not a deep
learning medical model.

---

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18 + Vite + Tailwind CSS + React Router |
| Charts   | Recharts |
| Backend  | Flask 3 + Flask-JWT-Extended + Flask-SQLAlchemy |
| Database | SQLite (file-based, no setup needed) |
| AI       | TextBlob + VADER Sentiment |
| Auth     | Flask JWT (primary) + Firebase Google Sign-In (optional) |
| Deploy   | Vercel (frontend) + Render (backend) |

---

## Project structure

```
NeuroCare-v2/
├── backend/
│   ├── app.py              # Flask entry point
│   ├── config.py           # Reads .env, exposes config constants
│   ├── seed.py             # Seeds wellness resources
│   ├── requirements.txt
│   ├── .env.example
│   ├── ai/
│   │   └── sentiment.py    # TextBlob + VADER, generates suggestions
│   ├── database/
│   │   └── __init__.py     # SQLAlchemy instance
│   ├── models/
│   │   ├── user.py
│   │   ├── mood.py
│   │   └── resource.py
│   └── routes/
│       ├── auth.py         # register / login / google / me
│       ├── moods.py        # create / list / stats
│       └── resources.py    # list / by-category
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── vercel.json
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── Disclaimer.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── GoogleSignInButton.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── services/
│       │   ├── api.js
│       │   └── firebase.js
│       ├── utils/
│       │   └── moods.js
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx
│           ├── MoodTracker.jsx
│           ├── History.jsx
│           ├── Resources.jsx
│           ├── ResourceCategory.jsx
│           ├── Emergency.jsx
│           └── NotFound.jsx
│
├── render.yaml             # Render deployment blueprint
└── README.md
```

---

## Database schema

**users**
| column | type | notes |
|---|---|---|
| id | INTEGER PK | |
| name | VARCHAR(80) | |
| email | VARCHAR(120) UNIQUE | indexed |
| password_hash | VARCHAR(255) | nullable (Google accounts have no local password) |
| auth_provider | VARCHAR(20) | `"local"` or `"google"` |
| created_at | DATETIME | |

**moods**
| column | type | notes |
|---|---|---|
| id | INTEGER PK | |
| user_id | INTEGER FK → users.id | indexed |
| mood | VARCHAR(30) | happy / calm / okay / tired / anxious / sad / angry / stressed |
| stress_level | INTEGER | 1 – 10 |
| note | TEXT | optional journal text |
| sentiment | VARCHAR(15) | positive / neutral / negative |
| sentiment_score | FLOAT | -1.0 .. +1.0 |
| suggestion | TEXT | generated wellness suggestion |
| created_at | DATETIME | indexed |

**resources**
| column | type | notes |
|---|---|---|
| id | INTEGER PK | |
| title | VARCHAR(120) | |
| category | VARCHAR(30) | anxiety / stress / panic / sleep / burnout |
| description | TEXT | |
| tips | TEXT | newline-separated |
| image | VARCHAR(255) | URL |

---

## AI logic (simple, viva-friendly)

When a user submits a journal note we run two classic sentiment libraries:

1. **VADER** (`vaderSentiment`) — rule-based, tuned for short / informal text.
2. **TextBlob** — naive Bayes trained on movie reviews.

We average their polarity scores into one number in `[-1, +1]` and label it:

```
score >=  0.15  →  positive
score <= -0.15  →  negative
otherwise       →  neutral
```

We combine the **stress level** (1–10) and the **sentiment label** to pick a
suggestion from a curated dictionary (see `backend/ai/sentiment.py`). This is
intentionally **rule-based, not ML-trained**, so it is easy to explain in viva:
"It is not a diagnosis. We just look at the tone of the note and the stress
level the user reported, and we show a calming tip that matches that bucket."

---

## Running locally

### Prerequisites
- **Node.js** 18+ (we used 24)
- **Python** 3.10+ (we used 3.14 in development)

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
cp .env.example .env           # then open .env and adjust if needed

python seed.py                 # creates SQLite DB + seeds resources
python app.py                  # runs on http://127.0.0.1:5000
```

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
cp .env.example .env.local     # default points to localhost:5000

npm run dev                    # runs on http://localhost:5173
```

Open `http://localhost:5173`, register an account, and log your first mood.

---

## Firebase Google Sign-In (optional)

If you want the "Continue with Google" button to work:

1. Create a Firebase project at <https://console.firebase.google.com>.
2. **Frontend**: enable Email/Password and Google providers under
   *Authentication → Sign-in method*. Then copy the Web config from
   *Project settings → General* and paste it into `frontend/.env.local`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_APP_ID=...
   ```
3. **Backend**: in *Project settings → Service accounts → Generate new
   private key*, download the JSON file, and point `.env` at it:
   ```
   FIREBASE_CREDENTIALS_PATH=C:/path/to/serviceAccount.json
   ```

Without these the Google button stays visible but disabled — local
email/password login keeps working.

---

## Deployment

### Frontend → Vercel

1. Push the repo to GitHub.
2. Import the repo in <https://vercel.com>.
3. Set the *Root Directory* to `frontend/`.
4. Add the env vars from `.env.example` in the Vercel dashboard. Replace
   `VITE_API_BASE_URL` with your Render backend URL (e.g.
   `https://neurocare-backend.onrender.com/api`).
5. Deploy. `vercel.json` already adds the SPA rewrite.

### Backend → Render

1. In Render, click **New → Blueprint** and select the repo (the
   `render.yaml` at repo root will be picked up automatically).
2. After the first deploy, update **CORS_ORIGINS** on Render to your Vercel
   URL (e.g. `https://neurocare.vercel.app`).
3. The free Render plan can sleep — first request after 15 min will be slow.

> SQLite on Render's free disk is **ephemeral**. For a real demo it's fine; for
> long-term use, switch `DATABASE_URL` to a Postgres add-on.

---

## Viva notes (how to present this project)

Keep it simple and honest. A suggested 5-minute walkthrough:

1. **Problem (30s)** – "Many students struggle with stress and anxiety but
   don't track how they feel day-to-day. NeuroCare gives them a small, calm
   way to do that."
2. **What it is (30s)** – "A React + Flask web app with SQLite. Users log a
   mood and a short note. A simple AI looks at the tone of the note and
   gives a wellness tip."
3. **Demo (2 min)** – Register → log a happy mood with a positive note → log
   a sad mood with a negative note → show the dashboard suggestion changes →
   show the history charts → show the resources and emergency pages.
4. **AI part (1 min)** – Open `backend/ai/sentiment.py`. Show that we use
   TextBlob + VADER, average their scores, and pick a suggestion from a
   dictionary indexed by stress level + sentiment. Emphasise it is
   rule-based and **not** a medical diagnosis.
5. **Code tour (1 min)** – Show `models/`, `routes/`, the React `pages/`
   folder. Point out that the structure mirrors what the spec asked for.

**Likely questions & short answers**

- *Why TextBlob + VADER and not BERT?* Lightweight, deterministic, runs
  instantly on free hosting, easy to explain in a 4th-semester project.
- *Is this a medical tool?* No. The disclaimer is on every page.
- *Where is the data stored?* SQLite, one file (`backend/neurocare.db`).
- *How is the password kept safe?* Hashed with `bcrypt` before storage.
- *Why JWT?* Stateless, easy to send from a React frontend in an
  `Authorization` header.

---

## Credits

- **TextBlob** – <https://textblob.readthedocs.io>
- **VADER Sentiment** – <https://github.com/cjhutto/vaderSentiment>
- **Recharts** – <https://recharts.org>
- Photographs from **Unsplash** (no attribution required).

Built by AI & ML undergraduate students for an academic micro project.
=======
# NeuroCare-AI-Mental-Wellness-System
AI-Based Mental Wellness Support System built using React, Firebase, Flask, TextBlob and VADER.
>>>>>>> 20ff3c1bcb0ae8214e94cf43a774cf36122fe3f9
