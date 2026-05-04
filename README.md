# 🥛 Swami Dairy Manager

A milk delivery management web app for Swami's dairy business.
Works perfectly on iPhone. Data stored in Firebase (cloud).

---

## 📋 SETUP STEPS (Do these ONE TIME)

---

### STEP 1 — Install tools on your computer

Install these if you don't have them:
- **Node.js**: https://nodejs.org (download LTS version)
- **Git**: https://git-scm.com/downloads
- **VS Code** (optional but helpful): https://code.visualstudio.com

---

### STEP 2 — Create Firebase project

1. Go to https://console.firebase.google.com
2. Click **"Add project"** → name it `swami-dairy`
3. Disable Google Analytics (not needed) → Click **Create project**
4. In the left sidebar, click **Firestore Database**
5. Click **Create database** → choose **Start in test mode** → pick any location (e.g. `asia-south1`) → Done
6. Now go to **Project Settings** (gear icon ⚙️ top left)
7. Scroll down to **"Your apps"** → click **`</>`** (Web app button)
8. Register app with name `swami-dairy-web` → click **Register app**
9. You'll see a config like this — **copy all these values**:
```
apiKey: "AIzaSy..."
authDomain: "swami-dairy-xxxxx.firebaseapp.com"
projectId: "swami-dairy-xxxxx"
storageBucket: "swami-dairy-xxxxx.appspot.com"
messagingSenderId: "123456789"
appId: "1:123456789:web:abcdef"
```

---

### STEP 3 — Set up this project on your computer

Open Terminal (Mac) or Command Prompt (Windows):

```bash
# Go to your Downloads or Desktop
cd ~/Desktop

# Clone or copy this project folder here
# (If you downloaded as ZIP, just unzip it on Desktop)

# Enter the project folder
cd swami-dairy

# Install all packages
npm install
```

---

### STEP 4 — Add your Firebase keys

1. In the `swami-dairy` folder, find the file called `.env.local.example`
2. Make a **copy** of it and rename the copy to `.env.local`
3. Open `.env.local` and fill in your Firebase values from Step 2:

```
REACT_APP_FIREBASE_API_KEY=AIzaSy...your key here...
REACT_APP_FIREBASE_AUTH_DOMAIN=swami-dairy-xxxxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=swami-dairy-xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=swami-dairy-xxxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

Save the file.

---

### STEP 5 — Test it locally

```bash
npm start
```

This opens the app at `http://localhost:3000` in your browser.
Check that everything works. Add a member, check attendance, etc.

---

### STEP 6 — Create GitHub repository

1. Go to https://github.com and sign in (or create account)
2. Click **"New repository"** (green button)
3. Name it: `swami-dairy`
4. Set to **Public**
5. Click **Create repository**
6. GitHub shows you commands — in your Terminal run:

```bash
git init
git add .
git commit -m "Initial commit - Swami Dairy App"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/swami-dairy.git
git push -u origin main
```

(Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username)

---

### STEP 7 — Add Firebase keys as GitHub Secrets

Your `.env.local` file is NOT uploaded to GitHub (it's in `.gitignore`).
So you need to add the Firebase keys as GitHub Secrets:

1. Go to your repo on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add each one:

| Secret Name | Value |
|---|---|
| `REACT_APP_FIREBASE_API_KEY` | your apiKey |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | your authDomain |
| `REACT_APP_FIREBASE_PROJECT_ID` | your projectId |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | your storageBucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | your messagingSenderId |
| `REACT_APP_FIREBASE_APP_ID` | your appId |

---

### STEP 8 — Enable GitHub Pages

1. In your GitHub repo, go to **Settings** → **Pages**
2. Under **Source** → select **"GitHub Actions"**
3. Click Save

Now every time you push code to GitHub, it auto-builds and deploys!

---

### STEP 9 — Edit package.json homepage

Open `package.json` and change this line:
```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/swami-dairy",
```
Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username, then:

```bash
git add .
git commit -m "Set homepage URL"
git push
```

Wait 2-3 minutes, then visit:
`https://YOUR_GITHUB_USERNAME.github.io/swami-dairy`

**Your app is live! 🎉**

---

### STEP 10 — Add to iPhone home screen

On iPhone (Safari):
1. Open the URL above
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Name it `Swami Dairy` → tap **Add**

Now it looks and works like a native app!

---

## 🔄 How to update the app later

Whenever you change code:
```bash
git add .
git commit -m "Your change description"
git push
```
GitHub Actions auto-builds and deploys in ~2 minutes.

---

## 📁 Project Structure

```
swami-dairy/
├── src/
│   ├── App.js              ← Main app with Firebase listeners
│   ├── App.css             ← All styles
│   ├── firebase.js         ← Firebase connection
│   ├── index.js            ← Entry point
│   └── components/
│       ├── Dashboard.js    ← Revenue/profit overview
│       ├── Members.js      ← Add/edit/delete members
│       ├── Attendance.js   ← Daily milk delivery tracking
│       ├── Bills.js        ← Monthly bills + PDF print
│       └── Expenses.js     ← Buffalo feed, medicine etc.
├── public/
│   ├── index.html
│   └── manifest.json       ← Makes it installable on iPhone
├── .github/workflows/
│   └── deploy.yml          ← Auto-deploy to GitHub Pages
├── .env.local.example      ← Template for Firebase keys
├── .gitignore
├── firestore.rules         ← Firebase security rules
└── package.json
```

---

## ❓ Troubleshooting

**App is blank / white screen?**
→ Check that all 6 Firebase keys are correct in `.env.local`

**"Permission denied" on Firestore?**
→ Go to Firebase Console → Firestore → Rules → paste contents of `firestore.rules`

**GitHub Actions build failed?**
→ Check that all 6 secrets are added in GitHub Settings → Secrets

**Changes not showing after push?**
→ Wait 2-3 minutes, then hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
