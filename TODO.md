# 📋 Focs PWA - TODO Checklist

## ⏳ Currently Running
- [ ] npm install (in progress...)

---

## 🚀 After npm install completes:

### 1. Test Locally
```bash
cd C:\Users\hp\focs
npm run dev
```
- [ ] Dev server starts successfully
- [ ] Visit http://localhost:5173
- [ ] Landing page loads with dark theme
- [ ] "Connect Email + Calendar" button visible

### 2. Test Authentication
- [ ] Click "Connect Email + Calendar"
- [ ] Google OAuth popup appears
- [ ] Sign in with Google account
- [ ] Grant Gmail + Calendar permissions
- [ ] Redirected back to app
- [ ] Brief starts generating

### 3. Test Brief View
- [ ] Daily brief displays
- [ ] See date header (e.g., "Thursday, January 9")
- [ ] AI summary appears
- [ ] Email items listed
- [ ] Calendar events listed
- [ ] Checkboxes work (click to complete)
- [ ] Items turn green when completed

### 4. Test Settings
- [ ] Click settings icon (top right)
- [ ] Settings panel slides in from right
- [ ] AI Summaries toggle works
- [ ] Notifications toggle works
- [ ] Privacy info displays
- [ ] Sign out button works

### 5. Test Other Features
- [ ] Click refresh icon
- [ ] Brief regenerates
- [ ] Responsive design (resize window)
- [ ] Smooth animations
- [ ] No console errors

---

## 🔧 Firebase Setup (Required Before Deployment)

### Firestore Database
- [ ] Go to https://console.firebase.google.com
- [ ] Select project "focs-3bbc5"
- [ ] Click "Firestore Database"
- [ ] Click "Create database"
- [ ] Choose "Start in test mode"
- [ ] Select location (closest to you)
- [ ] Click "Enable"

### Firestore Rules (Update After Testing)
- [ ] Go to Firestore → Rules tab
- [ ] Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
- [ ] Click "Publish"

### Authentication
- [ ] Go to Authentication → Sign-in method
- [ ] Verify "Google" is enabled
- [ ] Check authorized domains includes:
  - localhost
  - focs-3bbc5.firebaseapp.com

---

## 🌐 Google Cloud Setup (Verify)

### APIs Enabled
- [ ] Go to https://console.cloud.google.com
- [ ] Select your project
- [ ] APIs & Services → Library
- [ ] Verify "Gmail API" is enabled
- [ ] Verify "Google Calendar API" is enabled

### OAuth Consent Screen
- [ ] APIs & Services → OAuth consent screen
- [ ] Add test users (your email)
- [ ] Verify scopes include:
  - Gmail readonly
  - Calendar readonly

### OAuth Credentials
- [ ] APIs & Services → Credentials
- [ ] Click your OAuth 2.0 Client ID
- [ ] Verify Authorized redirect URIs:
  - http://localhost:5173/auth/callback
  - http://localhost:5173

---

## 🚢 Deploy to Vercel

### Install Vercel CLI
```bash
npm install -g vercel
```
- [ ] Vercel CLI installed

### Login to Vercel
```bash
vercel login
```
- [ ] Logged in to Vercel

### Deploy
```bash
cd C:\Users\hp\focs
vercel
```
- [ ] Project deployed to preview URL
- [ ] Note the preview URL

### Deploy to Production
```bash
vercel --prod
```
- [ ] Deployed to production
- [ ] Note production URL (e.g., focs.vercel.app)

### Add Environment Variables
- [ ] Go to Vercel Dashboard
- [ ] Select "focs" project
- [ ] Settings → Environment Variables
- [ ] Add all variables from `.env`:
  - VITE_FIREBASE_API_KEY
  - VITE_FIREBASE_AUTH_DOMAIN
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_STORAGE_BUCKET
  - VITE_FIREBASE_MESSAGING_SENDER_ID
  - VITE_FIREBASE_APP_ID
  - VITE_FIREBASE_MEASUREMENT_ID
  - VITE_GOOGLE_CLIENT_ID
  - VITE_GOOGLE_CLIENT_SECRET
  - VITE_GEMINI_API_KEY
- [ ] Select: Production, Preview, Development
- [ ] Click Save for each

### Redeploy After Adding Variables
```bash
vercel --prod
```
- [ ] Redeployed with environment variables

---

## 🔗 Update OAuth Redirect URIs (After Deployment)

### Google Cloud Console
- [ ] Go to https://console.cloud.google.com
- [ ] APIs & Services → Credentials
- [ ] Click OAuth 2.0 Client ID
- [ ] Add Authorized redirect URIs:
  - https://focs.vercel.app/auth/callback
  - https://focs.vercel.app
- [ ] Click Save

### Firebase Console
- [ ] Go to https://console.firebase.google.com
- [ ] Authentication → Sign-in method → Google
- [ ] Add Authorized domain:
  - focs.vercel.app
- [ ] Click Save

---

## ✅ Test Production Deployment

### Visit Production URL
- [ ] Go to https://focs.vercel.app
- [ ] Landing page loads
- [ ] Click "Connect Email + Calendar"
- [ ] Google OAuth works
- [ ] Brief generates successfully
- [ ] All features work
- [ ] No console errors

---

## 📱 Install as PWA

### Desktop (Chrome/Edge)
- [ ] Visit https://focs.vercel.app
- [ ] Look for install icon in address bar
- [ ] Click "Install"
- [ ] App opens in standalone window
- [ ] Find icon in Start Menu (Windows) or Applications (Mac)
- [ ] Launch from desktop

### Mobile (Optional)
- [ ] Visit on mobile browser
- [ ] iOS: Share → Add to Home Screen
- [ ] Android: Menu → Install app
- [ ] Launch from home screen

---

## 🎉 Final Checks

### Functionality
- [ ] Authentication works
- [ ] Brief generates correctly
- [ ] Email items display
- [ ] Calendar events display
- [ ] Checkboxes work
- [ ] Settings panel works
- [ ] Refresh works
- [ ] Sign out works

### Performance
- [ ] Page loads quickly (<2s)
- [ ] Animations are smooth
- [ ] No lag or stuttering
- [ ] Works offline (after first load)

### Design
- [ ] Matches screenshots exactly
- [ ] Dark theme looks good
- [ ] Typography is clean
- [ ] Spacing is correct
- [ ] Responsive on all screen sizes

---

## 📚 Documentation Review

- [ ] Read README.md
- [ ] Read QUICKSTART.md
- [ ] Read DEPLOYMENT.md
- [ ] Read SETUP_COMPLETE.md
- [ ] Understand project structure

---

## 🎯 Optional Enhancements

### Custom Domain (Optional)
- [ ] Purchase domain
- [ ] Add to Vercel
- [ ] Update DNS
- [ ] Update OAuth URIs

### Analytics (Optional)
- [ ] Enable Vercel Analytics
- [ ] Monitor Firebase Analytics
- [ ] Track user engagement

### Monitoring (Optional)
- [ ] Set up error tracking
- [ ] Monitor API usage
- [ ] Check Firebase quotas

---

## 🔒 Security Checklist

- [ ] `.env` not committed to Git
- [ ] `.gitignore` includes `.env`
- [ ] Firestore rules restrict access
- [ ] OAuth credentials secure
- [ ] API keys not exposed in client code
- [ ] HTTPS enabled (Vercel does this)

---

## 📊 Success Metrics

After 1 week of use:
- [ ] Used daily for morning brief
- [ ] Completed items tracked
- [ ] No errors or crashes
- [ ] PWA installed and working
- [ ] Notifications working (if enabled)

---

## 🆘 If Something Goes Wrong

### Local Development Issues
1. Check terminal for errors
2. Check browser console
3. Verify `.env` file
4. Clear cache: `rm -rf node_modules && npm install`
5. Restart dev server

### Deployment Issues
1. Check Vercel deployment logs
2. Verify environment variables
3. Check OAuth redirect URIs
4. Test locally first
5. Redeploy: `vercel --prod --force`

### Authentication Issues
1. Check OAuth credentials
2. Verify redirect URIs
3. Check Firebase settings
4. Clear browser cookies
5. Try incognito mode

---

## ✨ You're Done When...

✅ Local development works perfectly  
✅ Deployed to Vercel successfully  
✅ PWA installs on desktop  
✅ Authentication works  
✅ Brief generates correctly  
✅ All features functional  
✅ No errors in console  
✅ Using it daily!  

---

**Current Status:** ⏳ Waiting for npm install to complete...

**Next Step:** Run `npm run dev` and start testing!

---

**Good luck! You've got this! 🚀**
