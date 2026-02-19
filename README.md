# 🔗 Team Research Links

A collaborative web app for sharing, discovering, and upvoting research resources within your team. Built with vanilla HTML/CSS/JS and Firebase Firestore for real-time data sync.

## ✨ Features

- **Real-time sync** — links appear instantly across all browsers via Firestore
- **Upvoting** — surface the best resources by popular vote
- **Search & filter** — find links by title, category, or description
- **Toast notifications** — non-intrusive success/error feedback
- **XSS protection** — all user input is sanitized before rendering
- **Responsive dark-mode UI** — glassmorphism design that looks great on any device

## 🚀 Quick Start (Local Development)

1. **Clone the repo**

   ```bash
   git clone https://github.com/<your-username>/Team-links.git
   cd Team-links
   ```

2. **Create `config.js`** from the template:

   ```bash
   cp config.example.js config.js
   ```

   Fill in your [Firebase credentials](https://console.firebase.google.com/). This file is gitignored.

3. **Open `index.html`** in your browser or run `npx serve .`

## 🌐 Deploy to GitHub Pages

Deployment is handled automatically via **GitHub Actions**. Your Firebase keys are injected at build time from encrypted **Repository Secrets** — they never appear in the source code.

### One-time setup:

1. Go to your repo → **Settings → Secrets and variables → Actions**
2. Add these **Repository Secrets**:

   | Secret Name                    | Value                               |
   | ------------------------------ | ----------------------------------- |
   | `FIREBASE_API_KEY`             | Your Firebase API key               |
   | `FIREBASE_AUTH_DOMAIN`         | e.g. `your-project.firebaseapp.com` |
   | `FIREBASE_PROJECT_ID`          | e.g. `your-project`                 |
   | `FIREBASE_STORAGE_BUCKET`      | e.g. `your-project.appspot.com`     |
   | `FIREBASE_MESSAGING_SENDER_ID` | Your sender ID                      |
   | `FIREBASE_APP_ID`              | Your app ID                         |

3. Go to **Settings → Pages → Source** → select **GitHub Actions**
4. Push to `main` — the workflow will auto-deploy!

## 🔒 Firestore Security Rules

Apply these rules in [Firebase Console → Firestore → Rules](https://console.firebase.google.com/):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /links/{linkId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasAll(['title', 'url', 'votes'])
                    && request.resource.data.votes == 0;
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['votes'])
                    && request.resource.data.votes == resource.data.votes + 1;
      allow delete: if false;
    }
  }
}
```

## 📄 License

MIT
