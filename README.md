# 🔗 Team Research Links

A collaborative web app for sharing, discovering, and upvoting research resources within your team. Built with vanilla HTML/CSS/JS and Firebase Firestore for real-time data sync.

## ✨ Features

- **Real-time sync** — links appear instantly across all browsers via Firestore
- **Upvoting** — surface the best resources by popular vote
- **Search & filter** — find links by title, category, or description
- **Toast notifications** — non-intrusive success/error feedback
- **XSS protection** — all user input is sanitized before rendering
- **Responsive dark-mode UI** — glassmorphism design that looks great on any device

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/Team-links.git
cd Team-links
```

### 2. Set up Firebase config

```bash
cp config.example.js config.js
```

Open `config.js` and replace the placeholder values with your [Firebase project credentials](https://console.firebase.google.com/).

> **Note:** `config.js` is listed in `.gitignore` and will NOT be committed.

### 3. Open in a browser

Open `index.html` directly, or use a local server:

```bash
npx serve .
```

## 🔒 Firestore Security Rules

Since this is a client-side app, **Firestore Security Rules** are your real protection. In the [Firebase Console → Firestore → Rules](https://console.firebase.google.com/), set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /links/{linkId} {
      // Anyone can read
      allow read: if true;

      // Anyone can create, but must include required fields
      allow create: if request.resource.data.keys().hasAll(['title', 'url', 'votes'])
                    && request.resource.data.votes == 0;

      // Only allow incrementing votes
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['votes'])
                    && request.resource.data.votes == resource.data.votes + 1;

      // No deletes
      allow delete: if false;
    }
  }
}
```

## 🌐 Deploy to GitHub Pages

1. Make sure `config.js` is **not** committed (check `.gitignore`).
2. Since GitHub Pages serves static files, you need `config.js` present on the deployed site. Two options:

   **Option A — Manual deploy:**
   Add `config.js` to the deployment branch only (not `main`). Use a `gh-pages` branch and copy `config.js` into it.

   **Option B — GitHub Actions (recommended):**
   Store your Firebase config values as [GitHub Repository Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets), then generate `config.js` at build time:

   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Generate config.js
           run: |
             cat > config.js << EOF
             export const firebaseConfig = {
               apiKey: "${{ secrets.FIREBASE_API_KEY }}",
               authDomain: "${{ secrets.FIREBASE_AUTH_DOMAIN }}",
               projectId: "${{ secrets.FIREBASE_PROJECT_ID }}",
               storageBucket: "${{ secrets.FIREBASE_STORAGE_BUCKET }}",
               messagingSenderId: "${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}",
               appId: "${{ secrets.FIREBASE_APP_ID }}"
             };
             EOF
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./
   ```

## 📄 License

MIT
