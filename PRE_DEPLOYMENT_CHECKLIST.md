# 📋 Pre-Deployment Checklist for Focs PWA

## ✅ Current Status
- ✅ Development server running at `http://localhost:5173`
- ✅ Landing page updated with new text
- ✅ Feature cards removed
- ✅ CSS error fixed

---

## 🧪 STEP 1: Test Locally (REQUIRED)

### Open the App
1. Open your browser
2. Visit: `http://localhost:5173`
3. You should see the updated landing page

### Test Landing Page
- [ ] Dark theme displays correctly
- [ ] "focs." logo visible
- [ ] "One screen. Zero chaos." headline
- [ ] New description text: "Your day, sorted. Automatically..."
- [ ] "Connect Email + Calendar" button visible
- [ ] No feature cards at bottom (removed)
- [ ] Smooth animations work

### Test Authentication
- [ ] Click "Connect Email + Calendar"
- [ ] Google OAuth popup appears
- [ ] Sign in with your Google account
- [ ] Grant permissions for Gmail + Calendar
- [ ] Redirected back to app
- [ ] No errors in browser console (F12)

### Test Brief View
- [ ] Brief starts generating after login
- [ ] Loading state displays
- [ ] Date header appears (e.g., "Thursday, January 9")
- [ ] AI summary displays
- [ ] Email items listed (if you have emails)
- [ ] Calendar events listed (if you have events today)
- [ ] Checkboxes work (click to complete)
- [ ] Items turn green when completed
- [ ] Refresh icon works
- [ ] Settings icon works

### Test Settings Panel
- [ ] Click settings icon (top right)
- [ ] Panel slides in from right
- [ ] AI Summaries toggle works
- [ ] Notifications toggle works
- [ ] Privacy information displays
- [ ] Sign out button works
- [ ] Close button works

### Check for Errors
- [ ] Open browser console (F12)
- [ ] No red errors
- [ ] No authentication errors
- [ ] No API errors

---

## 🔥 STEP 2: Firebase Setup (CRITICAL)

### 2.1 Enable Firestore Database

**Why:** Your app needs Firestore to store user data, briefs, and settings.

**Steps:**
1. Go to https://console.firebase.google.com
2. Select project "focs-3bbc5"
3. Click "Firestore Database" in left menu
4. Click "Create database"
5. Choose "Start in test mode" (for now)
6. Select location: Choose closest to you (e.g., us-central1)
7. Click "Enable"
8. Wait for database to be created (~1 minute)

### 2.2 Update Firestore Rules

**Why:** Secure your database so only authenticated users can access their own data.

**Steps:**
1. In Firestore, click "Rules" tab
2. Replace the rules with:
```javascript
ules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}r
```
3. Click "Publish"
4. Confirm the rules are published

### 2.3 Verify Authentication

**Steps:**
1. Go to "Authentication" in Firebase Console
2. Click "Sign-in method" tab
3. Verify "Google" is **Enabled** (should have green checkmark)
4. Click on "Google" provider
5. Under "Authorized domains", verify these are listed:
   - `localhost`
   - `focs-3bbc5.firebaseapp.com`
6. If not, add them and save

---

## 🌐 STEP 3: Google Cloud Verification

### 3.1 Verify APIs are Enabled

**Steps:**
1. Go to https://console.cloud.google.com
2. Select your project (should be linked to Firebase)
3. Go to "APIs & Services" → "Library"
4. Search "Gmail API" → Verify it shows "API enabled"
5. Search "Google Calendar API" → Verify it shows "API enabled"

### 3.2 Verify OAuth Credentials

**Steps:**
1. Go to "APIs & Services" → "Credentials"
2. Find your OAuth 2.0 Client ID
3. Click on it to edit
4. Under "Authorized redirect URIs", verify:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173`
5. If missing, add them and save

### 3.3 Add Test Users (If App is in Testing)

**Steps:**
1. Go to "APIs & Services" → "OAuth consent screen"
2. Scroll to "Test users"
3. Add your email address
4. Click "Save"

---

## 🎨 STEP 4: UI Verification (Screenshots Match)

### Compare with Your Screenshots
- [ ] Dark theme matches (#0a0a0a background)
- [ ] Typography looks clean and minimal
- [ ] Floating window design on brief page
- [ ] Checkboxes have green accent when completed
- [ ] Settings panel slides smoothly
- [ ] Animations are smooth (not janky)
- [ ] Responsive on different screen sizes

### If UI Doesn't Match
Let me know what needs to be adjusted:
- Colors
- Spacing
- Font sizes
- Component layout
- Animations

---

## 📦 STEP 5: Build Test (Before Deployment)

### Test Production Build Locally

**Steps:**
```bash
# Stop dev server (Ctrl+C in terminal)
cd C:\Users\hp\focs
npm run build
```

**Expected Output:**
```
✓ built in XXXXms
dist/index.html                   X.XX kB
dist/assets/index-XXXXX.css      XX.XX kB
dist/assets/index-XXXXX.js      XXX.XX kB
```

**If Build Fails:**
- Check terminal for errors
- Fix any TypeScript errors
- Fix any import errors
- Run `npm run build` again

### Preview Production Build

```bash
npm run preview
```

**Steps:**
1. Visit `http://localhost:4173`
2. Test authentication
3. Test brief generation
4. Verify everything works

**If Preview Works:** ✅ Ready to deploy!

---

## 🚀 STEP 6: Deploy to Vercel

### 6.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 6.2 Login to Vercel

```bash
vercel login
```

Choose your login method (GitHub, GitLab, Email, etc.)

### 6.3 Deploy

```bash
cd C:\Users\hp\focs
vercel
```

**Follow Prompts:**
- Set up and deploy? → **Yes**
- Which scope? → **Your account**
- Link to existing project? → **No**
- Project name? → **focs**
- Directory? → **./** (press Enter)
- Override settings? → **No**

**Wait for deployment...**

You'll get a preview URL like: `https://focs-xxx.vercel.app`

### 6.4 Add Environment Variables to Vercel

**CRITICAL:** Your app won't work without these!

**Option A: Via Dashboard (Recommended)**
1. Go to https://vercel.com/dashboard
2. Select "focs" project
3. Go to "Settings" → "Environment Variables"
4. Add each variable from your `.env` file:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
VITE_GEMINI_API_KEY=your_gemini_api_key
```

5. For each variable, select: **Production**, **Preview**, **Development**
6. Click "Save"

**Option B: Via CLI**
```bash
vercel env add VITE_FIREBASE_API_KEY
# Paste value, select Production/Preview/Development
# Repeat for all 10 variables
```

### 6.5 Redeploy with Environment Variables

```bash
vercel --prod
```

Your app will be live at: `https://focs.vercel.app` (or similar)

---

## 🔗 STEP 7: Update OAuth Redirect URIs (CRITICAL)

### 7.1 Get Your Vercel URL

After deployment, note your production URL (e.g., `https://focs.vercel.app`)

### 7.2 Update Google Cloud Console

**Steps:**
1. Go to https://console.cloud.google.com
2. "APIs & Services" → "Credentials"
3. Click your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", **ADD**:
   ```
   https://focs.vercel.app/auth/callback
   https://focs.vercel.app
   ```
5. Click "Save"

### 7.3 Update Firebase Authorized Domains

**Steps:**
1. Go to https://console.firebase.google.com
2. Select "focs-3bbc5"
3. "Authentication" → "Sign-in method" → "Google"
4. Under "Authorized domains", **ADD**:
   ```
   focs.vercel.app
   ```
5. Click "Save"

---

## ✅ STEP 8: Test Production Deployment

### Test Your Live App

1. Visit your Vercel URL: `https://focs.vercel.app`
2. Test complete flow:
   - [ ] Landing page loads
   - [ ] Click "Connect Email + Calendar"
   - [ ] Google OAuth works
   - [ ] Grant permissions
   - [ ] Brief generates
   - [ ] All features work
   - [ ] No console errors

### If OAuth Fails
- Double-check redirect URIs in Google Cloud
- Verify authorized domains in Firebase
- Check environment variables in Vercel
- Redeploy: `vercel --prod`

---

## 📱 STEP 9: Install as PWA

### Desktop Installation

**Chrome/Edge:**
1. Visit `https://focs.vercel.app`
2. Look for install icon in address bar (⊕ or computer icon)
3. Click "Install"
4. App opens in standalone window
5. Find icon in Start Menu (Windows) or Applications (Mac)

**Firefox:**
- Limited PWA support, use Chrome/Edge

### Mobile Installation

**iOS (Safari):**
1. Visit site on iPhone/iPad
2. Tap Share button
3. Tap "Add to Home Screen"
4. Name it "Focs"
5. Tap "Add"

**Android (Chrome):**
1. Visit site on Android
2. Tap menu (3 dots)
3. Tap "Install app"
4. Confirm installation

---

## 🎉 STEP 10: Final Verification

### Checklist
- [ ] Local testing complete (all features work)
- [ ] Firestore database enabled
- [ ] Firestore rules updated
- [ ] Firebase Authentication verified
- [ ] Google Cloud APIs enabled
- [ ] OAuth credentials verified
- [ ] Production build successful
- [ ] Deployed to Vercel
- [ ] Environment variables added to Vercel
- [ ] OAuth redirect URIs updated
- [ ] Firebase authorized domains updated
- [ ] Production site tested
- [ ] PWA installs successfully
- [ ] No errors in production

---

## 🐛 Common Issues & Solutions

### Issue: "OAuth Error" on Production
**Solution:** Update redirect URIs in Google Cloud Console

### Issue: "Firestore Permission Denied"
**Solution:** Update Firestore rules to allow authenticated users

### Issue: "Brief doesn't generate"
**Solution:** Check environment variables in Vercel, verify API keys

### Issue: "PWA doesn't install"
**Solution:** Ensure HTTPS (Vercel provides this), check manifest.json

### Issue: "Build fails"
**Solution:** Run `npm run build` locally, fix errors, redeploy

---

## 📊 What You'll Have After Completion

✅ **Fully functional PWA** at `https://focs.vercel.app`  
✅ **Installable desktop app** (Windows/Mac)  
✅ **Mobile app** (iOS/Android via PWA)  
✅ **Google OAuth** working  
✅ **Gmail + Calendar** integration  
✅ **AI-powered briefs** (Gemini)  
✅ **Offline support**  
✅ **Secure & private**  

---

## 🆘 Need Help?

If you encounter any issues:
1. Check browser console for errors
2. Check Vercel deployment logs
3. Verify all credentials are correct
4. Test locally first
5. Let me know the specific error!

---

**Ready to deploy? Follow these steps in order! 🚀**
