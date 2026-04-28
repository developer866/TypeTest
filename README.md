# ⌨️ Typing Speed Test

A real-time typing speed test built with Next.js, Firebase Auth, Firestore, and Firebase Realtime Database. Players can test their WPM and accuracy across multiple difficulty levels — with or without an account. Signed-in users have their personal best saved to a live leaderboard.

🔗 **Live:** [your-deployed-url.vercel.app](https://typing-test-blond-mu.vercel.app/)

---

## Features

- Real-time WPM and accuracy tracking as you type
- Character-by-character colour feedback — green correct, red wrong
- Three difficulty levels — Easy, Medium, Hard
- Timed modes (60s / 30s) and Passage mode
- Google Sign-In — guests can play, signed-in users save scores
- Scores stored in Firestore (full history per user)
- Personal best synced to Firebase Realtime Database
- Live leaderboard — updates in real time for all users
- Google profile picture shown in navbar and leaderboard
- Tab to restart at any time

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication (Google) |
| Score history | Firebase Firestore |
| Leaderboard | Firebase Realtime Database |
| Deployment | Vercel |

---

## Project Structure

```
├── app/
│   ├── layout.jsx              # Root layout — wraps Navbar
│   ├── page.jsx                # Home page
│   └── leaderboard/
│       └── page.jsx            # Live leaderboard
├── components/
│   ├── Navbar.jsx              # Dynamic navbar (guest vs signed-in)
│   ├── Result.jsx              # Results screen with Firebase save
│   └── Stats.jsx               # Live stats bar (WPM, accuracy, timer)
├── lib/
│   └── Firebase.js             # Firebase init — Auth, Firestore, RTDB
├── utils/
│   ├── auth.js                 # useAuth hook
│   ├── scores.js               # saveScore, updateLeaderboard, getLeaderboard
│   └── utils.js                # getRandom, renderText, formatTime
└── .env.local                  # Firebase config (not committed)
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/developer866/your-repo-name.git
cd your-repo-name
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

Get these values from: **Firebase Console → Project Settings → Your Apps → SDK setup and config**

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Firebase Setup

### Authentication
```
Firebase Console → Build → Authentication → Sign-in method → Google → Enable
```

### Firestore
```
Firebase Console → Build → Firestore Database → Create database → Production mode
```

Firestore security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.data.uid == request.auth.uid;
    }
  }
}
```

### Realtime Database
```
Firebase Console → Build → Realtime Database → Create database → Choose region
```

Realtime Database rules:
```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      "$uid": {
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## Deployment (Vercel)

```bash
# Push to GitHub, then connect repo in Vercel dashboard
# Add all NEXT_PUBLIC_ environment variables in:
# Vercel → Project → Settings → Environment Variables
```

---

## Author

**Ayeni Opeyemi** — Frontend Developer, Lagos Nigeria 🇳🇬

- GitHub: [@developer866](https://github.com/developer866)
- LinkedIn: [ayeni-opeyemi](https://www.linkedin.com/in/ayeni-opeyemi/)
- Portfolio: [portfolio-nu-six-65.vercel.app](https://portfolio-nu-six-65.vercel.app)

---

## License

MIT — free to use and modify.